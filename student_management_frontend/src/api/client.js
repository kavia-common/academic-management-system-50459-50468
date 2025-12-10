import { config } from '../config';

function buildUrl(path = '') {
  if (!config.baseUrl) return path; // allow relative use in dev if not configured
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${config.baseUrl}${normalized}`;
}

// Basic wrapper (no auth headers)
async function request(path, options = {}) {
  const url = buildUrl(path);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const resp = await fetch(url, { ...options, headers });
  const contentType = resp.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await resp.json() : await resp.text();
  if (!resp.ok) {
    const error = new Error('Request failed');
    error.status = resp.status;
    error.body = body;
    throw error;
  }
  return body;
}

// PUBLIC_INTERFACE
export const api = {
  /** Health check; does not throw if baseUrl is missing—returns a friendly message instead. */
  async healthCheck() {
    if (!config.baseUrl) {
      return { ok: true, message: 'No API base configured. Using client-only mode.' };
    }
    try {
      const path = config.healthPath || '/health';
      const data = await request(path, { method: 'GET' });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e?.message || 'health check failed' };
    }
  },
  // Placeholder helpers - ready to be wired to real endpoints later
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),

  // PUBLIC_INTERFACE
  students: {
    /**
     * Configurable endpoints for student APIs. Update these paths in your env/README wiring.
     * Defaults assume a RESTful convention under /students.
     */
    endpoints: {
      list: '/students',
      create: '/students',
      update: (id) => `/students/${encodeURIComponent(id)}`,
      delete: (id) => `/students/${encodeURIComponent(id)}`,
    },

    // PUBLIC_INTERFACE
    async listStudents() {
      if (!config.baseUrl) {
        // Client-only mode: return empty list by default
        return [];
      }
      return api.get(api.students.endpoints.list);
    },

    // PUBLIC_INTERFACE
    async createStudent(payload) {
      if (!config.baseUrl) {
        // Client-only mode: echo payload with generated id
        return { ...payload, id: `tmp-${Date.now()}` };
      }
      return api.post(api.students.endpoints.create, payload);
    },

    // PUBLIC_INTERFACE
    async updateStudent(id, payload) {
      if (!config.baseUrl) {
        // Client-only mode: return merged object
        return { id, ...payload };
      }
      const path = api.students.endpoints.update(id);
      return api.put(path, payload);
    },

    // PUBLIC_INTERFACE
    async deleteStudent(id) {
      if (!config.baseUrl) {
        return { ok: true, id };
      }
      const path = api.students.endpoints.delete(id);
      return api.del(path);
    },
  },

  // PUBLIC_INTERFACE
  academics: {
    /**
     * Endpoints are placeholders and should be overridden to match your backend.
     * Do not hardcode base URLs; they will be prefixed with REACT_APP_API_BASE/REACT_APP_BACKEND_URL.
     */
    endpoints: {
      // Exams CRUD
      listExams: '/exams',
      createExam: '/exams',
      updateExam: (id) => `/exams/${encodeURIComponent(id)}`,
      deleteExam: (id) => `/exams/${encodeURIComponent(id)}`,

      // Subjects and class-section helpers
      listSubjects: '/subjects',
      listStudentsForClassSection: (klass, section) =>
        `/classes/${encodeURIComponent(klass)}/sections/${encodeURIComponent(section)}/students`,

      // Marks
      listMarks: ({ examId, klass, section }) =>
        `/marks?examId=${encodeURIComponent(examId)}&class=${encodeURIComponent(klass)}&section=${encodeURIComponent(section)}`,
      upsertMarks: '/marks',
      deleteMark: (markId) => `/marks/${encodeURIComponent(markId)}`,

      // Reports
      getStudentReport: (studentId, examId) =>
        `/reports/students/${encodeURIComponent(studentId)}?examId=${encodeURIComponent(examId)}`,
    },

    // PUBLIC_INTERFACE
    async listExams() {
      if (!config.baseUrl) return [];
      return api.get(api.academics.endpoints.listExams);
    },

    // PUBLIC_INTERFACE
    async createExam(payload) {
      if (!config.baseUrl) return { ...payload, id: `tmp-${Date.now()}` };
      return api.post(api.academics.endpoints.createExam, payload);
    },

    // PUBLIC_INTERFACE
    async updateExam(id, payload) {
      if (!config.baseUrl) return { id, ...payload };
      const path = api.academics.endpoints.updateExam(id);
      return api.put(path, payload);
    },

    // PUBLIC_INTERFACE
    async deleteExam(id) {
      if (!config.baseUrl) return { ok: true, id };
      const path = api.academics.endpoints.deleteExam(id);
      return api.del(path);
    },

    // PUBLIC_INTERFACE
    async listSubjects() {
      if (!config.baseUrl) {
        // minimal default subjects in client-only mode
        return [
          { id: 'subj-eng', name: 'English' },
          { id: 'subj-math', name: 'Mathematics' },
          { id: 'subj-sci', name: 'Science' },
        ];
      }
      return api.get(api.academics.endpoints.listSubjects);
    },

    // PUBLIC_INTERFACE
    async listStudentsForClassSection(klass, section) {
      if (!config.baseUrl) {
        // client-only mode: return empty to avoid hard-coded data bleed
        return [];
      }
      const path = api.academics.endpoints.listStudentsForClassSection(klass, section);
      return api.get(path);
    },

    // PUBLIC_INTERFACE
    async listMarks({ examId, klass, section }) {
      if (!config.baseUrl) return []; // nothing persisted in client-only mode
      const path = api.academics.endpoints.listMarks({ examId, klass, section });
      return api.get(path);
    },

    // PUBLIC_INTERFACE
    async upsertMarks(payload) {
      /**
       * payload: { examId, class, section, subjectId, entries: [{ studentId, score, markId? }] }
       * Returns server result; client-only returns payload with fake ids for entries.
       */
      if (!config.baseUrl) {
        return {
          ...payload,
          entries: (payload.entries || []).map((e) => ({ ...e, markId: e.markId || `tmp-${e.studentId}-${Date.now()}` })),
        };
      }
      return api.post(api.academics.endpoints.upsertMarks, payload);
    },

    // PUBLIC_INTERFACE
    async deleteMark(markId) {
      if (!config.baseUrl) return { ok: true, markId };
      const path = api.academics.endpoints.deleteMark(markId);
      return api.del(path);
    },

    // PUBLIC_INTERFACE
    async getStudentReport(studentId, examId) {
      if (!config.baseUrl) {
        // Client-only: return empty report
        return { studentId, examId, marks: [], total: 0, average: 0, percentage: 0, grade: 'F' };
      }
      const path = api.academics.endpoints.getStudentReport(studentId, examId);
      return api.get(path);
    },
  },

  // PUBLIC_INTERFACE
  classes: {
    /**
     * Placeholder endpoints for classes and class-subject-teacher assignments.
     * Override these at runtime to match your backend paths.
     */
    endpoints: {
      listClasses: '/classes',
      createClass: '/classes',
      updateClass: (id) => `/classes/${encodeURIComponent(id)}`,
      deleteClass: (id) => `/classes/${encodeURIComponent(id)}`,

      listSubjects: (classId) => `/classes/${encodeURIComponent(classId)}/subjects`,
      createSubject: (classId) => `/classes/${encodeURIComponent(classId)}/subjects`,
      updateSubject: (classId, classSubjectId) => `/classes/${encodeURIComponent(classId)}/subjects/${encodeURIComponent(classSubjectId)}`,
      deleteSubject: (classId, classSubjectId) => `/classes/${encodeURIComponent(classId)}/subjects/${encodeURIComponent(classSubjectId)}`,

      listTeachers: '/teachers',
      assignSubjectToClass: (classId) => `/classes/${encodeURIComponent(classId)}/subjects`,
      assignTeacherToSubjectInClass: (classId, classSubjectId) => `/classes/${encodeURIComponent(classId)}/subjects/${encodeURIComponent(classSubjectId)}/teacher`,
    },

    // PUBLIC_INTERFACE
    async listClasses() {
      if (!config.baseUrl) {
        return []; // client-only: start empty
      }
      return api.get(api.classes.endpoints.listClasses);
    },

    // PUBLIC_INTERFACE
    async createClass(payload) {
      if (!config.baseUrl) {
        return { ...payload, id: `tmp-${Date.now()}` };
      }
      return api.post(api.classes.endpoints.createClass, payload);
    },

    // PUBLIC_INTERFACE
    async updateClass(id, payload) {
      if (!config.baseUrl) {
        return { id, ...payload };
      }
      const path = api.classes.endpoints.updateClass(id);
      return api.put(path, payload);
    },

    // PUBLIC_INTERFACE
    async deleteClass(id) {
      if (!config.baseUrl) {
        return { ok: true, id };
      }
      const path = api.classes.endpoints.deleteClass(id);
      return api.del(path);
    },

    // PUBLIC_INTERFACE
    async listSubjects(classId) {
      if (!config.baseUrl) {
        // client-only minimal: no subjects by default
        return [];
      }
      const path = api.classes.endpoints.listSubjects(classId);
      return api.get(path);
    },

    // PUBLIC_INTERFACE
    async createSubject(classId, payload) {
      if (!config.baseUrl) {
        return { ...payload, id: `csub-${Date.now()}` };
      }
      const path = api.classes.endpoints.createSubject(classId);
      return api.post(path, payload);
    },

    // PUBLIC_INTERFACE
    async updateSubject(classId, classSubjectId, payload) {
      if (!config.baseUrl) {
        return { id: classSubjectId, ...payload };
      }
      const path = api.classes.endpoints.updateSubject(classId, classSubjectId);
      return api.put(path, payload);
    },

    // PUBLIC_INTERFACE
    async deleteSubject(classId, classSubjectId) {
      if (!config.baseUrl) {
        return { ok: true, id: classSubjectId };
      }
      const path = api.classes.endpoints.deleteSubject(classId, classSubjectId);
      return api.del(path);
    },

    // PUBLIC_INTERFACE
    async listTeachers() {
      if (!config.baseUrl) {
        // client-only minimal teachers placeholder
        return [
          { id: 't-1', name: 'Alice Johnson' },
          { id: 't-2', name: 'Bob Smith' },
          { id: 't-3', name: 'Carlos Diaz' },
        ];
      }
      return api.get(api.classes.endpoints.listTeachers);
    },

    // PUBLIC_INTERFACE
    async assignSubjectToClass(classId, { subjectId, teacherId }) {
      /**
       * payload: { subjectId, teacherId? }
       * Returns class-subject record: { id, subjectId, subjectName?, teacherId?, teacherName? }
       */
      if (!config.baseUrl) {
        return {
          id: `csub-${Date.now()}`,
          subjectId,
          subjectName: undefined,
          teacherId: teacherId || '',
          teacherName: undefined,
        };
      }
      const path = api.classes.endpoints.assignSubjectToClass(classId);
      return api.post(path, { subjectId, teacherId });
    },

    // PUBLIC_INTERFACE
    async assignTeacherToSubjectInClass(classId, classSubjectId, teacherIdOrNull) {
      /**
       * payload: { teacherId: string | null }
       */
      if (!config.baseUrl) {
        return { ok: true, classSubjectId, teacherId: teacherIdOrNull || '' };
      }
      const path = api.classes.endpoints.assignTeacherToSubjectInClass(classId, classSubjectId);
      return api.put(path, { teacherId: teacherIdOrNull });
    },
  },
};
