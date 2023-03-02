import { RouteOutlined, SearchRounded } from '@mui/icons-material';
import { Button, InputAdornment, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { useNavigate } from 'react-router';
import theme from '../../theme/theme';

export default function HomeSearchBar({
  setSearchValue,
  searchValue,
}: {
  searchValue: string;
  setSearchValue: (val: string) => void;
}) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        columnGap: 2,
      }}
    >
      <Button
        variant="contained"
        startIcon={<RouteOutlined sx={{ fontSize: '24px' }} />}
      />
      <TextField
        size="small"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        sx={{
          backgroundColor: theme.common.inputBackground,
          input: {
            color: 'white',
            fontSize: '0.90rem',
            '&::placeholder': {
              color: 'white',
              fontSize: '0.90rem',
            },
          },
        }}
        fullWidth
        color="primary"
        placeholder="Search validator by name or vote account id"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchRounded sx={{ color: 'white', fontSize: '24px' }} />
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ textTransform: 'none' }}
        onClick={() => navigate('/list-validator')}
      >
        List Validator
      </Button>
    </Box>
  );
}
