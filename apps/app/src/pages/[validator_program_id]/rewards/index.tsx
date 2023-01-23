import { ReportRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import ErrorMessage from '../../../common/components/ErrorMessage';
import NoTableElement, {
  TableLaneSkeleton,
} from '../../../common/components/noTableElement';
import useNotification from '../../../common/utils/notification';
import ConfirmDialog from '../../../components/confirmDialog';
import { NftReward } from '../../../interfaces';
import { NftService } from '../../../services/nft.service';
import theme from '../../../theme/theme';
import RewardLine from './rewardLine';

export default function Rewards() {
  const walletContext = useWallet();
  const { connection } = useConnection();
  const { program_id } = useParams();

  const [areRewardsLoading, setAreRewardsLoading] = useState<boolean>(false);
  const [rewardNotif, setRewardNotif] = useState<useNotification>();
  const [rewards, setRewards] = useState<NftReward[]>([]);

  const nftService = useMemo(
    () =>
      program_id
        ? new NftService(new PublicKey(program_id), connection, walletContext)
        : null,
    [connection, program_id, walletContext]
  );

  const loadRewards = () => {
    setAreRewardsLoading(true);
    const notif = new useNotification();
    if (rewardNotif) {
      rewardNotif.dismiss();
    }
    setRewardNotif(notif);
    notif.notify({
      render: 'Loading rewards...',
    });
    nftService
      ?.loadRewards()
      .then((rewards) => {
        setRewards(rewards);
        setAreRewardsLoading(false);
        notif.dismiss();
        setRewardNotif(undefined);
      })
      .catch((error) => {
        console.log('Error here', error);
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadRewards()}
              notification={notif}
              message={
                error?.message ||
                'There was an error loading rewards. please retry!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  useEffect(() => {
    if (walletContext.connected && nftService) loadRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftService]);

  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const claimRewards = (actionnedNfts: string[]) => {
    setIsClaiming(true);
    const notif = new useNotification();
    if (rewardNotif) rewardNotif.dismiss();
    setRewardNotif(notif);
    notif.notify({
      render: 'Claiming rewards...',
    });
    const totalRewards = Number(
      rewards.reduce((total, { rewards }) => total + rewards, 0).toString(10)
    );
    nftService
      ?.claimRewards(
        actionnedNfts.map((address) => new PublicKey(address)),
        totalRewards
      )
      .then(() => {
        setRewards(
          rewards.map((reward) => {
            const { nft_mint_id: nft_pubkey } = reward;
            if (actionnedNfts.includes(nft_pubkey))
              return { ...reward, rewards: 0 };
            return reward;
          })
        );
        notif.update({
          render: 'Claimed rewards successfully',
        });
        setRewardNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => claimRewards(actionnedNfts)}
              notification={notif}
              message={
                error?.message ||
                'There was an error claiming your rewards. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setIsClaiming(false));
  };

  const [selectedRewards, setSelectedRewards] = useState<NftReward[]>([]);
  const [isConfirmClaimDialogOpen, setIsConfirmClaimDialogOpen] =
    useState<boolean>(false);
  return (
    <>
      <ConfirmDialog
        closeDialog={() => setIsConfirmClaimDialogOpen(false)}
        confirm={() =>
          claimRewards(selectedRewards.map(({ nft_mint_id }) => nft_mint_id))
        }
        dialogMessage="You are about to claim rewards on select nfts. Click Claim to continue!!!"
        isDialogOpen={isConfirmClaimDialogOpen}
        confirmButton="Claim"
        dialogTitle="Claim Rewards"
      />
      <Box
        sx={{
          display: 'grid',
          rowGap: theme.spacing(5),
          height: '100%',
          gridTemplateRows: 'auto 1fr',
        }}
      >
        <Box sx={{ display: 'grid', rowGap: theme.spacing(1.4) }}>
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
              disabled={isClaiming || areRewardsLoading}
              onClick={() => setIsConfirmClaimDialogOpen(true)}
            >
              Claim Rewards
            </Button>
          </Box>
          <Typography variant="h6">
            Total claimable rewards:{' '}
            <Typography
              variant="h6"
              component="span"
              sx={{ color: theme.palette.primary.main }}
            >{`${rewards
              .reduce((total, { rewards }) => total + rewards, 0)
              .toString(10)} SOL`}</Typography>
          </Typography>
        </Box>
        <Scrollbars autoHide>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-root': {
                    border: 'none',
                    padding: '2px 8px',
                  },
                }}
              >
                <TableCell align="center">
                  <Checkbox
                    color="primary"
                    checked={
                      selectedRewards.length === rewards.length &&
                      rewards.length > 0
                    }
                    indeterminate={
                      rewards.length === 0 ||
                      (selectedRewards.length > 0 &&
                        selectedRewards.length !== rewards.length)
                    }
                    onClick={() => {
                      if (rewards.length > 0)
                        if (selectedRewards.length === rewards.length)
                          setSelectedRewards([]);
                        else
                          setSelectedRewards(
                            rewards.filter((r) => r.rewards > 0)
                          );
                    }}
                  />
                </TableCell>
                {['Image', 'Numeration', 'NFT pubkey', 'Rewards (SOL)'].map(
                  (val, index) => (
                    <TableCell
                      sx={{ color: 'rgba(255, 255, 255, 0.75)' }}
                      key={index}
                      align={index === 3 ? 'right' : 'left'}
                    >
                      {val}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {areRewardsLoading ? (
                [...new Array(10)].map((_, index) => (
                  <TableLaneSkeleton cols={5} key={index} />
                ))
              ) : rewards.length === 0 ? (
                <NoTableElement
                  message="No NFTS to calculate rewards on"
                  colSpan={5}
                />
              ) : (
                rewards.map((reward, index) => (
                  <RewardLine
                    key={index}
                    reward={reward}
                    isChecked={Boolean(
                      selectedRewards.find(
                        ({ nft_mint_id: nft_pubkey }) =>
                          nft_pubkey === reward.nft_mint_id
                      )
                    )}
                    onSelect={(reward: NftReward) => {
                      const tt = selectedRewards.find(
                        ({ nft_mint_id: nft_pubkey }) =>
                          nft_pubkey === reward.nft_mint_id
                      );
                      if (tt)
                        return setSelectedRewards(
                          selectedRewards.filter(
                            ({ nft_mint_id: nft_pubkey }) =>
                              nft_pubkey !== reward.nft_mint_id
                          )
                        );
                      return setSelectedRewards([...selectedRewards, reward]);
                    }}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbars>
      </Box>
    </>
  );
}
