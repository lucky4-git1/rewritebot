import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/Router';
import { useAuthStore } from './stores/authStore';

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    // Load user from localStorage on app start
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
