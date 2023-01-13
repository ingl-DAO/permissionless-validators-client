import { Typography } from '@mui/material';
import { Navigate } from 'react-router';

export const routes = [
  {
    path: '/',
    element: <Typography>Hello world</Typography>,
  },
  { path: '*', element: <Navigate to="/" /> },
];
