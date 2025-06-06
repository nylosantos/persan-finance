import { useEffect } from 'react';

import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';

function App() {
  const { user } = useAuth();
  
  useEffect(() => {
    const updateThemeColor = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const color = isDark ? '#18181b' : '#f3f4f6';
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', color);
    };

    updateThemeColor();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeColor);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateThemeColor);
    };
  }, []);

  return (
    <div className='flex flex-col m-0 items-center'>
      {user && (
        <>
          <Header />
          <div className="h-20" /> {/* Ajuste a altura conforme o padding do header */}
        </>
      )}
      <AppRoutes />
    </div>
  );
}

export default App;
