import { Navigate } from 'react-router';
import Layout from '../pages';
import Home from '../pages/home';
import MyBag from '../pages/myBag';
import MyBagLayout from '../pages/myBag/layout';
import Register from '../pages/register-validator';
import ValidatorDetailsPage from '../pages/validator-details';

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
      {
        path: 'my-bag',
        element: <MyBagLayout />,
        children: [
          { path: '', element: <Navigate to="sales" /> },
          { path: 'sales', element: <MyBag usage="Sales" /> },
          { path: 'purchases', element: <MyBag usage="Purchases" /> },
        ],
      },
      {
        path: ':program_id',
        element: <ValidatorDetailsPage />,
      },
    ],
  },
  { path: '*', element: <Navigate to="/" /> },
];
