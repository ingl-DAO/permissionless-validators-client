import { Box } from '@mui/material';
import theme from '../../../theme/theme';
import NavItem from './navItem';

export default function Navbar() {
  const navLinks: { name: string; link: string }[] = [
    { name: 'Sales', link: 'sales' },
    { name: 'Purchases', link: 'purchases' },
  ];

  return (
    <Box
      sx={{
        backgroundColor: theme.common.placeholder,
        display: 'grid',
        padding: `${theme.spacing(0.5)} ${theme.spacing(0.625)}`,
        gridAutoFlow: 'column',
        columnGap: theme.spacing(1),
        borderRadius: '50px',
        width: '22vw',
        justifySelf: 'center',
      }}
    >
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
  );
}
