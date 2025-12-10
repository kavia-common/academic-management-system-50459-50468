import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Courses from '../pages/Courses';
import Attendance from '../pages/Attendance';
import Settings from '../pages/Settings';

// PUBLIC_INTERFACE
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/students" element={<Students />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
