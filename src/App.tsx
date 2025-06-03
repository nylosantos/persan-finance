// src/App.tsx
// Este é o componente raiz da aplicação. Ele renderiza as rotas definidas em AppRoutes.
import { useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { useAuth } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  const { user } = useAuth();
  
  useEffect(() => {
    // Troque por sua lógica de tema, se usar contexto ou state
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
