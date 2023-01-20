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
import ErrorMessage from '../../../common/components/ErrorMessage';
import useNotification from '../../../common/utils/notification';
import Scrollbars from 'rc-scrollbars';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import NoTableElement, {
  TableLaneSkeleton,
} from '../../../common/components/noTableElement';
import { NftReward } from '../../../interfaces';
import theme from '../../../theme/theme';
import RewardLane from './rewardLane';
import ConfirmDialog from '../../../components/confirmDialog';

export default function Rewards() {
  const [areRewardsLoading, setAreRewardsLoading] = useState<boolean>(false);
  const [rewardNotif, setRewardNotif] = useState<useNotification>();
  const [rewards, setRewards] = useState<NftReward[]>([]);
  const { vote_account_id } = useParams();

  const loadRewards = (vote_account_id: string) => {
    setAreRewardsLoading(true);
    const notif = new useNotification();
    if (rewardNotif) {
      rewardNotif.dismiss();
    }
    setRewardNotif(notif);
    setTimeout(() => {
      //TODO: call api here to load rewards with data vote_account_id
      if (6 > 5) {
        const newRewards: NftReward[] = [
          {
            image_ref:
              'https://img.bitscoins.net/v7/www.bitscoins.net/wp-content/uploads/2021/06/NFT-Marketplace-Rarible-Raises-Over-14-Million-Plans-to-Launch.jpg',
            nft_pubkey: 'Make it rain let',
            numeration: 2,
            rewards: 200,
          },
        ];
        setRewards(newRewards);
        setAreRewardsLoading(false);
        notif.dismiss();
        setRewardNotif(undefined);
      } else {
        notif.notify({
          render: 'Loading rewards...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadRewards(vote_account_id)}
              notification={notif}
              //TODO: message should come from backend
              message={'There was an error loading rewards. please retry!!!'}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  useEffect(() => {
    loadRewards(vote_account_id as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const claimRewards = (actionnedNft: string[]) => {
    setIsClaiming(true);
    const notif = new useNotification();
    if (rewardNotif) rewardNotif.dismiss();
    setRewardNotif(notif);
    notif.notify({
      render: 'Claiming rewards...',
    });
    setTimeout(() => {
      //TODO: call api here to reveal nft's rarity with data actionnedNft
      if (6 > 5) {
        setRewards(
          rewards.map((reward) => {
            const { nft_pubkey } = reward;
            if (actionnedNft.includes(nft_pubkey))
              return { ...reward, reward: 0 };
            return reward;
          })
        );
        setIsClaiming(false);
        notif.update({
          render: 'Claimed rewards successfully',
        });
        setRewardNotif(undefined);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => claimRewards(actionnedNft)}
              notification={notif}
              //TODO: message should come from backend
              message={
                'There was an error claiming your rewards. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const [selectedRewards, setSelectedRewards] = useState<NftReward[]>([]);
  const [isConfirmClaimDialogOpen, setIsConfirmClaimDialogOpen] =
    useState<boolean>(false);
  return (
    <>
      <ConfirmDialog
        closeDialog={() => setIsConfirmClaimDialogOpen(false)}
        confirm={() =>
          claimRewards(selectedRewards.map(({ nft_pubkey }) => nft_pubkey))
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
            >{`${rewards.reduce(
              (total, reward) => reward.rewards + total,
              0
            )} SOL`}</Typography>
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
                        else setSelectedRewards(rewards);
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
                  <RewardLane
                    key={index}
                    reward={reward}
                    isChecked={Boolean(
                      selectedRewards.find(
                        ({ nft_pubkey }) => nft_pubkey === reward.nft_pubkey
                      )
                    )}
                    onSelect={(reward: NftReward) => {
                      const tt = selectedRewards.find(
                        ({ nft_pubkey }) => nft_pubkey === reward.nft_pubkey
                      );
                      if (tt)
                        return setSelectedRewards(
                          selectedRewards.filter(
                            ({ nft_pubkey }) => nft_pubkey !== reward.nft_pubkey
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
