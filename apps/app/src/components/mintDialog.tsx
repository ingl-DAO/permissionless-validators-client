import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import DialogTransition from '../common/components/DialogTransition';
import theme from '../theme/theme';

export default function MintDialog({
  isDialogOpen,
  closeDialog,
  confirm,
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
  confirm: (numberOfNfts: number) => void;
}) {
  const [numberNFTs, setNumberNFTs] = useState(1);
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
          maxWidth: '465px',
          width: '100%',
        },
      }}
    >
      <DialogTitle sx={{ fontSize: '28px' }}>
        Confirm How Many NFTs to Mint
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#ffffff99' }}>
          Enter the number of NFTs you want to mint
        </DialogContentText>
        <TextField
          size="small"
          placeholder={'Number of NFTs'}
          fullWidth
          type={'number'}
          value={numberNFTs}
          onChange={(e) =>
            setNumberNFTs(
              parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value)
            )
          }
          sx={{
            '& input': {
              backgroundColor: '#28293D',
              color: 'white',
              '&::placeholder': {
                color: 'white',
              },
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ textTransform: 'none' }}
          color="error"
          variant="text"
          onClick={() => {
            setNumberNFTs(1);
            closeDialog();
          }}
        >
          Cancel
        </Button>
        <Button
          sx={{ textTransform: 'none' }}
          color="primary"
          variant="contained"
          onClick={() => {
            confirm(numberNFTs);
            setNumberNFTs(1);
            closeDialog();
          }}
        >
          Mint {numberNFTs} NFT NOW
        </Button>
      </DialogActions>
    </Dialog>
  );
}
