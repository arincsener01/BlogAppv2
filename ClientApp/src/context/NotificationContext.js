import React, { createContext, useContext, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create a context for notifications
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  return useContext(NotificationContext);
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  // Function to show a success notification
  const showSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  // Function to show an error notification
  const showError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  // Function to show an info notification
  const showInfo = (message) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  // Function to show a warning notification
  const showWarning = (message) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  // Context value with notification functions
  const contextValue = {
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 