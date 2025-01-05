import React, { useEffect } from 'react';

const PageLoadingIndicator = ({ isLoading }) => {
  useEffect(() => {
    // Store the original favicon
    const originalFavicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
    const originalHref = originalFavicon.href;

    const updateFavicon = () => {
      if (isLoading) {
        // Create loading favicon - a simple blue dot
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Create blue loading circle
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#2563eb'; // Tailwind blue-600
        ctx.fill();

        // Update favicon
        const loadingFavicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
        loadingFavicon.type = 'image/x-icon';
        loadingFavicon.rel = 'shortcut icon';
        loadingFavicon.href = canvas.toDataURL('image/x-icon');
        document.head.appendChild(loadingFavicon);
        
        // Optional: Update title with loading indicator
        document.title = '● ' + document.title.replace(/^● /, '');
      } else {
        // Restore original favicon
        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon) {
          favicon.href = originalHref;
        }
        
        // Restore original title
        document.title = document.title.replace(/^● /, '');
      }
    };

    updateFavicon();

    // Cleanup
    return () => {
      const favicon = document.querySelector("link[rel*='icon']");
      if (favicon && originalHref) {
        favicon.href = originalHref;
      }
      document.title = document.title.replace(/^● /, '');
    };
  }, [isLoading]);

  return null; // This is a headless component
};

export default PageLoadingIndicator;