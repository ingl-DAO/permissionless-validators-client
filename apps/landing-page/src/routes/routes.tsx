import { Navigate } from 'react-router';
import Index from '../components/Index';

export const routes = [
  {
    path: '/',
    element: <Index />,
  },
  { path: '*', element: <Navigate to="/" /> },
];
