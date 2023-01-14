import { HomeOutlined } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { Outlet, useNavigate } from 'react-router';
import NavItem from '../../components/navItem';
import theme from '../../theme/theme';

export default function ValidatorLayout() {
  const navLinks: { name: string; link: string }[] = [
    { name: 'NFT', link: 'nfts' },
    { name: 'Rewards', link: 'rewards' },
    { name: 'Validator', link: 'details' },
    { name: 'DAO', link: 'dao' },
  ];
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'grid' }}>
      <Box
        sx={{
          backgroundColor: theme.common.placeholder,
          display: 'grid',
          padding: `${theme.spacing(0.5)} ${theme.spacing(0.625)}`,
          gridAutoFlow: 'column',
          columnGap: theme.spacing(1),
          borderRadius: '50px',
          width: '75vw',
          justifySelf: 'center',
        }}
      >
        <Tooltip arrow title="Validators">
          <Box
            sx={{
              justifyItems: 'center',
              transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
              borderRadius: '50px',
              display: 'grid',
              height: '100%',
              alignItems: 'center',
              '&:hover': {
                transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                backgroundColor: 'rgba(29, 29, 41, 0.78)',
              },
            }}
            onClick={() => navigate('/validators')}
          >
            <HomeOutlined color="primary" />
          </Box>
        </Tooltip>
        {navLinks.map(({ link, name }, index) => (
          <NavItem
            to={link}
            sx={{ height: '100%', padding: `0 ${theme.spacing(0.25)}` }}
            key={index}
          >
            {name}
          </NavItem>
        ))}
      </Box>
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
