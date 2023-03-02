import { Box } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { Outlet } from 'react-router';
import Footer from '../components/footer';
import Header from '../components/header';
import theme from '../theme/theme';

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
      <Box
        sx={{
          height: '100%',
          padding: `0 ${theme.spacing(4.75)}`,
          color: 'white',
        }}
      >
        <Scrollbars autoHide>
          <Outlet />
        </Scrollbars>
      </Box>
      <Box>
        <Footer />
      </Box>
    </Box>
  );
}
