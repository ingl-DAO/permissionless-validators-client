import { Navigate } from 'react-router';
import Layout from '../pages';

export const routes = [
  { path: '/', element: <Layout /> },
  { path: '*', element: <Navigate to="/" /> },
];
