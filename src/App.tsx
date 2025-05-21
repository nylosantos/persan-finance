// src/App.tsx
// Este é o componente raiz da aplicação. Ele renderiza as rotas definidas em AppRoutes.
import { Header } from './components/Layout/Header';
import { useAuth } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  const { user } = useAuth();
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
