import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { LoadingProvider } from './context/LoadingContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import BlogListPage from './pages/blogs/BlogListPage';
import BlogDetailPage from './pages/blogs/BlogDetailPage';
import BlogFormPage from './pages/blogs/BlogFormPage';
import UserListPage from './pages/users/UserListPage';
import UserFormPage from './pages/users/UserFormPage';
import TagListPage from './pages/tags/TagListPage';
import TagFormPage from './pages/tags/TagFormPage';
import SkillListPage from './pages/skills/SkillListPage';
import SkillFormPage from './pages/skills/SkillFormPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Button, Card, ListGroup } from 'react-bootstrap';
import { checkApiHealth, getApiTroubleshootingSteps } from './utils/apiHealth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Wrapper component that can use router hooks
const AppContent = () => {
  const [apiStatus, setApiStatus] = useState({
    isChecking: true,
    isHealthy: false, 
    message: 'Checking API connection...',
    errorCode: null,
    usersApiHealthy: false,
    blogsApiHealthy: false
  });

  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Function to check API connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setApiStatus(prev => ({ ...prev, isChecking: true }));
        await new Promise(resolve => setTimeout(resolve, 500));
        const { isHealthy, message, usersApiHealthy, blogsApiHealthy } = await checkApiHealth();
        
        let errorCode = null;
        if (!isHealthy) {
          if (!usersApiHealthy && !blogsApiHealthy) {
            errorCode = message.includes('ERR_NETWORK') ? 'ERR_NETWORK' : 'GENERAL';
          } else if (!usersApiHealthy) {
            errorCode = 'USERS_API_ERROR';
          } else if (!blogsApiHealthy) {
            errorCode = 'BLOGS_API_ERROR';
          }
        }
        
        setApiStatus({
          isChecking: false,
          isHealthy,
          message,
          errorCode,
          usersApiHealthy,
          blogsApiHealthy
        });
      } catch (error) {
        console.error('API Check Error:', error);
        setApiStatus({
          isChecking: false,
          isHealthy: false,
          message: `Error checking APIs: ${error.message}`,
          errorCode: 'GENERAL',
          usersApiHealthy: false,
          blogsApiHealthy: false
        });
      }
    };

    checkConnection();
  }, []);

  // Function to retry API connection
  const retryApiConnection = () => {
    setApiStatus({
      isChecking: true,
      isHealthy: false,
      message: 'Retrying API connections...',
      errorCode: null,
      usersApiHealthy: false,
      blogsApiHealthy: false
    });
    
    setTimeout(async () => {
      try {
        const { isHealthy, message, usersApiHealthy, blogsApiHealthy } = await checkApiHealth();
        
        let errorCode = null;
        if (!isHealthy) {
          if (!usersApiHealthy && !blogsApiHealthy) {
            errorCode = message.includes('ERR_NETWORK') ? 'ERR_NETWORK' : 'GENERAL';
          } else if (!usersApiHealthy) {
            errorCode = 'USERS_API_ERROR';
          } else if (!blogsApiHealthy) {
            errorCode = 'BLOGS_API_ERROR';
          }
        }
        
        setApiStatus({
          isChecking: false,
          isHealthy,
          message,
          errorCode,
          usersApiHealthy,
          blogsApiHealthy
        });
      } catch (error) {
        console.error('API Check Error on retry:', error);
        setApiStatus({
          isChecking: false,
          isHealthy: false,
          message: `Error checking APIs: ${error.message}`,
          errorCode: 'GENERAL',
          usersApiHealthy: false,
          blogsApiHealthy: false
        });
      }
    }, 500);
  };

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 py-4">
        <div className="container">
          {!apiStatus.isHealthy && !apiStatus.isChecking && !isLoginPage && !apiStatus.message.includes('requires authentication') && (
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">API Connection Error</h4>
              <p>{apiStatus.message}</p>
              <hr />
              
              <Card className="mb-3">
                <Card.Header as="h5">Troubleshooting Steps</Card.Header>
                <ListGroup variant="flush">
                  {getApiTroubleshootingSteps()[apiStatus.errorCode || 'GENERAL'].map((step, index) => (
                    <ListGroup.Item key={index}>{step}</ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
              
              <div className="d-flex justify-content-between align-items-center">
                <p className="mb-0">
                  Please ensure the .NET API is running before using the application.
                </p>
                <Button 
                  variant="outline-danger" 
                  onClick={retryApiConnection}
                  disabled={apiStatus.isChecking}
                >
                  {apiStatus.isChecking ? 'Checking...' : 'Retry Connection'}
                </Button>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
            
            {/* Protected Blog Routes */}
            <Route path="/blogs" element={
              <ProtectedRoute>
                <BlogListPage />
              </ProtectedRoute>
            } />
            <Route path="/blogs/new" element={
              <ProtectedRoute>
                <BlogFormPage />
              </ProtectedRoute>
            } />
            <Route path="/blogs/edit/:id" element={
              <ProtectedRoute>
                <BlogFormPage />
              </ProtectedRoute>
            } />
            <Route path="/blogs/:id" element={
              <ProtectedRoute>
                <BlogDetailPage />
              </ProtectedRoute>
            } />
            
            {/* Protected Admin Routes */}
            <Route path="/users" element={
              <ProtectedRoute requiredRole="Admin">
                <UserListPage />
              </ProtectedRoute>
            } />
            <Route path="/users/new" element={
              <ProtectedRoute requiredRole="Admin">
                <UserFormPage />
              </ProtectedRoute>
            } />
            <Route path="/users/edit/:id" element={
              <ProtectedRoute requiredRole="Admin">
                <UserFormPage />
              </ProtectedRoute>
            } />
            
            {/* Protected Tag Routes */}
            <Route path="/tags" element={
              <ProtectedRoute requiredRole="Admin">
                <TagListPage />
              </ProtectedRoute>
            } />
            <Route path="/tags/new" element={
              <ProtectedRoute requiredRole="Admin">
                <TagFormPage />
              </ProtectedRoute>
            } />
            <Route path="/tags/edit/:id" element={
              <ProtectedRoute requiredRole="Admin">
                <TagFormPage />
              </ProtectedRoute>
            } />
            
            {/* Protected Skill Routes */}
            <Route path="/skills" element={
              <ProtectedRoute requiredRole="Admin">
                <SkillListPage />
              </ProtectedRoute>
            } />
            <Route path="/skills/new" element={
              <ProtectedRoute requiredRole="Admin">
                <SkillFormPage />
              </ProtectedRoute>
            } />
            <Route path="/skills/edit/:id" element={
              <ProtectedRoute requiredRole="Admin">
                <SkillFormPage />
              </ProtectedRoute>
            } />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LoadingProvider>
          <Router>
            <AppContent />
          </Router>
        </LoadingProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App; 