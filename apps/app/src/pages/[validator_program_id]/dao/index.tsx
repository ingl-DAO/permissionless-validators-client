import { ReportRounded, SearchRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  InputAdornment,
  Skeleton,
  TextField,
  Typography
} from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';
import ErrorMessage from '../../../common/components/ErrorMessage';
import useNotification from '../../../common/utils/notification';
import GovernancePower from '../../../components/dao/governancePower';
import { GovernanceInterface, InglNft } from '../../../interfaces';
import theme from '../../../theme/theme';
import ProposalCard from './proposalCard';

export default function Dao() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [proposals, setProposals] = useState<GovernanceInterface[]>([]);
  const [areProposalsLoading, setAreProposalsLoading] =
    useState<boolean>(false);
  const [proposalNotif, setProposalNotif] = useState<useNotification>();
  const { validator_program_id } = useParams();

  const loadProposals = (validator_program_id: string) => {
    setAreProposalsLoading(true);
    const notif = new useNotification();
    if (proposalNotif) {
      proposalNotif.dismiss();
    }
    setProposalNotif(notif);
    setTimeout(() => {
      //TODO: call api here to load validator details with data vote_account_id
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        const newProposals: GovernanceInterface[] = [
          {
            description: 'Make it rain',
            expiration_time: 1245365478,
            is_proposal_executed: false,
            is_still_ongoing: true,
            number_of_no_votes: 2,
            number_of_yes_votes: 2,
            program_id: 'lsiel',
            proposal_id: 'lsie',
            proposal_numeration: 2,
            proposal_quorom: 5,
            title: 'Change validator ID, current validator ID malevolent',
            nft_mint_id: 'eisole',
          },
        ];
        setProposals(newProposals);
        setAreProposalsLoading(false);
        notif.dismiss();
        setProposalNotif(undefined);
      } else {
        notif.notify({
          render: 'Loading proposals...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadProposals(validator_program_id)}
              notification={notif}
              //TODO: message should come from backend
              message="There was an error loading proposals. please retry!!!"
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
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
    setTimeout(() => {
      //TODO: call api here to load validator details with data vote_account_id
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        const newNfts: InglNft[] = [
          {
            image_ref: 'https://miro.medium.com/max/1400/0*jGrQl2vi0S6rk5ix',
            is_delegated: false,
            nft_mint_id: 'sldi',
            numeration: 2,
          },
          {
            image_ref: 'https://miro.medium.com/max/1400/0*jGrQl2vi0S6rk5ix',
            is_delegated: false,
            nft_mint_id: 'sldi',
            numeration: 2,
          },
        ];
        setNfts(newNfts);
        setAreNftsLoading(false);
        notif.dismiss();
        setNftNotif(undefined);
      } else {
        notif.notify({
          render: 'Loading Nfts...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadNfts()}
              notification={notif}
              //TODO: message should come from backend
              message="There was an error loading Nfts. please retry!!!"
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  useEffect(() => {
    loadProposals(validator_program_id as string);
    loadNfts();
    return () => {
      //TODO: Cleanup axios fetch above
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { formatDate } = useIntl();

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
                        noPercentage={(number_of_no_votes / totalVotes) * 100}
                        noVotes={number_of_no_votes}
                        numeration={proposal_numeration}
                        title={title}
                        yesPercentage={(number_of_yes_votes / totalVotes) * 100}
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
          <Button variant="contained" color="primary" fullWidth>
            New Proposal
          </Button>
          <GovernancePower areNftsLoading={areNftsLoading} nfts={nfts} />
        </Box>
      </Box>
    </Box>
  );
}
