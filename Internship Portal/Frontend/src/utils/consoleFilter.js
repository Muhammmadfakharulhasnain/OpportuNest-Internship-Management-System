// Console error filter - Add this to your main App.jsx or index.js
// This will suppress known browser extension errors

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = function(...args) {
  const errorMessage = args.join(' ');
  
  // Filter out known browser extension errors
  if (
    errorMessage.includes('disconnected port object') ||
    errorMessage.includes('proxy.js') ||
    errorMessage.includes('Extension context invalidated') ||
    errorMessage.includes('chrome-extension://')
  ) {
    return; // Suppress these errors
  }
  
  // Show actual application errors
  originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
  const warnMessage = args.join(' ');
  
  // Filter out extension warnings
  if (
    warnMessage.includes('disconnected port object') ||
    warnMessage.includes('proxy.js')
  ) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
};

// Export for use in main app
export { originalConsoleError, originalConsoleWarn };
