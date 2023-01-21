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
  Typography
} from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import ErrorMessage from '../../../common/components/ErrorMessage';
import NoTableElement, {
  TableLaneSkeleton
} from '../../../common/components/noTableElement';
import useNotification from '../../../common/utils/notification';
import ConfirmDialog from '../../../components/confirmDialog';
import { NftReward } from '../../../interfaces';
import { NftService } from '../../../services/nft.service';
import theme from '../../../theme/theme';
<<<<<<< HEAD:apps/app/src/pages/[vote_account_id]/rewards/index.tsx
import RewardLine from './rewardLine';
import ConfirmDialog from '../../../components/confirmDialog';
=======
import RewardLane from './rewardLane';
>>>>>>> f2a946bbb2d7180a1867a0e9794f7187ef07729b:apps/app/src/pages/[validator_program_id]/rewards/index.tsx

export default function Rewards() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { validator_program_id } = useParams();

  const [areRewardsLoading, setAreRewardsLoading] = useState<boolean>(false);
  const [rewardNotif, setRewardNotif] = useState<useNotification>();
  const [rewards, setRewards] = useState<NftReward[]>([]);
<<<<<<< HEAD:apps/app/src/pages/[vote_account_id]/rewards/index.tsx
  const { program_id } = useParams();

  const loadRewards = (program_id: string) => {
=======

  const nftService = useMemo(
    () =>
      validator_program_id
        ? new NftService(
            new PublicKey(validator_program_id),
            wallet,
            connection
          )
        : null,
    [connection, validator_program_id, wallet]
  );

  const loadRewards = () => {
>>>>>>> f2a946bbb2d7180a1867a0e9794f7187ef07729b:apps/app/src/pages/[validator_program_id]/rewards/index.tsx
    setAreRewardsLoading(true);
    const notif = new useNotification();
    if (rewardNotif) {
      rewardNotif.dismiss();
    }
    setRewardNotif(notif);
<<<<<<< HEAD:apps/app/src/pages/[vote_account_id]/rewards/index.tsx
    setTimeout(() => {
      //TODO: call api here to load rewards with data program_id
      // eslint-disable-next-line no-constant-condition
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
=======
    notif.notify({
      render: 'Loading rewards...',
    });
    nftService
      ?.loadRewards()
      .then((rewards) => {
        setRewards(rewards);
>>>>>>> f2a946bbb2d7180a1867a0e9794f7187ef07729b:apps/app/src/pages/[validator_program_id]/rewards/index.tsx
        setAreRewardsLoading(false);
        notif.dismiss();
        setRewardNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
<<<<<<< HEAD:apps/app/src/pages/[vote_account_id]/rewards/index.tsx
              retryFunction={() => loadRewards(program_id)}
=======
              retryFunction={() => loadRewards()}
>>>>>>> f2a946bbb2d7180a1867a0e9794f7187ef07729b:apps/app/src/pages/[validator_program_id]/rewards/index.tsx
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
<<<<<<< HEAD:apps/app/src/pages/[vote_account_id]/rewards/index.tsx
    loadRewards(program_id as string);
=======
    if (nftService) loadRewards();
>>>>>>> f2a946bbb2d7180a1867a0e9794f7187ef07729b:apps/app/src/pages/[validator_program_id]/rewards/index.tsx
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
<<<<<<< HEAD:apps/app/src/pages/[vote_account_id]/rewards/index.tsx
    setTimeout(() => {
      //TODO: call api here to reveal nft's rarity with data actionnedNft
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
=======
    nftService
      ?.claimRewards(actionnedNfts.map((address) => new PublicKey(address)))
      .then(() => {
>>>>>>> f2a946bbb2d7180a1867a0e9794f7187ef07729b:apps/app/src/pages/[validator_program_id]/rewards/index.tsx
        setRewards(
          rewards.map((reward) => {
            const { nft_mint_id: nft_pubkey } = reward;
            if (actionnedNfts.includes(nft_pubkey))
              return { ...reward, reward: 0 };
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
              .reduce((total, { rewards }) => total.add(rewards), new BN(0))
              .toString(10)} L`}</Typography>
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
