import { Navigate } from 'react-router';
import Layout from '../pages';
import Home from '../pages/home';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
    ],
  },
  { path: '*', element: <Navigate to="/" /> },
];
