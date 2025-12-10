import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Courses from '../pages/Courses';
import Attendance from '../pages/Attendance';
import Settings from '../pages/Settings';
import Exams from '../pages/Exams';
import Marks from '../pages/Marks';
import Results from '../pages/Results';

// PUBLIC_INTERFACE
export default function AppRouter() {
  /**
   * Application router (no authentication):
   * - All pages are publicly accessible.
   */
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/students" element={<Students />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/marks" element={<Marks />} />
      <Route path="/results" element={<Results />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
