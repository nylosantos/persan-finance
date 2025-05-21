// src/App.tsx
// Este é o componente raiz da aplicação. Ele renderiza as rotas definidas em AppRoutes.
import { Header } from './components/Layout/Header';
import { useAuth } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  const { user } = useAuth();
  return (
    <>
      {user && <Header />}
      {/* Aqui podemos adicionar um Layout global (Header, Sidebar, etc.) */}
      <AppRoutes />
    </>
  );
}

export default App;
