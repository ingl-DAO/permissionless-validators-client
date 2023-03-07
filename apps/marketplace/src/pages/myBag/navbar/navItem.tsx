import { styled } from '@mui/material';
import { NavLink } from 'react-router-dom';
import theme from '../../../theme/theme';

const NavItem = styled(NavLink)(() => ({
  ...theme.typography.h6,
  color: 'white',
  transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  textDecoration: 'none',
  textAlign: 'center',
  borderRadius: '50px',
  '&:hover': {
    backgroundColor: 'rgba(29, 29, 41, 0.78)',
    transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    color: theme.palette.primary.light,
  },
  '&.active': {
    backgroundColor: 'rgba(29, 29, 41, 0.78)',
  },
}));

export default NavItem;
