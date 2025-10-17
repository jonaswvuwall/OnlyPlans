// Get the API base URL dynamically
const getApiBaseUrl = () => {
  // If we're running on localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  
  // If we're accessing from another device, use the same host but port 4000
  return `http://${window.location.hostname}:4000`;
};

export const API_BASE = getApiBaseUrl();