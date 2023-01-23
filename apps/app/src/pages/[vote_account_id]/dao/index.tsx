import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import theme from '../../../theme/theme';
import { useState } from 'react';
import ProposalCard from './proposalCard';
import { SearchRounded } from '@mui/icons-material';
import Scrollbars from 'rc-scrollbars';

export default function Dao() {
  const [searchValue, setSearchValue] = useState<string>('');
  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(2),
        height: '100%',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <Typography variant="h5">DAO</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 0.4fr',
          columnGap: theme.spacing(3.125),
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            rowGap: theme.spacing(2),
            height: '100%',
            gridTemplateRows: 'auto 1fr',
          }}
        >
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
          <Scrollbars autoHide>
            <ProposalCard
              noPercentage={10}
              noVotes={20}
              numeration={1}
              status="Voting"
              title="Change validator ID, current validator ID malevolent"
              subtitle="Succeeded some seconds ago"
              yesPercentage={20}
              yesVotes={40}
            />
          </Scrollbars>
        </Box>
        <Box
          sx={{
            display: 'grid',
            rowGap: theme.spacing(2.5),
            alignContent: 'start',
          }}
        >
          <Button variant="contained" color="primary" fullWidth>
            New Proposal
          </Button>
          <Box
            sx={{
              display: 'grid',
              rowGap: theme.spacing(1),
              backgroundColor: '#28293D',
              padding: theme.spacing(1),
              borderRadius: '15px',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                columnGap: theme.spacing(1),
              }}
            >
              <Typography variant="caption" sx={{ color: 'white' }}>
                My governance power
              </Typography>
              <Typography variant="caption" sx={{ color: 'white' }}>
                44 NFTs
              </Typography>
            </Box>
            <Box
              sx={{
                padding: theme.spacing(3),
                backgroundColor: 'rgba(28, 28, 40, 1)',
                borderRadius: '15px',
                height: '86px',
              }}
            ></Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
