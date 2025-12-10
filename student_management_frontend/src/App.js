import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './theme/global.css';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import AppRouter from './routes/AppRouter';
import { applyThemeToDocument } from './theme/theme';

// PUBLIC_INTERFACE
function App() {
  useEffect(() => {
    applyThemeToDocument();
  }, []);

  return (
    <div className="app-shell" role="application" aria-label="Student Management Dashboard">
      <BrowserRouter>
        <Sidebar />
        <Topbar />
        <main className="content" role="main">
          <AppRouter />
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
