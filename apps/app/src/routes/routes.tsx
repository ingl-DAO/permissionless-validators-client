import { Typography } from '@mui/material';
import { Navigate } from 'react-router';
import Home from '../pages';
import Layout from '../pages/layout';
import ValidatorLayout from '../pages/[validator_program_id]';
import ValidatorNFTs from '../pages/[validator_program_id]/nfts';

export const routes = [
  { path: '/', element: <Typography>Authenticate user</Typography> },
  {
    path: '',
    element: <Layout />,
    children: [
      { path: 'validators', element: <Home /> },
      {
        path: 'validators/:validator_program_id',
        element: <ValidatorLayout />,
        children: [
          { path: '', element: <Navigate to="nfts" /> },
          { path: 'nfts', element: <ValidatorNFTs /> },
        ],
      },
      {
        path: 'register-validator',
        element: <Typography>Testing works</Typography>,
      },
    ],
  },
  { path: '*', element: <Navigate to="/" /> },
];
