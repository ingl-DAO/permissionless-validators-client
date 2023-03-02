import { Box, Typography } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { useState } from 'react';
import HomeSearchBar from '../../components/home/homeSearchBar';
import AllValidators from './allValidators';

export default function Home() {
  const [searchValue, setSearchValue] = useState<string>('');

  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: 4.375,
        height: '100%',
        gridTemplateRows: 'auto auto 1fr',
      }}
    >
      <HomeSearchBar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <Typography variant="h5">Validators on sale</Typography>
      <Scrollbars autoHide>
        <AllValidators searchValue={searchValue} />
      </Scrollbars>
    </Box>
  );
}
