import { Navigate } from 'react-router';
import Layout from '../pages';
import Home from '../pages/home';
import Register from '../pages/register-validator';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'list-validator',
        element: <Register />,
      },
    ],
  },
  { path: '*', element: <Navigate to="/" /> },
];
