import { Box, Button } from '@mui/material';
import useNotification from '../utils/notification';

export const ErrorMessage = ({
  retryFunction,
  notification,
  message,
  closeFunction
}: {
  retryFunction: () => void;
  notification: useNotification;
  message: string;
  closeFunction?: ()=>void;
}) => (
  <Box sx={{ textAlign: 'center' }}>
    {message}
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        justifyItems: 'center',
        marginTop: '10px',
      }}
    >
      <Button
        color="primary"
        size="small"
        variant="contained"
        onClick={() => {
          retryFunction();
          notification.dismiss();
        }}
      >
        Retry
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => closeFunction? closeFunction(): notification.dismiss()}
      >
        Close
      </Button>
    </Box>
  </Box>
);

export default ErrorMessage;
