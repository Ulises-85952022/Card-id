import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider, createBrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import {panelRoutes} from './panel/router.jsx';
import './index.css';

// "/app" y "/c" son el panel y las tarjetas compartidas; cualquier otra ruta es la tarjeta digital
const router = createBrowserRouter([
  ...panelRoutes,
  {path: '*', element: <App />},
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
