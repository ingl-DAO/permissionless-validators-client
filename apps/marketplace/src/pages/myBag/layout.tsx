import { Box } from '@mui/system';
import { Outlet } from 'react-router';
import Navbar from './navbar/navbar';

export default function MyBagLayout() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        rowGap: 2.375,
      }}
    >
      <Navbar />
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
