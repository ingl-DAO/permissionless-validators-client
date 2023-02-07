import { ArrowForwardIosOutlined } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import theme from '../../theme/theme';

export default function ProposalCard({
  numeration,
  title,
  status,
  yesPercentage,
  yesVotes,
  noVotes,
  noPercentage,
  subtitle,
}: {
  numeration: number;
  title: string;
  status: 'Voting' | 'Defeated' | 'Success' | 'Executed' | 'Expired';
  yesVotes: number;
  yesPercentage: number;
  noVotes: number;
  noPercentage: number;
  subtitle: string;
}) {
  const totalVotes = noVotes + yesVotes;
  return (
    <Box
      sx={{
        backgroundColor: '#28293D',
        borderRadius: '15px',
        padding: `${theme.spacing(1)} ${theme.spacing(1)}`,
        display: 'grid',
        rowGap: theme.spacing(2),
        cursor: 'pointer',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          columnGap: theme.spacing(2),
        }}
      >
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          {`Proposal #${numeration < 10 ? `0${numeration}` : numeration}`}
        </Typography>
        <Box>
          <Box
            sx={{
              backgroundColor: '#1C1C28',
              color: 'white',
              borderRadius: '15px',
              border: ' 1px solid #D5F2E3',
              display: 'grid',
              gridAutoFlow: 'column',
              alignItems: 'center',
              columnGap: theme.spacing(4),
              padding: `4px 3px`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: '#D5F2E3', marginLeft: '4px' }}
            >
              {status}
            </Typography>
            <ArrowForwardIosOutlined sx={{ color: 'white' }} fontSize="small" />
          </Box>
        </Box>
      </Box>
      <Box>
        <Typography>{title}</Typography>
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
        >
          {subtitle}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto auto 1fr',
          columnGap: theme.spacing(6),
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            Yes Votes
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridAutoFlow: 'column',
              alignItems: 'center',
            }}
          >
            <Typography>{yesVotes < 10 ? `0${yesVotes}` : yesVotes}</Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              {`${yesPercentage < 10 ? `0${yesPercentage}` : yesPercentage}%`}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            No Votes
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridAutoFlow: 'column',
              alignItems: 'center',
            }}
          >
            <Typography>{noVotes < 10 ? `0${noVotes}` : noVotes}</Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              {`${noPercentage < 10 ? `0${noPercentage}` : noPercentage}%`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ justifySelf: 'end' }}>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            Total votes
          </Typography>
          <Typography sx={{ textAlign: 'end' }}>
            {totalVotes < 10 ? `0${totalVotes}` : totalVotes}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
