# academic-management-system-50459-50468

Frontend (student_management_frontend) is configured as a non-authenticated app. All primary pages (Dashboard, Students, Courses, Classes, Attendance, Exams, Marks, Results, Settings) are publicly accessible and API base URL is read from environment (REACT_APP_API_BASE or REACT_APP_BACKEND_URL). No Authorization headers are sent by default.

## Backend wiring (API base URL and endpoints)

- Set REACT_APP_API_BASE (preferred) or REACT_APP_BACKEND_URL in the environment to point to your backend. Do not hardcode endpoints in code.

### Student API placeholders
Implemented in `student_management_frontend/src/api/client.js` under `api.students`.
- Default endpoint paths:
  - list: `/students`
  - create: `/students`
  - update: `/students/:id`
  - delete: `/students/:id`
- You can adjust paths by overriding `api.students.endpoints` at runtime.

### Classes & Subjects API placeholders
Implemented in `student_management_frontend/src/api/client.js` under `api.classes`. These are placeholders ready to be wired to your backend.

Default endpoints (override at runtime to match your backend):
- Classes:
  - `listClasses`: `GET /classes`
  - `createClass`: `POST /classes` with `{ name, gradeLevel, description? }` => returns `{ id, ... }`
  - `updateClass`: `PUT /classes/:id`
  - `deleteClass`: `DELETE /classes/:id`
- Class subjects (subjects assigned to a class):
  - `listSubjects(classId)`: `GET /classes/:classId/subjects` => returns `[{ id, subjectId, subjectName?, teacherId?, teacherName? }]`
  - `createSubject(classId, payload)`: `POST /classes/:classId/subjects` (payload may be `{ subjectId, teacherId? }`)
  - `updateSubject(classId, classSubjectId, payload)`: `PUT /classes/:classId/subjects/:classSubjectId`
  - `deleteSubject(classId, classSubjectId)`: `DELETE /classes/:classId/subjects/:classSubjectId`
- Teachers:
  - `listTeachers`: `GET /teachers` => returns `[{ id, name }]`
  - `assignSubjectToClass(classId, { subjectId, teacherId? })`: `POST /classes/:classId/subjects`
  - `assignTeacherToSubjectInClass(classId, classSubjectId, teacherIdOrNull)`: `PUT /classes/:classId/subjects/:classSubjectId/teacher` with `{ teacherId: string | null }`

Typical payload shapes:
- Class create/update:
  ```
  { "name": "Class 10 A", "gradeLevel": "10", "description": "Optional" }
  ```
- Class subjects list item:
  ```
  { "id": "csub-1", "subjectId": "sub-101", "subjectName": "Mathematics", "teacherId": "t-1", "teacherName": "Alice Johnson" }
  ```
- Assign subject to class:
  ```
  { "subjectId": "sub-101", "teacherId": "t-1" } // teacherId optional
  ```
- Assign teacher to class subject:
  ```
  { "teacherId": "t-1" } // set to null or "" to unassign
  ```

To override endpoints at runtime:
```js
import { api } from './student_management_frontend/src/api/client';

api.classes.endpoints = {
  listClasses: '/v1/classes',
  createClass: '/v1/classes',
  updateClass: (id) => `/v1/classes/${id}`,
  deleteClass: (id) => `/v1/classes/${id}`,
  listSubjects: (classId) => `/v1/classes/${classId}/subjects`,
  createSubject: (classId) => `/v1/classes/${classId}/subjects`,
  updateSubject: (classId, classSubjectId) => `/v1/classes/${classId}/subjects/${classSubjectId}`,
  deleteSubject: (classId, classSubjectId) => `/v1/classes/${classId}/subjects/${classSubjectId}`,
  listTeachers: '/v1/teachers',
  assignSubjectToClass: (classId) => `/v1/classes/${classId}/subjects`,
  assignTeacherToSubjectInClass: (classId, classSubjectId) => `/v1/classes/${classId}/subjects/${classSubjectId}/teacher`,
};
```

### Exams/Marks/Results API placeholders
Implemented in `student_management_frontend/src/api/client.js` under `api.academics`. These are placeholders ready to be wired to your backend.
- Exams:
  - `listExams`: `GET /exams`
  - `createExam`: `POST /exams`
  - `updateExam`: `PUT /exams/:id`
  - `deleteExam`: `DELETE /exams/:id`
- Subjects and students for class & section:
  - `listSubjects`: `GET /subjects`
  - `listStudentsForClassSection(klass, section)`: `GET /classes/:class/sections/:section/students`
- Marks:
  - `listMarks({ examId, class, section })`: e.g. `GET /marks?examId=EXAM&class=10&section=A`
  - `upsertMarks(payload)`: `POST /marks` with `{ examId, class, section, subjectId, entries: [{ studentId, score, markId? }] }`
  - `deleteMark(markId)`: `DELETE /marks/:markId`
- Reports:
  - `getStudentReport(studentId, examId)`: e.g. `GET /reports/students/:studentId?examId=EXAM`

You can change these paths at runtime by overriding `api.academics.endpoints`.

Example `.env.local`:
```
REACT_APP_API_BASE=https://your-backend.example.com
REACT_APP_HEALTHCHECK_PATH=/health
```

If no API base is configured, the app runs in client-only mode:
- Students: local optimistic patterns.
- Exams/Subjects/Marks/Reports: minimal safe behavior (no persistence) and optimistic UI where applicable.
- Classes/Subjects/Teachers: minimal safe behavior (no persistence); class list starts empty, teachers get a small placeholder list.

## Grade calculation utilities
See `student_management_frontend/src/utils/grades.js`:
- Configurable thresholds (defaults: A ≥90, B ≥80, C ≥70, D ≥60, F).
- Helpers for per-student aggregates (total, average, percentage, grade) and class-level aggregates.

## Routes
- `/` Dashboard
- `/students` Students
- `/classes` Classes (CRUD, subject and teacher assignment)
- `/courses` Courses
- `/attendance` Attendance
- `/exams` Exams (CRUD)
- `/marks` Marks Entry (per class/section/exam/subject)
- `/results` Results/Reports (subject-wise and overall with CSV export)
- `/settings` Settings

## Wiring example (override endpoints)
```js
import { api } from './src/api/client';

api.academics.endpoints = {
  listExams: '/v1/exams',
  createExam: '/v1/exams',
  updateExam: (id) => `/v1/exams/${id}`,
  deleteExam: (id) => `/v1/exams/${id}`,
  listSubjects: '/v1/subjects',
  listStudentsForClassSection: (klass, section) => `/v1/classes/${klass}/sections/${section}/students`,
  listMarks: ({ examId, klass, section }) => `/v1/marks?examId=${examId}&class=${klass}&section=${section}`,
  upsertMarks: '/v1/marks',
  deleteMark: (markId) => `/v1/marks/${markId}`,
  getStudentReport: (studentId, examId) => `/v1/reports/students/${studentId}?examId=${examId}`,
};

// Classes override (example)
api.classes.endpoints = {
  listClasses: '/v1/classes',
  createClass: '/v1/classes',
  updateClass: (id) => `/v1/classes/${id}`,
  deleteClass: (id) => `/v1/classes/${id}`,
  listSubjects: (classId) => `/v1/classes/${classId}/subjects`,
  createSubject: (classId) => `/v1/classes/${classId}/subjects`,
  updateSubject: (classId, classSubjectId) => `/v1/classes/${classId}/subjects/${classSubjectId}`,
  deleteSubject: (classId, classSubjectId) => `/v1/classes/${classId}/subjects/${classSubjectId}`,
  listTeachers: '/v1/teachers',
  assignSubjectToClass: (classId) => `/v1/classes/${classId}/subjects`,
  assignTeacherToSubjectInClass: (classId, classSubjectId) => `/v1/classes/${classId}/subjects/${classSubjectId}/teacher`,
};
```
