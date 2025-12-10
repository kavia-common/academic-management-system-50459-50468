import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Courses from '../pages/Courses';
import Attendance from '../pages/Attendance';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import { ProtectedRoute, RoleRoute } from '../auth/ProtectedRoute';

// PUBLIC_INTERFACE
export default function AppRouter() {
  /**
   * Application router with authentication and role-based protections:
   * - /login and /signup are public
   * - /settings is admin-only
   * - students/courses/attendance are protected for admin or teacher
   */
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        {/* Shared views for admin and teacher */}
        <Route path="/students" element={<Students />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/attendance" element={<Attendance />} />
        {/* Admin-only routes */}
        <Route element={<RoleRoute roles={['admin']} />}>
          <Route path="/settings" element={<Settings />} />
          {/* Placeholder for admin user management could go here later */}
        </Route>
      </Route>
    </Routes>
  );
}
