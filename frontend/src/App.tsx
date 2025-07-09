import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom'; // ❌ no `BrowserRouter` here
import AuthPage from './pages/AuthPage';
import CommentsPage from './pages/CommentsPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  return (
    <>
      <nav style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <Link to="/auth">Auth</Link>
        <Link to="/comments">Comments</Link>
        <Link to="/notifications">Notifications</Link>
        {token && <button onClick={() => setToken(null)} style={{ marginLeft: 'auto' }}>Logout</button>}
      </nav>
      <Routes>
        <Route path="/auth" element={token ? <Navigate to="/comments" /> : <AuthPage onAuthSuccess={setToken} />} />
        <Route path="/comments" element={token ? <CommentsPage token={token} /> : <Navigate to="/auth" />} />
        <Route path="/notifications" element={token ? <NotificationsPage token={token} /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to={token ? "/comments" : "/auth"} />} />
      </Routes>
    </>
  );
}

export default App;
