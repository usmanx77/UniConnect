import { useEffect } from 'react';

export function PreloadResources() {
  useEffect(() => {
    // Preload critical fonts
    const preloadFont = (href: string, as: string = 'font', type: string = 'font/woff2') => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      link.type = type;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    };

    // Preload critical images
    const preloadImage = (src: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      document.head.appendChild(link);
    };

    // Preload critical CSS
    const preloadCSS = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'style';
      document.head.appendChild(link);
    };

    // Preload critical JavaScript chunks
    const preloadJS = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = href;
      document.head.appendChild(link);
    };

    // Preload critical resources
    preloadCSS('/assets/index-Co1TnHcw.css');
    preloadJS('/assets/react-vendor-BWX1YzKK.js');
    preloadJS('/assets/radix-vendor-0isRFci2.js');
    preloadJS('/assets/ui-vendor-DodV2HUK.js');

    // Preload common images
    const commonImages = [
      'https://images.unsplash.com/photo-1582192904915-d89c7250b235?w=800',
      'https://images.unsplash.com/photo-1632834380561-d1e05839a33a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBjYW1wdXN8ZW58MXx8fHwxNzU5Njk0NjMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ];

    commonImages.forEach(preloadImage);

    // DNS prefetch for external domains
    const dnsPrefetch = (domain: string) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    };

    dnsPrefetch('https://images.unsplash.com');
    dnsPrefetch('https://fonts.googleapis.com');
    dnsPrefetch('https://fonts.gstatic.com');

  }, []);

  return null;
}