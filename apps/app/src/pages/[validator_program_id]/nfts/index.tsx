import { ReportRounded } from '@mui/icons-material';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import ErrorMessage from '../../../common/components/ErrorMessage';
import useNotification from '../../../common/utils/notification';
import ConfirmDialog from '../../../components/confirmDialog';
import NftCard from '../../../components/nft/nftCard';
import { InglNft } from '../../../interfaces';
import { NftService } from '../../../services/nft.service';
import theme from '../../../theme/theme';

export default function ValidatorNFTs() {
  const walletContext = useWallet();
  const { connection } = useConnection();
  const { validator_program_id } = useParams();

  const [isConfirmMintDialogOpen, setIsConfirmMintDialogOpen] =
    useState<boolean>(false);

  const nftService = useMemo(
    () =>
      validator_program_id
        ? new NftService(new PublicKey(validator_program_id), connection, walletContext)
        : null,
    [connection, validator_program_id, walletContext]
  );
  const [nfts, setNfts] = useState<InglNft[]>([]);

  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [nftNotif, setNftNotif] = useState<useNotification>();

  const mintNft = () => {
    setIsMinting(true);
    const notif = new useNotification();
    if (nftNotif) nftNotif.dismiss();
    setNftNotif(notif);
    notif.notify({
      render: 'Minting your awesome NFT...',
    });
    nftService
      ?.mintNft()
      .then((tokenMint) => {
        notif.update({
          render: 'NFT minted successfully',
        });
        nftService
          ?.loadNFT(tokenMint)
          .then((newNft) => {
            if (newNft) setNfts([newNft, ...nfts]);
            setNftNotif(undefined);
          })
          .catch((error) => {
            notif.update({
              type: 'ERROR',
              render:
                error?.message ||
                'An error occured while fetching new token data.',
              icon: () => <ReportRounded fontSize="medium" color="error" />,
            });
          });
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => mintNft()}
              notification={notif}
              message={
                error?.message ||
                'There was an error minting the NFT. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setIsMinting(false));
  };

  const [areNftsLoading, setAreNftsLoading] = useState<boolean>(false);

  const loadNfts = () => {
    setAreNftsLoading(true);
    const notif = new useNotification();
    if (nftNotif) {
      nftNotif.dismiss();
    }
    setNftNotif(notif);
    notif.notify({
      render: 'Loading nfts...',
    });
    nftService
      ?.loadNFTs()
      .then((nfts) => {
        setNfts(nfts);
        notif.dismiss();
        setNftNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadNfts}
              notification={notif}
              message={
                error?.message ||
                'There was an error loading nfts. please retry!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setAreNftsLoading(false));
  };

  useEffect(() => {
    if (nftService) loadNfts();
    return () => {
      //TODO: CLEANUP ABOVE CALL
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftService]);

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
    nftService
      ?.redeemNft(new PublicKey(actionnedNft.nft_mint_id))
      .then(() => {
        setNfts(
          nfts.filter(({ numeration: n }) => n !== actionnedNft.numeration)
        );
        setActionnedNft(undefined);
        notif.update({
          render: 'NFT redeemed successfully',
        });
        setNftNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => redeemNft(actionnedNft)}
              notification={notif}
              message={
                error?.message ||
                'There was an error redeeming the NFT. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setIsRedeeming(false));
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
    nftService
      ?.delegateNft(new PublicKey(actionnedNft.nft_mint_id))
      .then(() => {
        setNfts(
          nfts.map((nft) => {
            const { numeration: n } = nft;
            if (n === actionnedNft.numeration)
              return { ...nft, is_delegated: true };
            return nft;
          })
        );
        notif.update({
          render: 'NFT delegated successfully',
        });
        setActionnedNft(undefined);
        setNftNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => delegateNft(actionnedNft)}
              notification={notif}
              message={
                error?.message ||
                'There was an error delegating the NFT. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setIsDelegating(false));
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
    nftService
      ?.undelegateNft(new PublicKey(actionnedNft.nft_mint_id))
      .then(() => {
        setNfts(
          nfts.map((nft) => {
            const { numeration: n } = nft;
            if (n === actionnedNft.numeration)
              return { ...nft, is_delegated: false };
            return nft;
          })
        );
        notif.update({
          render: 'NFT undelegated successfully',
        });
        setActionnedNft(undefined);
        setNftNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => undelegateNft(actionnedNft)}
              notification={notif}
              message={
                error?.message ||
                'There was an error undelegating the NFT. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setIsUndelegating(false));
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
    nftService
      ?.imprintRarity(
        new PublicKey(actionnedNft.nft_mint_id),
        WalletAdapterNetwork.Devnet
      )
      .then(() => {
        setNfts(
          nfts.map((nft) => {
            const { numeration: n } = nft;
            if (n !== actionnedNft.numeration)
              return { ...nft, rarity: 'benetoite' };
            return nft;
          })
        );
        notif.update({
          render: 'Revealed rarity successfully',
        });
        setActionnedNft(undefined);
        setNftNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => revealRarity(actionnedNft)}
              notification={notif}
              message={
                error?.message ||
                "There was an error revealing the NFT's rarity. Please try again!!!"
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setIsRevealing(false));
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
            dialogTitle={'Confirm NFT Rarity Revelation'}
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
        confirm={() => mintNft()}
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
        <Box>
          {areNftsLoading ? (
            <Box
              sx={{
                display: 'grid',
                justifyItems: 'start',
                justifyContent: 'center',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 300px))',
                columnGap: '53px',
                rowGap: '20px',
              }}
            >
              {[...new Array(10)].map((_, index) => (
                <Skeleton
                  animation="wave"
                  key={index}
                  width="300px"
                  height="500px"
                  sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                />
              ))}
            </Box>
          ) : nfts.length === 0 ? (
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              'You own no NFT's
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                justifyItems: 'start',
                justifyContent: 'center',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 300px))',
                columnGap: '53px',
                rowGap: '20px',
              }}
            >
              {nfts.map((nft, index) => (
                <NftCard
                  delegateNft={() => setIsConfirmDelegateDialogOpen(true)}
                  redeemNft={() => setIsConfirmRedeemDialogOpen(true)}
                  revealRarity={() => {
                    setActionnedNft(nft);
                    setIsConfirmRevealRarityDialogOpen(true);
                  }}
                  undelegateNft={() => setIsConfirmUndelegateDialogOpen(true)}
                  setActionnedNft={setActionnedNft}
                  disabled={
                    isRedeeming || isDelegating || isUndelegating || isRevealing
                  }
                  isDialogOpen={true}
                  nftData={nft}
                  key={index}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
