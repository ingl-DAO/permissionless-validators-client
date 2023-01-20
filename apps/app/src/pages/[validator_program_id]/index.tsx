import { Box } from '@mui/material';
import { Outlet } from 'react-router';
import Navbar from '../../components/navbar';
import theme from '../../theme/theme';

export default function ValidatorLayout() {
  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(2.375),
        height: '100%',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <Navbar />
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
