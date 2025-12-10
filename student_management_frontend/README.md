# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify
- **No Authentication**: All pages (Dashboard, Students, Courses, Attendance, Exams, Marks, Results, Settings) are publicly accessible

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Environment configuration

The app reads URLs and simple settings from environment variables:
- `REACT_APP_API_BASE` (preferred) or `REACT_APP_BACKEND_URL` for the base API URL
- `REACT_APP_HEALTHCHECK_PATH` for the health check endpoint path (defaults to `/health`)
- `REACT_APP_NODE_ENV` for environment indicator

Endpoints should not be hardcoded; configure via env variables.

### Wiring real backend endpoints

API clients are defined in `src/api/client.js`:
- `api.students` for students CRUD (see root README for default paths)
- `api.academics` for exams, subjects, marks, and reports
  - Override `api.academics.endpoints` to match your backend paths without changing code.
  - Example:
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
    ```

### Grades and results

Use `src/utils/grades.js`:
- Configurable thresholds (A/B/C/D/F) and helpers to compute total, average, percentage, and overall grade.
- The Results page uses these utilities to show per-student performance and export CSV.

Notes:
- When `REACT_APP_API_BASE` is not set, the frontend runs in client-only mode. Exams/Marks/Results operate in a minimal safe mode with optimistic UI; no persistence is guaranteed.
- Marks entry validates inputs to 0–100 by default.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
