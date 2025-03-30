import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { LoadingProvider } from './context/LoadingContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import BlogListPage from './pages/blogs/BlogListPage';
import BlogDetailPage from './pages/blogs/BlogDetailPage';
import BlogFormPage from './pages/blogs/BlogFormPage';
import UserListPage from './pages/users/UserListPage';
import UserFormPage from './pages/users/UserFormPage';
import TagListPage from './pages/tags/TagListPage';
import TagFormPage from './pages/tags/TagFormPage';
import NotFoundPage from './pages/NotFoundPage';
import { Button, Card, ListGroup } from 'react-bootstrap';
import { checkApiHealth, getApiTroubleshootingSteps } from './utils/apiHealth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState({
    isChecking: true,
    isHealthy: false, 
    message: 'Checking API connection...',
    errorCode: null
  });

  // Function to check API connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setApiStatus(prev => ({ ...prev, isChecking: true }));
        
        // Wait a moment to let the UI render and avoid blocking
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check API health
        const { isHealthy, message } = await checkApiHealth();
        
        // Get error code if there is one
        let errorCode = null;
        if (!isHealthy && message.includes('ERR_INSUFFICIENT_RESOURCES')) {
          errorCode = 'ERR_INSUFFICIENT_RESOURCES';
        } else if (!isHealthy && message.includes('ERR_NETWORK')) {
          errorCode = 'ERR_NETWORK';
        }
        
        setApiStatus({
          isChecking: false,
          isHealthy,
          message,
          errorCode
        });
      } catch (error) {
        console.error('API Check Error:', error);
        setApiStatus({
          isChecking: false,
          isHealthy: false,
          message: `Error checking API: ${error.message}`,
          errorCode: 'GENERAL'
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
      message: 'Retrying API connection...',
      errorCode: null
    });
    
    setTimeout(async () => {
      try {
        const { isHealthy, message } = await checkApiHealth();
        
        // Get error code if there is one
        let errorCode = null;
        if (!isHealthy && message.includes('ERR_INSUFFICIENT_RESOURCES')) {
          errorCode = 'ERR_INSUFFICIENT_RESOURCES';
        } else if (!isHealthy && message.includes('ERR_NETWORK')) {
          errorCode = 'ERR_NETWORK';
        }
        
        setApiStatus({
          isChecking: false,
          isHealthy,
          message,
          errorCode
        });
      } catch (error) {
        console.error('API Check Error on retry:', error);
        setApiStatus({
          isChecking: false,
          isHealthy: false,
          message: `Error checking API: ${error.message}`,
          errorCode: 'GENERAL'
        });
      }
    }, 500);
  };

  return (
    <NotificationProvider>
      <LoadingProvider>
        <Router>
          <div className="app-container d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1 py-4">
              <div className="container">
                {!apiStatus.isHealthy && !apiStatus.isChecking && (
                  <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">API Connection Error</h4>
                    <p>{apiStatus.message}</p>
                    <hr />
                    
                    {/* Show troubleshooting steps */}
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

                {(apiStatus.isHealthy || apiStatus.isChecking) && (
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    
                    {/* Blog Routes */}
                    <Route path="/blogs" element={<BlogListPage />} />
                    <Route path="/blogs/new" element={<BlogFormPage />} />
                    <Route path="/blogs/edit/:id" element={<BlogFormPage />} />
                    <Route path="/blogs/:id" element={<BlogDetailPage />} />
                    
                    {/* User Routes */}
                    <Route path="/users" element={<UserListPage />} />
                    <Route path="/users/new" element={<UserFormPage />} />
                    <Route path="/users/edit/:id" element={<UserFormPage />} />
                    
                    {/* Tag Routes */}
                    <Route path="/tags" element={<TagListPage />} />
                    <Route path="/tags/new" element={<TagFormPage />} />
                    <Route path="/tags/edit/:id" element={<TagFormPage />} />
                    
                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                )}
              </div>
            </main>
            <Footer />
          </div>
        </Router>
      </LoadingProvider>
    </NotificationProvider>
  );
}

export default App; 