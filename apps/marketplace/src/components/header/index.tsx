import { LocalMallOutlined } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import theme from '../../theme/theme';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        columnGap: 2,
        padding: `0 ${theme.spacing(4.75)}`,
        paddingTop: 4.25,
      }}
    >
      <img
        alt="ingl marketplace logo"
        src={'/assets/full_logo.png'}
        style={{ cursor: 'pointer', height: '45px' }}
        onClick={() => navigate('/')}
      />
      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 2 }}
      >
        <Button
          startIcon={<LocalMallOutlined />}
          variant="outlined"
          color="primary"
          sx={{ textTransform: 'none' }}
          onClick={() => navigate('/my-bag')}
        >
          My shopping bag
        </Button>
        <WalletMultiButton
          style={{
            textTransform: 'none',
            backgroundColor: '#2A2B40',
            borderRadius: '15px',
            boxShadow:
              '0px 0px 1px rgba(239, 35, 60, 0.08), 0px 1px 2px rgba(239, 35, 60, 0.32)',
          }}
        />
      </Box>
    </Box>
  );
}
