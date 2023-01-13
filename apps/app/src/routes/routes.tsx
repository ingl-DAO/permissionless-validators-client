import { Navigate } from 'react-router';
import Home from '../pages';
import Layout from '../pages/layout';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [{ path: '', element: <Home /> }],
  },
  { path: '*', element: <Navigate to="/" /> },
];
