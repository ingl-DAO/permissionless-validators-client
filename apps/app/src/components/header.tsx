import { Box, Button } from '@mui/material';
import theme from '../theme/theme';
import Logo from '../assets/full_logo.png';
import { useNavigate } from 'react-router';

export default function Header() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        justifyItems: 'end',
        padding: `0 ${theme.spacing(4.75)}`,
        paddingTop: theme.spacing(4.25),
      }}
    >
      <img
        src={Logo}
        alt="ingl-logo"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/validators')}
      />
      <Button
        variant="contained"
        style={{
          textTransform: 'none',
          backgroundColor: '#2A2B40',
          borderRadius: '15px',
          boxShadow:
            '0px 0px 1px rgba(239, 35, 60, 0.08), 0px 1px 2px rgba(239, 35, 60, 0.32)',
        }}
      >
        Connect
      </Button>
    </Box>
  );
}
