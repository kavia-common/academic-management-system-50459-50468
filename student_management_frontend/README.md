# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify
- **No Authentication**: All pages (Dashboard, Students, Courses, Attendance, Settings) are publicly accessible

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

### Wiring real backend endpoints (Students)

The student API client is defined in `src/api/client.js` under `api.students`. By default it uses these paths:
- `GET ${REACT_APP_API_BASE}/students` - list students
- `POST ${REACT_APP_API_BASE}/students` - create student
- `PUT ${REACT_APP_API_BASE}/students/:id` - update student
- `DELETE ${REACT_APP_API_BASE}/students/:id` - delete student

If your backend uses different paths, update them at runtime by overriding endpoints:
```js
import { api } from './api/client';

api.students.endpoints = {
  list: '/v1/sis/students',
  create: '/v1/sis/students',
  update: (id) => `/v1/sis/students/${id}`,
  delete: (id) => `/v1/sis/students/${id}`,
};
```

Notes:
- When `REACT_APP_API_BASE` is not set, the frontend runs in client-only mode. The Students page still works with local state and optimistic patterns; network calls are no-ops that return mock-like results.
- Required student fields: `name`, `class`, `section`, `rollNumber`. The UI validates required fields and ensures `rollNumber` is unique within a `class + section` combination.

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
