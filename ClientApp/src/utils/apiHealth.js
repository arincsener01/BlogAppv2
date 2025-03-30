import axios from 'axios';

/**
 * Checks if the backend API is running and accessible
 * @returns {Promise<{ isHealthy: boolean, message: string }>}
 */
export const checkApiHealth = async () => {
  try {
    // Try to reach the API with a simple request
    const response = await axios.get('https://localhost:7042/api/Blogs', {
      timeout: 5000,
      headers: { 'Cache-Control': 'no-cache' },
      params: { _t: new Date().getTime() } // Cache busting
    });
    
    // If we got a response (even 404 is okay, it means the API is running)
    if (response.status >= 200 && response.status < 500) {
      return {
        isHealthy: true,
        message: `API is healthy (status ${response.status})`
      };
    } else {
      return {
        isHealthy: false,
        message: `API returned error status: ${response.status}`
      };
    }
  } catch (error) {
    console.error('API Health Check Error:', error);
    
    // Determine the specific error
    let errorMessage;
    
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error: API server might be down or unreachable';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout: API server is running but responding slowly';
    } else if (error.code === 'ERR_INSUFFICIENT_RESOURCES') {
      errorMessage = 'Server has insufficient resources. Try restarting the API or wait a moment.';
    } else if (error.response) {
      errorMessage = `API responded with ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'No response received from API server';
    } else {
      errorMessage = error.message || 'Unknown API health check error';
    }
    
    return {
      isHealthy: false,
      message: errorMessage
    };
  }
};

/**
 * Waits for the API to be healthy with multiple retry attempts
 * @param {number} maxAttempts - Maximum number of retry attempts
 * @param {number} delayMs - Delay between attempts in milliseconds
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const waitForHealthyApi = async (maxAttempts = 5, delayMs = 2000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`API health check attempt ${attempt}/${maxAttempts}...`);
    
    const { isHealthy, message } = await checkApiHealth();
    
    if (isHealthy) {
      return { 
        success: true, 
        message: `API is healthy after ${attempt} attempt(s)` 
      };
    }
    
    if (attempt < maxAttempts) {
      console.log(`API not healthy yet: ${message}. Waiting ${delayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } else {
      return { 
        success: false, 
        message: `API failed health check after ${maxAttempts} attempts: ${message}` 
      };
    }
  }
};

/**
 * Restart suggestions for common API issues
 * @returns {Object} - Object with potential solutions for different error types
 */
export const getApiTroubleshootingSteps = () => {
  return {
    ERR_INSUFFICIENT_RESOURCES: [
      "The server doesn't have enough resources (memory or CPU) to handle the request.",
      "1. Close other applications on your development machine to free up resources.",
      "2. Restart the .NET API server using 'dotnet run' command.",
      "3. If running in Docker, try increasing the container's resource limits."
    ],
    ERR_NETWORK: [
      "The application can't reach the API server due to a network issue.",
      "1. Verify the API is running with 'dotnet run' in the API.BLOG directory.",
      "2. Check if the port 7042 is available and not blocked by a firewall.",
      "3. Try accessing https://localhost:7042/swagger in your browser."
    ],
    GENERAL: [
      "General API troubleshooting steps:",
      "1. Restart the API server using 'dotnet run' in the API.BLOG directory.",
      "2. Check the API console output for any error messages.",
      "3. Verify your database connection string and database availability.",
      "4. If using HTTPS, ensure certificates are properly configured."
    ]
  };
};

export default {
  checkApiHealth,
  waitForHealthyApi,
  getApiTroubleshootingSteps
}; 