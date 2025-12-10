import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import './index.css';
import './theme/global.css';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import AppRouter from './routes/AppRouter';
import { applyThemeToDocument } from './theme/theme';
import { AuthProvider } from './auth/AuthContext';

// Layout component to conditionally render chrome (sidebar/topbar) excluding login/signup pages
function Shell() {
  const location = useLocation();
  const isAuthPublic = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPublic) {
    return (
      <main role="main">
        <AppRouter />
      </main>
    );
  }

  return (
    <div className="app-shell" role="application" aria-label="Student Management Dashboard">
      <Sidebar />
      <Topbar />
      <main className="content" role="main">
        <AppRouter />
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  useEffect(() => {
    applyThemeToDocument();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
