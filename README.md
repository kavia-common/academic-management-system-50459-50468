# academic-management-system-50459-50468

Frontend (student_management_frontend) is configured as a non-authenticated app. All primary pages (Dashboard, Students, Courses, Attendance, Settings) are publicly accessible and API base URL is read from environment (REACT_APP_API_BASE or REACT_APP_BACKEND_URL). No Authorization headers are sent by default.

## Backend wiring (API base URL and endpoints)

- Set REACT_APP_API_BASE (preferred) or REACT_APP_BACKEND_URL in the environment to point to your backend. Do not hardcode endpoints in code.
- Student API placeholders are implemented in `student_management_frontend/src/api/client.js` under `api.students`.
  - Default endpoint paths:
    - list: `/students`
    - create: `/students`
    - update: `/students/:id`
    - delete: `/students/:id`
  - You can adjust these paths by overriding `api.students.endpoints` during app initialization if needed.

Example `.env.local`:
```
REACT_APP_API_BASE=https://your-backend.example.com
REACT_APP_HEALTHCHECK_PATH=/health
```

The frontend will:
- Use `GET /students` to list students.
- Use `POST /students` to create a student with body `{ name, email?, class, section, rollNumber }`.
- Use `PUT /students/:id` to update the student.
- Use `DELETE /students/:id` to delete the student.

If no API base is configured, the app runs in client-only mode: student methods return mock-friendly results and state is handled locally with optimistic UI patterns and refetch fallbacks.