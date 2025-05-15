import { usersApi, blogsApi } from '../services/api';

/**
 * Checks if a specific API endpoint is running and accessible
 * @param {Object} api - The axios instance to use
 * @param {string} name - The name of the API for logging
 * @returns {Promise<{ isHealthy: boolean, message: string }>}
 */
const checkSingleApiHealth = async (api, name) => {
  try {
    // Use appropriate endpoints for each API (without /api prefix since it's in baseURL)
    const endpoint = name === 'Users' ? '/Users' : '/Tags';
    
    const response = await api.get(endpoint, {
      timeout: 5000,
      headers: { 'Cache-Control': 'no-cache' },
    });
    
    // If we got any response, the API is running
    if (response.status >= 200 && response.status < 500) {
      return {
        isHealthy: true,
        message: `${name} API is healthy`
      };
    } else {
      return {
        isHealthy: false,
        message: `${name} API returned error status: ${response.status}`
      };
    }
  } catch (error) {
    console.error(`${name} API Health Check Error:`, error);
    
    // If we get a 401 (Unauthorized), the API is actually running
    // This is expected for protected endpoints when not logged in
    if (error.response && error.response.status === 401) {
      return {
        isHealthy: true,
        message: `${name} API is healthy (requires authentication)`
      };
    }
    
    // Determine the specific error
    let errorMessage;
    
    if (error.code === 'ERR_NETWORK') {
      errorMessage = `Network error: ${name} API server might be down or unreachable`;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = `Timeout: ${name} API server is running but responding slowly`;
    } else if (error.code === 'ERR_INSUFFICIENT_RESOURCES') {
      errorMessage = `${name} API server has insufficient resources. Try restarting the API or wait a moment.`;
    } else if (error.response) {
      errorMessage = `${name} API responded with ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = `No response received from ${name} API server`;
    } else {
      errorMessage = error.message || `Unknown ${name} API health check error`;
    }
    
    return {
      isHealthy: false,
      message: errorMessage
    };
  }
};

/**
 * Checks if both backend APIs are running and accessible
 * @returns {Promise<{ isHealthy: boolean, message: string, usersApiHealthy: boolean, blogsApiHealthy: boolean }>}
 */
export const checkApiHealth = async () => {
  const usersHealth = await checkSingleApiHealth(usersApi, 'Users');
  const blogsHealth = await checkSingleApiHealth(blogsApi, 'Blogs');

  return {
    isHealthy: usersHealth.isHealthy && blogsHealth.isHealthy,
    message: `Users API: ${usersHealth.message}, Blogs API: ${blogsHealth.message}`,
    usersApiHealthy: usersHealth.isHealthy,
    blogsApiHealthy: blogsHealth.isHealthy
  };
};

/**
 * Waits for both APIs to be healthy with multiple retry attempts
 * @param {number} maxAttempts - Maximum number of retry attempts
 * @param {number} delayMs - Delay between attempts in milliseconds
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const waitForHealthyApi = async (maxAttempts = 5, delayMs = 2000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`API health check attempt ${attempt}/${maxAttempts}...`);
    
    const { isHealthy, message, usersApiHealthy, blogsApiHealthy } = await checkApiHealth();
    
    if (isHealthy) {
      return { 
        success: true, 
        message: `Both APIs are healthy after ${attempt} attempt(s)` 
      };
    }
    
    if (attempt < maxAttempts) {
      const details = [];
      if (!usersApiHealthy) details.push('Users API is not healthy');
      if (!blogsApiHealthy) details.push('Blogs API is not healthy');
      
      console.log(`APIs not healthy yet: ${details.join(', ')}. Waiting ${delayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } else {
      return { 
        success: false, 
        message: `API health check failed after ${maxAttempts} attempts: ${message}` 
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
      "One or both API servers don't have enough resources (memory or CPU) to handle requests.",
      "1. Close other applications on your development machine to free up resources.",
      "2. Restart both .NET API servers using 'dotnet run' command.",
      "3. If running in Docker, try increasing the containers' resource limits."
    ],
    ERR_NETWORK: [
      "The application can't reach one or both API servers due to network issues.",
      "1. Verify both APIs are running:",
      "   - Users API: dotnet run in API.Users directory (port 7052)",
      "   - Blogs API: dotnet run in API.BLOG directory (port 7042)",
      "2. Check if the ports are available and not blocked by firewalls.",
      "3. Try accessing the Swagger UIs:",
      "   - Users API: https://localhost:7052/swagger",
      "   - Blogs API: https://localhost:7042/swagger"
    ],
    GENERAL: [
      "General API troubleshooting steps:",
      "1. Restart both API servers using 'dotnet run' in their respective directories.",
      "2. Check both API console outputs for any error messages.",
      "3. Verify database connections and availability.",
      "4. Ensure HTTPS certificates are properly configured for both APIs."
    ]
  };
};

export default {
  checkApiHealth,
  waitForHealthyApi,
  getApiTroubleshootingSteps
}; 