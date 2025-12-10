# academic-management-system-50459-50468

Frontend (student_management_frontend) is configured as a non-authenticated app. All primary pages (Dashboard, Students, Courses, Attendance, Settings) are publicly accessible and API base URL is read from environment (REACT_APP_API_BASE or REACT_APP_BACKEND_URL). No Authorization headers are sent by default.