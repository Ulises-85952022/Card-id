import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider, createBrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import {AuthProvider} from './panel/auth/AuthContext.jsx';
import {panelRoutes} from './panel/router.jsx';
import './index.css';

// Panel (login, registro y rutas privadas) y tarjetas compartidas; cualquier otra ruta es la tarjeta digital
const router = createBrowserRouter([
  ...panelRoutes,
  {path: '*', element: <App />},
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
