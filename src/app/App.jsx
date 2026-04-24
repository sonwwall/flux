import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Content from '../components/Content';
import LoginDialog from '../components/LoginDialog';
import { AuthProvider } from '../hooks/useAuth';
import { ApiProvider } from '../hooks/useApiStatus';
import LoadingSpinner from '../components/LoadingSpinner';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ApiProvider>
            <div className="flex flex-col h-screen">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <Suspense fallback={<LoadingSpinner />}>
                  <Content />
                </Suspense>
              </div>
            </div>
            
            <Routes>
              <Route path="/login" element={<LoginDialog />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<div>Dashboard Content</div>} />
              <Route path="/posts" element={<div>Posts Content</div>} />
              <Route path="/categories" element={<div>Categories Content</div>} />
              <Route path="/users" element={<div>Users Content</div>} />
            </Routes>
          </ApiProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;