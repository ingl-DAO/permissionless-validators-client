import Header from '../components/header';
import { Box } from '@mui/material';
import { Outlet } from 'react-router';
import Footer from '../components/footer';
import Scrollbars from 'rc-scrollbars';

export default function Layout() {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
      }}
    >
      <Header />
      <Scrollbars autoHide>
        <Outlet />
      </Scrollbars>
      <Footer />
    </Box>
  );
}
