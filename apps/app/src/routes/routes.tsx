import { Navigate } from 'react-router';
import Home from '../pages';
import Layout from '../pages/layout';
import Register from '../pages/register-validator';
import ValidatorLayout from '../pages/[validator_program_id]';
import ValidatorNFTs from '../pages/[validator_program_id]/nfts';
import Rewards from '../pages/[validator_program_id]/rewards/index';
import ValidatorStats from '../pages/[validator_program_id]/validatorStats';
import Dao from '../pages/[validator_program_id]/dao';

export const routes = [
  { path: '/', element: <Navigate to="/programs" /> },
  {
    path: '',
    element: <Layout />,
    children: [
      { path: 'programs', element: <Home /> },
      {
        path: 'programs/:validator_program_id',
        element: <ValidatorLayout />,
        children: [
          { path: '', element: <Navigate to="details" /> },
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
