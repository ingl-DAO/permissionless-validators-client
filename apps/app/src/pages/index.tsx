import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import Scrollbars from 'rc-scrollbars';
import { useState } from 'react';
import HomeSearchBar from '../components/homeSearchBar';
import AllValidators from '../components/validators/validators';
import theme from '../theme/theme';

export default function Home() {
  const [searchValue, setSearchValue] = useState<string>('');

  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(4.375),
        height: '100%',
        gridTemplateRows: 'auto auto 1fr',
      }}
    >
      <HomeSearchBar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <Typography variant="h5">Permissionless Validators</Typography>
      <Scrollbars autoHide>
        <AllValidators searchValue={searchValue} />
      </Scrollbars>
    </Box>
  );
}
