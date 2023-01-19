import { Box, Paper, Skeleton, Typography } from '@mui/material';
import shortenNumber from '../../common/utils/shortenNumber';
import theme from '../../theme/theme';
import BN from 'bn.js';

export default function StatCard({
  upper,
  title_1,
  bottom,
  title_2,
  skeleton = false,
}: {
  upper: BN | number;
  title_1: string;
  bottom?: BN | number;
  title_2?: string;
  skeleton?: boolean;
}) {
  return (
    <Paper
      elevation={1}
      sx={{
        background: '#2D2E45',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(1),
        display: 'grid',
        justifyContent: 'center',
        rowGap: theme.spacing(4),
      }}
    >
      <Typography variant="h4" sx={{ color: 'white', textAlign: 'center' }}>
        {skeleton ? (
          <Skeleton
            animation="wave"
            sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
          />
        ) : (
          `${shortenNumber(upper)} ${
            bottom ? ` / ${shortenNumber(bottom)}` : ''
          }`
        )}
      </Typography>
      <Box sx={{ justifySelf: 'center' }}>
        <Typography variant="body2">{title_1}</Typography>
        {title_2 && (
          <>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              --------
            </Typography>
            <Typography variant="body2">{title_2}</Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}
