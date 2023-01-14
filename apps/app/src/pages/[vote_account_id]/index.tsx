import { Box } from '@mui/material';
import { Outlet } from 'react-router';
import Navbar from '../../components/navbar';

export default function ValidatorLayout() {
  return (
    <Box sx={{ display: 'grid' }}>
      <Navbar />
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
