import { Typography } from '@mui/material';
import { Navigate } from 'react-router';
import Home from '../pages';
import Layout from '../pages/layout';
import ValidatorLayout from '../pages/[validator_program_id]';
import ValidatorNFTs from '../pages/[validator_program_id]/nfts';
import Register from '../pages/register-validator';
import Rewards from '../pages/[validator_program_id]/rewards/index';
import ValidatorStats from '../pages/[validator_program_id]/validatorStats';
import Dao from '../pages/[vote_account_id]/dao';

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
          { path: 'rewards', element: <Rewards /> },
          { path: 'details', element: <ValidatorStats /> },
          { path: 'dao', element: <Dao /> },
        ],
      },
      {
        path: 'register-validator',
        element: <Register />,
      },
    ],
  },
  { path: '*', element: <Navigate to="/" /> },
];
