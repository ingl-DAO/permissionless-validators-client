import { Box, Typography } from '@mui/material';
import Links from './Links';

export default function Footer() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        justifyItems: 'center',
        alignItems: 'center',
        backgroundColor: '#0B1016',
        padding: '10px',
        width: '100%',
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '1.125rem' }} color="secondary">
        ingl.io
      </Typography>
      <Typography variant="caption" sx={{ color: 'white' }}>
        Copyright &copy; {`${new Date().getFullYear()}`}
      </Typography>
      <Links />
    </Box>
  );
}
