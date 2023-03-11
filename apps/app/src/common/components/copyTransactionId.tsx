import { ContentCopyRounded } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

export default function CopyTransactionId({
  transaction_id,
  message,
  fullLength,
}: {
  transaction_id: string;
  message?: string;
  fullLength?: boolean;
}) {
  return (
    <Box
      sx={{
        color: 'white',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        columnGap: '16px',
        alignItems: 'center',
      }}
    >
      <Box>
        <Typography variant="body2">{message}</Typography>
        <Typography variant="caption">
          {`Transaction Id: ${
            fullLength
              ? transaction_id.slice(0, 32) + '...' + transaction_id.slice(-32)
              : transaction_id.slice(0, 10) + '...' + transaction_id.slice(-10)
          }`}
        </Typography>
      </Box>
      <label onClick={() => navigator.clipboard.writeText(transaction_id)}>
        <ContentCopyRounded
          fontSize="small"
          sx={{
            color: 'white',
            '&:hover': { color: `#EF233C` },
            justifySelf: 'start',
            cursor: 'pointer',
          }}
        />
      </label>
    </Box>
  );
}
