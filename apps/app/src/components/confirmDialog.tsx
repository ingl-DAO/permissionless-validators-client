import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import DialogTransition from '../common/components/DialogTransition';
import theme from '../theme/theme';

export default function ConfirmDialog({
  isDialogOpen,
  closeDialog,
  confirm,
  dialogMessage,
  dialogTitle = 'Confirm',
  confirmButton = 'Confirm',
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
  confirm: () => void;
  dialogMessage: string;
  dialogTitle?: string;
  confirmButton?: string;
}) {
  return (
    <Dialog
      open={isDialogOpen}
      TransitionComponent={DialogTransition}
      keepMounted
      onClose={closeDialog}
      sx={{
        '.MuiPaper-root': {
          backgroundColor: theme.common.dialogBackground,
          color: 'white',
        },
      }}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#ffffff99' }}>
          {dialogMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ textTransform: 'none' }}
          color="error"
          variant="text"
          onClick={closeDialog}
        >
          Cancel
        </Button>
        <Button
          sx={{ textTransform: 'none' }}
          color="primary"
          variant="contained"
          onClick={() => {
            confirm();
            closeDialog();
          }}
        >
          {confirmButton}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
