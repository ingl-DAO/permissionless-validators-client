import Header from '../components/header';
import { Box } from '@mui/material';
import { Outlet } from 'react-router';
import Footer from '../components/footer';
import Scrollbars from 'rc-scrollbars';
import theme from '../theme/theme';

export default function Layout() {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'grid',
        gridTemplateRows: '1fr auto',
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          rowGap: theme.spacing(4.375),
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
      </Box>
      <Footer />
    </Box>
  );
}
