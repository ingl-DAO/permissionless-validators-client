import { ReportRounded } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ErrorMessage from '../../../common/components/ErrorMessage';
import useNotification from '../../../common/utils/notification';
import ConfirmDialog from '../../../components/confirmDialog';
import NftCard from '../../../components/nft/nftCard';
import { InglNft } from '../../../interfaces';
import theme from '../../../theme/theme';

export default function ValidatorNFTs() {
  const [isConfirmMintDialogOpen, setIsConfirmMintDialogOpen] =
    useState<boolean>(false);

  const [nfts, setNfts] = useState<InglNft[]>([]);

  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [nftNotif, setNftNotif] = useState<useNotification>();

  const mintNft = (vote_account_id: string) => {
    setIsMinting(true);
    const notif = new useNotification();
    if (nftNotif) nftNotif.dismiss();
    setNftNotif(notif);
    notif.notify({
      render: 'Minting your awesome NFT...',
    });
    setTimeout(() => {
      //TODO: call api here to mint nft with data vote_account_id
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        const newNft: InglNft = {
          image_ref: '',
          is_delegated: false,
          nft_pubkey: '5Jkv2mQeoBDhByhgVamWJZEnWd8JkvCb1EhaStMYFEP',
          numeration: 1,
        };
        setNfts([newNft, ...nfts]);
        setIsMinting(false);
        notif.update({
          render: 'NFT minted successfully',
        });
        setNftNotif(undefined);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => mintNft(vote_account_id)}
              notification={notif}
              //TODO: message should come from backend
              message={
                'There was an error minting the NFT. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const [areNftsLoading, setAreNftsLoading] = useState<boolean>(false);

  const loadNfts = () => {
    setAreNftsLoading(true);
    const notif = new useNotification();
    if (nftNotif) {
      nftNotif.dismiss();
    }
    setNftNotif(notif);
    setTimeout(() => {
      //TODO: call api here to load validators
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        const newValidators: InglNft[] = [];
        setNfts(newValidators);
        setAreNftsLoading(false);
        notif.dismiss();
        setNftNotif(undefined);
      } else {
        notif.notify({
          render: 'Loading validators...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadNfts}
              notification={notif}
              //TODO: message should come from backend
              message={'There was an error loading validators. please retry!!!'}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  useEffect(() => {
    loadNfts();
    return () => {
      //TODO: CLEANUP ABOVE CALL
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { vote_account_id } = useParams();

  const [actionnedNft, setActionnedNft] = useState<InglNft>();
  const [isConfirmRedeemDialogOpen, setIsConfirmRedeemDialogOpen] =
    useState<boolean>(false);
  const [isConfirmDelegateDialogOpen, setIsConfirmDelegateDialogOpen] =
    useState<boolean>(false);
  const [isConfirmUnDelegateDialogOpen, setIsConfirmUndelegateDialogOpen] =
    useState<boolean>(false);
  const [isConfirmRevealRarityDialogOpen, setIsConfirmRevealRarityDialogOpen] =
    useState<boolean>(false);

  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  const redeemNft = (actionnedNft: InglNft) => {
    setIsRedeeming(true);
    const notif = new useNotification();
    if (nftNotif) nftNotif.dismiss();
    setNftNotif(notif);
    notif.notify({
      render: "Redeeming your NFT's worth...",
    });
    setTimeout(() => {
      //TODO: call api here to redeem nft with data actionnedNft
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        setNfts(
          nfts.filter(({ numeration: n }) => n !== actionnedNft.numeration)
        );
        setActionnedNft(undefined);
        setIsRedeeming(false);
        notif.update({
          render: 'NFT redeemed successfully',
        });
        setNftNotif(undefined);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => redeemNft(actionnedNft)}
              notification={notif}
              //TODO: message should come from backend
              message={
                'There was an error redeeming the NFT. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const [isDelegating, setIsDelegating] = useState<boolean>(false);

  const delegateNft = (actionnedNft: InglNft) => {
    setIsDelegating(true);
    const notif = new useNotification();
    if (nftNotif) nftNotif.dismiss();
    setNftNotif(notif);
    notif.notify({
      render: "Delegating your NFT's worth...",
    });
    setTimeout(() => {
      //TODO: call api here to delegate nft with data actionnedNft
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        setNfts(
          nfts.map((nft) => {
            const { numeration: n } = nft;
            if (n !== actionnedNft.numeration)
              return { ...nft, is_delegated: true };
            return nft;
          })
        );
        setIsDelegating(false);
        notif.update({
          render: 'NFT delegated successfully',
        });
        setActionnedNft(undefined);
        setNftNotif(undefined);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => delegateNft(actionnedNft)}
              notification={notif}
              //TODO: message should come from backend
              message={
                'There was an error delegating the NFT. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const [isUndelegating, setIsUndelegating] = useState<boolean>(false);

  const undelegateNft = (actionnedNft: InglNft) => {
    setIsUndelegating(true);
    const notif = new useNotification();
    if (nftNotif) nftNotif.dismiss();
    setNftNotif(notif);
    notif.notify({
      render: "Undelegating your NFT's worth...",
    });
    setTimeout(() => {
      //TODO: call api here to undelegate nft with data actionnedNft
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        setNfts(
          nfts.map((nft) => {
            const { numeration: n } = nft;
            if (n !== actionnedNft.numeration)
              return { ...nft, is_delegated: false };
            return nft;
          })
        );
        setIsUndelegating(false);
        notif.update({
          render: 'NFT undelegated successfully',
        });
        setActionnedNft(undefined);
        setNftNotif(undefined);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => undelegateNft(actionnedNft)}
              notification={notif}
              //TODO: message should come from backend
              message={
                'There was an error undelegating the NFT. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const [isRevealing, setIsRevealing] = useState<boolean>(false);

  const revealRarity = (actionnedNft: InglNft) => {
    setIsRevealing(true);
    const notif = new useNotification();
    if (nftNotif) nftNotif.dismiss();
    setNftNotif(notif);
    notif.notify({
      render: "revealing your NFT's rarity...",
    });
    setTimeout(() => {
      //TODO: call api here to reveal nft's rarity with data actionnedNft
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        setNfts(
          nfts.map((nft) => {
            const { numeration: n } = nft;
            if (n !== actionnedNft.numeration)
              return { ...nft, rarity: 'benetoite' };
            return nft;
          })
        );
        setIsRevealing(false);
        setActionnedNft(undefined);
        notif.update({
          render: 'Revealed rarity successfully',
        });
        setNftNotif(undefined);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => revealRarity(actionnedNft)}
              notification={notif}
              //TODO: message should come from backend
              message={
                "There was an error revealing the NFT's rarity. Please try again!!!"
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  return (
    <>
      {actionnedNft && (
        <>
          <ConfirmDialog
            closeDialog={() => setIsConfirmRevealRarityDialogOpen(false)}
            dialogMessage={
              "You are about to reveal your NFT's rarity. Click confirm to continue!"
            }
            isDialogOpen={isConfirmRevealRarityDialogOpen}
            dialogTitle={'Confirm NFT Rarity'}
            confirmButton="Reveal"
            confirm={() => (actionnedNft ? revealRarity(actionnedNft) : null)}
          />
          <ConfirmDialog
            closeDialog={() => setIsConfirmUndelegateDialogOpen(false)}
            dialogMessage={
              'You are about to undelegate your NFT. Click confirm to continue!'
            }
            isDialogOpen={isConfirmUnDelegateDialogOpen}
            dialogTitle={'Confirm Undelegate NFT'}
            confirmButton="Undelegate"
            confirm={() => (actionnedNft ? undelegateNft(actionnedNft) : null)}
          />
          <ConfirmDialog
            closeDialog={() => setIsConfirmDelegateDialogOpen(false)}
            dialogMessage={
              'You are about to delegate your NFT. Click confirm to continue!'
            }
            isDialogOpen={isConfirmDelegateDialogOpen}
            dialogTitle={'Confirm Delegate NFT'}
            confirmButton="Delegate"
            confirm={() => (actionnedNft ? delegateNft(actionnedNft) : null)}
          />
          <ConfirmDialog
            closeDialog={() => setIsConfirmRedeemDialogOpen(false)}
            dialogMessage={
              "Are you sure you want to redeem your NFT's worth. Click confirm to continue!"
            }
            isDialogOpen={isConfirmRedeemDialogOpen}
            dialogTitle={'Confirm Redeem NFT'}
            confirmButton="Redeem"
            confirm={() => (actionnedNft ? redeemNft(actionnedNft) : null)}
          />
        </>
      )}
      <ConfirmDialog
        closeDialog={() => setIsConfirmMintDialogOpen(false)}
        dialogMessage={
          'You are about to mint a new nft. Click confirm to continue!'
        }
        isDialogOpen={isConfirmMintDialogOpen}
        dialogTitle={'Confirm Mint NFT'}
        confirmButton="Mint"
        confirm={() => mintNft(vote_account_id as string)}
      />
      <Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            columnGap: theme.spacing(2),
          }}
        >
          <Typography variant="h5">My NFT Collection</Typography>
          <Button
            variant="contained"
            color="primary"
            disabled={isMinting || areNftsLoading}
            onClick={() => setIsConfirmMintDialogOpen(true)}
          >
            Mint NFT Now
          </Button>
        </Box>
        <NftCard
          delegateNft={() => setIsConfirmDelegateDialogOpen(true)}
          redeemNft={() => setIsConfirmRedeemDialogOpen(true)}
          revealRarity={() => setIsConfirmRevealRarityDialogOpen(true)}
          undelegateNft={() => setIsConfirmUndelegateDialogOpen}
          setActionnedNft={setActionnedNft}
          disabled={
            isRedeeming || isDelegating || isUndelegating || isRevealing
          }
          isDialogOpen={true}
          gem={{
            image_ref:
              'https://img.bitscoins.net/v7/www.bitscoins.net/wp-content/uploads/2021/06/NFT-Marketplace-Rarible-Raises-Over-14-Million-Plans-to-Launch.jpg',
            is_delegated: false,
            nft_pubkey: 'Make it rain in th best ways',
            numeration: 1,
            rarity: 'Benetoite',
          }}
        />
      </Box>
    </>
  );
}
