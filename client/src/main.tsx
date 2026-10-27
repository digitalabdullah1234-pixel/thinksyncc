import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from '@/context/LanguageContext';
import { MotionProvider } from '@/components/MotionProvider/MotionProvider';
import { CustomCursor } from '@/components/CustomCursor/CustomCursor';
import { Preloader } from '@/components/Preloader/Preloader';
import App from './App';
import './styles/globals.css';

/**
 * Motion renders the `initial` state into the HTML, so with scripting off
 * nothing would ever animate away from opacity 0. This puts every animated
 * element back at its end state and drops the intro overlay.
 */
const NOSCRIPT_CSS = `<style>
[data-reveal],[data-page],[data-nav-in]{opacity:1!important;transform:none!important}
[data-preloader]{display:none!important}
[data-header-logo]{opacity:1!important}
</style>`;

// Inject fonts and noscript styles
document.head.insertAdjacentHTML('beforeend', NOSCRIPT_CSS);

// Preconnect to Google Fonts for faster loading
const preconnectLinks = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth@12..96,62..104&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
`;
document.head.insertAdjacentHTML('beforeend', preconnectLinks);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col text-ink">
        <Preloader />
        <MotionProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </MotionProvider>
        <CustomCursor />
      </body>
    </html>
  </StrictMode>
);