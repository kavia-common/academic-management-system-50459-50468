Ocean Professional Theme Notes

- Primary: #2563EB
- Secondary (accent): #F59E0B
- Success: #10B981
- Error: #EF4444
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827

Implemented:
- App shell with responsive Sidebar + Topbar + Content
- Routing: Dashboard, Students, Courses, Attendance, Settings
- Reusable components: Button, Card, Modal, Table, Badge, Input, Select, StatCard, EmptyState, Skeleton
- API client reads base URL from REACT_APP_API_BASE or REACT_APP_BACKEND_URL
- Config module for environment variables
- Accessibility: semantic roles, focus outlines, color contrast
- Authentication: Login page (/login), Signup page (/signup), AuthProvider with token persistence, protected routes, role-based access (admin vs teacher), logout in Sidebar/Topbar.
  - Placeholder endpoints: POST /auth/login, POST /auth/register, GET /auth/me
  - Reads base URL from REACT_APP_API_BASE / REACT_APP_BACKEND_URL

Notes:
- Role selection on Signup defaults to 'teacher'. Toggle visibility per backend policy. After signup, redirects:
  - admin -> /settings
  - teacher -> /dashboard
- Env vars used by client: REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_NODE_ENV
