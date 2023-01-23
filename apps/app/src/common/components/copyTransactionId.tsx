import { ContentCopyRounded } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

export default function CopyTransactionId({
  transaction_id,
  message,
}: {
  transaction_id: string;
  message?: string;
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
        <Typography variant="caption">{transaction_id}</Typography>
      </Box>
      <Button
        color="primary"
        variant="contained"
        size="small"
        endIcon={
          <ContentCopyRounded
            fontSize="small"
            sx={{
              color: 'white',
              '&:hover': { color: `#EF233C` },
              justifySelf: 'start',
              cursor: 'pointer',
            }}
          />
        }
        onClick={() => navigator.clipboard.writeText(transaction_id)}
      />
    </Box>
  );
}
