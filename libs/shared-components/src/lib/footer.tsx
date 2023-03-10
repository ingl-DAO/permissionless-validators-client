import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Links from './Links';

export default function Footer() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        justifyItems: 'center',
        alignItems: 'center',
        backgroundColor: '#1C1C28',
        padding: '3px 0',
      }}
    >
      <Link to={'/'} style={{ textDecoration: 'none' }}>
        <Typography variant="h1" sx={{ fontSize: '1.125rem' }} color="primary">
          ingl.io
        </Typography>
      </Link>
      <Typography variant="caption" sx={{ color: 'white' }}>
        Copyright &copy; {`${new Date().getFullYear()}`}
      </Typography>
      <Links />
    </Box>
  );
}
