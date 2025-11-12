import './App.css'
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Router';
import { LayoutProvider } from './contexts/LayoutContext';

function App() {
  return (
    <LayoutProvider>
      <RouterProvider router={router} />
    </LayoutProvider>
  );
}

export default App
