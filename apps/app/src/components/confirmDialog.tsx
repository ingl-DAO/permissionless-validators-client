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
  isCancelContained = false,
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
  confirm: () => void;
  dialogMessage: string | JSX.Element;
  dialogTitle?: string;
  confirmButton?: string;
  isCancelContained?: boolean;
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
          maxWidth: '765px',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '28px',
          color: isCancelContained ? theme.palette.primary.main : 'white',
        }}
      >
        {dialogTitle}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#ffffff99' }}>
          {dialogMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{
            textTransform: 'none',
            color: isCancelContained ? 'black' : theme.palette.error.main,
          }}
          color={isCancelContained ? 'inherit' : 'error'}
          variant={isCancelContained ? 'contained' : 'text'}
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
