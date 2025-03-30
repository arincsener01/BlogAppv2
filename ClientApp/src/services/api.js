import axios from 'axios';

// Create an axios instance with retry capability
const createApiWithRetry = (baseConfig) => {
  const api = axios.create(baseConfig);
  
  // Retry configuration
  api.defaults.raxConfig = {
    retry: 2, // Number of retry attempts
    retryDelay: 1000, // Delay between retries in milliseconds
    statusCodesToRetry: [[500, 599]], // Retry on server errors
    onRetryAttempt: (err) => {
      const cfg = axios.getConfig(err);
      console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
    }
  };
  
  return api;
};

// Create an instance of axios with default configuration
const api = createApiWithRetry({
  baseURL: 'https://localhost:7042/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Add a request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    
    // Add detailed logging for POST and PUT requests
    if (config.method.toUpperCase() === 'POST' || config.method.toUpperCase() === 'PUT') {
      console.log('Request Data:', JSON.stringify(config.data, null, 2));
    }
    
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    console.error('Response Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else {
        errorMessage = `Error: ${error.response.status} - ${error.response.statusText}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request made but no response received');
      
      // Check for specific error codes
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. The API server might be down or unreachable.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The API server might be overloaded.';
      } else if (error.code === 'ERR_INSUFFICIENT_RESOURCES') {
        errorMessage = 'Server has insufficient resources. Try again later or restart the API.';
      } else {
        errorMessage = 'No response received from server. Please check your connection and ensure the API is running.';
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }
    
    return Promise.reject({ message: errorMessage, originalError: error });
  }
);

// Helper function for API requests with retry logic
const apiRequestWithRetry = async (requestFn, maxRetries = 3, retryDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed, ${maxRetries - attempt - 1} retries left`);
      lastError = error;
      
      // If this was the last attempt, don't wait
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Blog API methods
export const BlogService = {
  getAll: async (params) => {
    try {
      const response = await apiRequestWithRetry(() => api.get('/Blogs', { params }));
      return response.data;
    } catch (error) {
      console.error('BlogService.getAll error:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => api.get(`/Blogs/${id}`));
      return response.data;
    } catch (error) {
      console.error(`BlogService.getById(${id}) error:`, error);
      throw error;
    }
  },
  
  create: async (blog) => {
    try {
      const response = await apiRequestWithRetry(() => api.post('/Blogs', blog));
      return response.data;
    } catch (error) {
      console.error('BlogService.create error:', error);
      throw error;
    }
  },
  
  update: async (blog) => {
    try {
      const response = await apiRequestWithRetry(() => api.put('/Blogs', blog));
      return response.data;
    } catch (error) {
      console.error(`BlogService.update(${blog.id}) error:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => api.delete(`/Blogs/${id}`));
      return response.data;
    } catch (error) {
      console.error(`BlogService.delete(${id}) error:`, error);
      throw error;
    }
  }
};

// User API methods
export const UserService = {
  getAll: async (params) => {
    try {
      const response = await apiRequestWithRetry(() => api.get('/Users', { params }));
      return response.data;
    } catch (error) {
      console.error('UserService.getAll error:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => api.get(`/Users/${id}`));
      return response.data;
    } catch (error) {
      console.error(`UserService.getById(${id}) error:`, error);
      throw error;
    }
  },
  
  create: async (user) => {
    try {
      const response = await apiRequestWithRetry(() => api.post('/Users', user));
      return response.data;
    } catch (error) {
      console.error('UserService.create error:', error);
      throw error;
    }
  },
  
  update: async (user) => {
    try {
      const response = await apiRequestWithRetry(() => api.put('/Users', user));
      return response.data;
    } catch (error) {
      console.error(`UserService.update(${user.id}) error:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => api.delete(`/Users/${id}`));
      return response.data;
    } catch (error) {
      console.error(`UserService.delete(${id}) error:`, error);
      throw error;
    }
  }
};

// Tag API methods
export const TagService = {
  getAll: async (params) => {
    try {
      const response = await apiRequestWithRetry(() => api.get('/Tags', { params }));
      return response.data;
    } catch (error) {
      console.error('TagService.getAll error:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => api.get(`/Tags/${id}`));
      return response.data;
    } catch (error) {
      console.error(`TagService.getById(${id}) error:`, error);
      throw error;
    }
  },
  
  create: async (tag) => {
    try {
      const response = await apiRequestWithRetry(() => api.post('/Tags', tag));
      return response.data;
    } catch (error) {
      console.error('TagService.create error:', error);
      throw error;
    }
  },
  
  update: async (tag) => {
    try {
      const response = await apiRequestWithRetry(() => api.put('/Tags', tag));
      return response.data;
    } catch (error) {
      console.error(`TagService.update(${tag.id}) error:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => api.delete(`/Tags/${id}`));
      return response.data;
    } catch (error) {
      console.error(`TagService.delete(${id}) error:`, error);
      throw error;
    }
  }
};

export default api; 