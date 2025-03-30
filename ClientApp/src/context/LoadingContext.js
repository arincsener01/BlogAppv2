import React, { createContext, useContext, useState } from 'react';

// Create a context for loading state
const LoadingContext = createContext();

// Custom hook to use the loading context
export const useLoading = () => {
  return useContext(LoadingContext);
};

// Loading provider component
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  // Start loading with an optional message
  const startLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setLoading(true);
  };

  // Stop loading
  const stopLoading = () => {
    setLoading(false);
  };

  // Wrapper function to execute async operations with loading state
  const withLoading = async (operation, message = 'Loading...') => {
    try {
      startLoading(message);
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  };

  const contextValue = {
    loading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">{loadingMessage}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export default LoadingContext; 