import './App.css'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Router';
import { LayoutProvider } from './contexts/LayoutContext';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const syncFromLocalStorage = useAuthStore((state) => state.syncFromLocalStorage);

  // 앱 시작 시 localStorage와 동기화
  // (기존에 localStorage에만 저장된 경우를 대비)
  useEffect(() => {
    syncFromLocalStorage();
  }, [syncFromLocalStorage]);

  return (
    <LayoutProvider>
      <RouterProvider router={router} />
    </LayoutProvider>
  );
}

export default App
