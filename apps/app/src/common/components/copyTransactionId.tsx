import { Box, Button, Typography } from '@mui/material';

export default function CopyTransactionId({
  transaction_id,
  message,
}: {
  transaction_id: string;
  message?: string;
}) {
  return (
    <Box sx={{color:'whiteF'}}>
      <Typography variant="body2">{message}</Typography>
      <Typography variant="caption">{transaction_id}</Typography>
      <Button
        color="primary"
        variant="contained"
        onClick={() => navigator.clipboard.writeText(transaction_id)}
      >
        Copy transaction id
      </Button>
    </Box>
  );
}
