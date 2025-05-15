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

// Create separate API instances for different services
const usersApi = createApiWithRetry({
  baseURL: 'https://localhost:7052/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const blogsApi = createApiWithRetry({
  baseURL: 'https://localhost:7042/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add request interceptors for debugging
const addDebugInterceptor = (api) => {
  api.interceptors.request.use(
    config => {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
      
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
};

// Add authentication interceptor
const addAuthInterceptor = (api) => {
  api.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = token;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
};

// Add error handling interceptor
const addErrorInterceptor = (api) => {
  api.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.status} ${response.statusText}`);
      return response;
    },
    async (error) => {
      let errorMessage = 'An unexpected error occurred';
      
      console.error('Response Error:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject({ message: 'Session expired. Please login again.' });
        }

        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else {
          errorMessage = `Error: ${error.response.status} - ${error.response.statusText}`;
        }
      } else if (error.request) {
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
        errorMessage = error.message;
      }
      
      return Promise.reject({ message: errorMessage, originalError: error });
    }
  );
};

// Apply interceptors to both API instances
[usersApi, blogsApi].forEach(api => {
  addDebugInterceptor(api);
  addAuthInterceptor(api);
  addErrorInterceptor(api);
});

// Helper function for API requests with retry logic
const apiRequestWithRetry = async (requestFn, maxRetries = 3, retryDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed, ${maxRetries - attempt - 1} retries left`);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
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
      const response = await apiRequestWithRetry(() => blogsApi.get('/Blogs', { params }));
      return response.data;
    } catch (error) {
      console.error('BlogService.getAll error:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.get(`/Blogs/${id}`));
      return response.data;
    } catch (error) {
      console.error(`BlogService.getById(${id}) error:`, error);
      throw error;
    }
  },
  
  create: async (blog) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.post('/Blogs', blog));
      return response.data;
    } catch (error) {
      console.error('BlogService.create error:', error);
      throw error;
    }
  },
  
  update: async (blog) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.put('/Blogs', blog));
      return response.data;
    } catch (error) {
      console.error(`BlogService.update(${blog.id}) error:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.delete(`/Blogs/${id}`));
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
      const response = await apiRequestWithRetry(() => usersApi.get('/Users', { params }));
      return response.data;
    } catch (error) {
      console.error('UserService.getAll error:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => usersApi.get(`/Users/${id}`));
      return response.data;
    } catch (error) {
      console.error(`UserService.getById(${id}) error:`, error);
      throw error;
    }
  },
  
  create: async (user) => {
    try {
      const response = await apiRequestWithRetry(() => usersApi.post('/Users', user));
      return response.data;
    } catch (error) {
      console.error('UserService.create error:', error);
      throw error;
    }
  },
  
  update: async (user) => {
    try {
      const response = await apiRequestWithRetry(() => usersApi.put('/Users', user));
      return response.data;
    } catch (error) {
      console.error(`UserService.update(${user.id}) error:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => usersApi.delete(`/Users/${id}`));
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
      const response = await apiRequestWithRetry(() => blogsApi.get('/Tags', { params }));
      return response.data;
    } catch (error) {
      console.error('TagService.getAll error:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.get(`/Tags/${id}`));
      return response.data;
    } catch (error) {
      console.error(`TagService.getById(${id}) error:`, error);
      throw error;
    }
  },
  
  create: async (tag) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.post('/Tags', tag));
      return response.data;
    } catch (error) {
      console.error('TagService.create error:', error);
      throw error;
    }
  },
  
  update: async (tag) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.put('/Tags', tag));
      return response.data;
    } catch (error) {
      console.error(`TagService.update(${tag.id}) error:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.delete(`/Tags/${id}`));
      return response.data;
    } catch (error) {
      console.error(`TagService.delete(${id}) error:`, error);
      throw error;
    }
  }
};

// Skill API methods
export const SkillService = {
  getAll: async (params) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.get('/Skills', { params }));
      return response.data;
    } catch (error) {
      console.error('SkillService.getAll error:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.get(`/Skills/${id}`));
      return response.data;
    } catch (error) {
      console.error(`SkillService.getById(${id}) error:`, error);
      throw error;
    }
  },
  
  create: async (skill) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.post('/Skills', skill));
      return response.data;
    } catch (error) {
      console.error('SkillService.create error:', error);
      throw error;
    }
  },
  
  update: async (skill) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.put('/Skills', skill));
      return response.data;
    } catch (error) {
      console.error(`SkillService.update(${skill.id}) error:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiRequestWithRetry(() => blogsApi.delete(`/Skills/${id}`));
      return response.data;
    } catch (error) {
      console.error(`SkillService.delete(${id}) error:`, error);
      throw error;
    }
  }
};

// Export both API instances and services
export { usersApi, blogsApi };
export default usersApi; // Default export for backward compatibility 