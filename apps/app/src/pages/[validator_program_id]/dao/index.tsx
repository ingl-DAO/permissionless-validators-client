import {
  DangerousOutlined,
  ReportRounded,
  SearchRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import ErrorMessage from '../../../common/components/ErrorMessage';
import useNotification from '../../../common/utils/notification';
import GovernancePower from '../../../components/dao/governancePower';
import ProposalCard from '../../../components/dao/proposalCard';
import { GovernanceInterface, InglNft } from '../../../interfaces';
import { NftService } from '../../../services/nft.service';
import { ProposalService } from '../../../services/proposal.service';
import theme from '../../../theme/theme';

export default function Dao() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [proposals, setProposals] = useState<GovernanceInterface[]>([]);
  const [areProposalsLoading, setAreProposalsLoading] =
    useState<boolean>(false);
  const [proposalNotif, setProposalNotif] = useState<useNotification>();
  const { validator_program_id } = useParams();

  const walletContext = useWallet();
  const { connection } = useConnection();
  const nftService = useMemo(
    () =>
      validator_program_id
        ? new NftService(
            new PublicKey(validator_program_id),
            connection,
            walletContext
          )
        : null,
    [connection, validator_program_id, walletContext]
  );
  const proposalService = useMemo(
    () =>
      validator_program_id
        ? new ProposalService(
            new PublicKey(validator_program_id),
            connection,
            walletContext
          )
        : null,
    [connection, validator_program_id, walletContext]
  );

  const loadProposals = () => {
    setAreProposalsLoading(true);
    const notif = new useNotification();
    if (proposalNotif) {
      proposalNotif.dismiss();
    }
    setProposalNotif(notif);
    proposalService
      ?.loadProposals()
      .then((proposals) => {
        setProposals(proposals);
        setAreProposalsLoading(false);
        notif.dismiss();
        setProposalNotif(undefined);
      })
      .catch((error) => {
        notif.notify({
          render: 'Loading proposals...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadProposals()}
              notification={notif}
              message={
                error?.message ||
                'There was an error loading proposals. please retry!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const [nfts, setNfts] = useState<InglNft[]>([]);
  const [nftNotif, setNftNotif] = useState<useNotification>();
  const [areNftsLoading, setAreNftsLoading] = useState<boolean>(false);

  const loadNfts = () => {
    setAreNftsLoading(true);
    const notif = new useNotification();
    if (nftNotif) {
      nftNotif.dismiss();
    }
    setNftNotif(notif);
    nftService
      ?.loadNFTs()
      .then((nfts) => {
        setNfts(nfts);
        setAreNftsLoading(false);
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
    if (proposalService) loadProposals();
    if (nftService) loadNfts();
    return () => {
      //TODO: Cleanup axios fetch above
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalService, nftService]);

  const { formatDate } = useIntl();
  const navigate = useNavigate();
  const ttNotif = new useNotification();

  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(2),
        height: '100%',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <Typography variant="h5">DAO</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 0.4fr',
          columnGap: theme.spacing(3.125),
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            rowGap: theme.spacing(2),
            height: '100%',
            gridTemplateRows: 'auto 1fr',
          }}
        >
          <TextField
            size="small"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            sx={{
              backgroundColor: theme.common.inputBackground,
              input: {
                color: 'white',
                fontSize: '0.90rem',
                '&::placeholder': {
                  color: 'white',
                  fontSize: '0.90rem',
                },
              },
            }}
            fullWidth
            color="primary"
            placeholder="Search proposal by number or proposal id"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchRounded sx={{ color: 'white', fontSize: '24px' }} />
                </InputAdornment>
              ),
            }}
          />
          <Scrollbars autoHide>
            <Box sx={{ display: 'grid', rowGap: theme.spacing(2) }}>
              {areProposalsLoading ? (
                [...new Array(10)].map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    height={130}
                    animation="wave"
                    sx={{
                      backgroundColor: 'rgb(137 127 127 / 43%)',
                      borderRadius: theme.spacing(4),
                    }}
                  />
                ))
              ) : proposals.length === 0 ? (
                <Typography variant="h6" textAlign="center">
                  No proposals available for this validator yet. You can create
                  one by clicking on new proposal on the side
                </Typography>
              ) : (
                proposals.map(
                  (
                    {
                      title,
                      number_of_no_votes,
                      number_of_yes_votes,
                      proposal_numeration,
                      is_still_ongoing,
                      expiration_time,
                      did_proposal_pass,
                      is_proposal_executed,
                      proposal_id,
                    },
                    index
                  ) => {
                    const totalVotes = number_of_no_votes + number_of_yes_votes;
                    const vote_end_time_in_ms = expiration_time * 1000;
                    const status = is_still_ongoing
                      ? new Date() > new Date(vote_end_time_in_ms)
                        ? 'Expired'
                        : 'Voting'
                      : did_proposal_pass
                      ? is_proposal_executed
                        ? 'Executed'
                        : 'Success'
                      : 'Defeated';
                    return (
                      <ProposalCard
                        proposal_id={proposal_id}
                        noPercentage={
                          (number_of_no_votes /
                            (totalVotes === 0 ? 1 : totalVotes)) *
                          100
                        }
                        noVotes={number_of_no_votes}
                        numeration={proposal_numeration}
                        title={title}
                        yesPercentage={
                          (number_of_yes_votes /
                            (totalVotes === 0 ? 1 : totalVotes)) *
                          100
                        }
                        yesVotes={number_of_yes_votes}
                        subtitle={
                          new Date(vote_end_time_in_ms) > new Date()
                            ? `Voting ends on ${formatDate(
                                new Date(vote_end_time_in_ms),
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}`
                            : `Votes ended on ${formatDate(
                                new Date(vote_end_time_in_ms),
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}`
                        }
                        status={status}
                        key={index}
                      />
                    );
                  }
                )
              )}
            </Box>
          </Scrollbars>
        </Box>
        <Box
          sx={{
            display: 'grid',
            rowGap: theme.spacing(2.5),
            alignContent: 'start',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              if (nfts.length === 0) {
                ttNotif.dismiss();
                ttNotif.notify({ render: 'Notifying' });
                ttNotif.update({
                  autoClose: 5000,
                  type: 'WARNING',
                  icon: () => <DangerousOutlined color="warning" />,
                  render:
                    'You must own at least an nft on this validator to create a proposal!!!',
                });
              } else navigate('create');
            }}
          >
            New Proposal
          </Button>
          <GovernancePower areNftsLoading={areNftsLoading} nfts={nfts} />
        </Box>
      </Box>
    </Box>
  );
}
