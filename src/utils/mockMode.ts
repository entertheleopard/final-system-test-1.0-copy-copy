/**
 * Mock mode detection and configuration
 * Enables the app to run without backend services in preview/testing environments
 */

export const isMockMode = () => {
  return false; // Disable mock mode to use Supabase
};

export const MOCK_USERS: any[] = [];

export const MOCK_USER = null;

export const MOCK_DELAY = 0;

export const mockDelay = (ms: number = MOCK_DELAY) => 
  new Promise(resolve => setTimeout(resolve, ms));
