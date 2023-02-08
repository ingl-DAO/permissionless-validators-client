import {
  ArrowBackIosNewOutlined,
  AutorenewOutlined,
  DoNotDisturbAltOutlined,
  ReportRounded,
} from '@mui/icons-material';
import ErrorMessage from '../../../../common/components/ErrorMessage';
import useNotification from '../../../../common/utils/notification';
import {
  ConfigAccountEnum,
  GovernanceInterface,
  InglNft,
  InglValidator,
  VoteAccountEnum,
} from '../../../..//interfaces';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useConnection } from '@solana/wallet-adapter-react';
import { ValidatorService } from '../../../../services/validator.service';
import { BN } from 'bn.js';
import { PublicKey } from '@solana/web3.js';
import { Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import theme from '../../../../theme/theme';
import Scrollbars from 'rc-scrollbars';
import GovernancePower from '../../../../components/dao/governancePower';
import { useIntl } from 'react-intl';
import PropoposalVoteLine from '../../../../components/dao/proposalVoteLine';
import {
  ProgramVersion,
  VersionStatus,
} from '../../../../services/proposal.service';
import ConfirmDialog from '../../../../components/confirmDialog';

export default function ProposalVote() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { validator_program_id, proposal_id } = useParams();
  const { formatDate } = useIntl();

  const [areValidatorDetailsLoading, setAreValidatorDetailsLoading] =
    useState<boolean>(false);

  //TODO: remove initial data. it was put just for dev purposes.
  //TODO: also remove |undefined on state.
  //TODO: useState<InglValidator>() is what is needed
  const [validatorDetails, setValidatorDetails] = useState<
    InglValidator | undefined
  >({
    collection_id: 'lsi',
    collection_uri: 'lsi',
    creator_royalties: 20,
    default_uri: 'sie',
    discord_invite: 'iwoel',
    governance_expiration_time: 139389283,
    init_commission: 20,
    initial_redemption_fee: 20,
    is_validator_id_switchable: false,
    max_primary_stake: 20,
    nft_holders_share: 20,
    proposal_quorum: 10,
    redemption_fee_duration: 37923829293,
    total_delegated_count: 0,
    total_delegated_stake: new BN(0),
    total_minted_count: 0,
    total_secondary_stake: new BN(2),
    twitter_handle: 'ieol',
    unit_backing: 20,
    validator_apy: 20,
    validator_id: 'owie',
    validator_name: 'Labrent',
    vote_account_id: 'owie',
    website: 'lwieos',
  });
  const [validatorDetailNotif, setValidatorDetailNotif] =
    useState<useNotification>();

  const { connection } = useConnection();
  const validatorService = useMemo(
    () => new ValidatorService(connection),
    [connection]
  );

  const loadValidatorDetails = async (validator_program_id: string) => {
    setAreValidatorDetailsLoading(true);
    const notif = new useNotification();
    if (validatorDetailNotif) {
      validatorDetailNotif.dismiss();
    }
    setValidatorDetailNotif(notif);

    notif.notify({
      render: 'Loading validator details...',
    });
    validatorService
      .loadValidatorStats(new PublicKey(validator_program_id))
      .then((validatorInfo) => {
        setValidatorDetails(validatorInfo);
        setAreValidatorDetailsLoading(false);
        notif.dismiss();
        setValidatorDetailNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadValidatorDetails(validator_program_id)}
              notification={notif}
              message={
                error?.message ||
                'There was an error loading validator details. please retry!!!'
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
        if (newNfts.length === 0) {
          navigate(pathname.split('/').slice(0, -1).join('/'));
        } else {
          setNfts(newNfts);
          setAreNftsLoading(false);
          notif.dismiss();
          setNftNotif(undefined);
        }
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

  const [proposalDetail, setProposalDetail] = useState<GovernanceInterface>();
  const [isProposalDetailLoading, setIsProposalDetailLoading] =
    useState<boolean>(false);
  const [proposalNotif, setProposalNotif] = useState<useNotification>();

  const loadProposalDetail = (proposal_id: string) => {
    setIsProposalDetailLoading(true);
    const notif = new useNotification();
    if (proposalNotif) {
      proposalNotif.dismiss();
    }
    setProposalNotif(notif);
    setTimeout(() => {
      //TODO: call api here to load validator details with data vote_account_id
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        const newProposals: GovernanceInterface = {
          description: 'Make it rain',
          expiration_time: 1245365478,
          is_proposal_executed: false,
          is_still_ongoing: true,
          number_of_no_votes: 2,
          number_of_yes_votes: 2,
          program_id: 'lsiel',
          proposal_id: 'lsie',
          proposal_numeration: 2,
          proposal_quorum: 5,
          title: 'Change validator ID, current validator ID malevolent',
          programUpgrade: {
            buffer_account: 'EEFgagZwMnSaj34uf2c7f55UencYvb2WpW5eAVDPbDdm',
            code_link:
              'https://github.com/ingl-DAO/permissionless-validators/v2.0.1',
          },
          //   configAccount:{
          //     config_type:ConfigAccountEnum.DiscordInvite,
          //     value:'lsld'
          //   },
          //   voteAccount:{
          //     value:'',
          //     vote_type:VoteAccountEnum.ValidatorID
          //   }
        };

        setProposalDetail(newProposals);
        setIsProposalDetailLoading(false);
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
              retryFunction={() => loadProposalDetail(proposal_id)}
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

  useEffect(() => {
    loadValidatorDetails(validator_program_id as string);
    loadNfts();
    loadProposalDetail(proposal_id as string);
    return () => {
      //TODO: cleanup above axios calls
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //TODO: load program status here
  const [programStatus, setProgramStatus] = useState<ProgramVersion>({
    program_data_hash: 'lsdiel',
    released_on: new Date(),
    status: VersionStatus.Unsafe,
    version: 2.0,
  });

  const [
    isConfirmUnsafeProposalVoteDialogOpen,
    setIsConfirmUnsafeProposalVoteDialogOpen,
  ] = useState<boolean>(false);
  const [isConfirmVoteProposalDialogOpen, setIsConfirmVoteProposalDialogOpen] =
    useState<boolean>(false);

  const [voteChoice, setVoteChoice] = useState<boolean | undefined>();

  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [voteNotif, setVoteNotif] = useState<useNotification>();

  const voteProposal = (voteChoice: boolean) => {
    setIsVoting(true);
    const notif = new useNotification();
    if (voteNotif) voteNotif.dismiss();
    setVoteNotif(notif);
    notif.notify({
      render: 'Voting Proposal...',
    });
    setTimeout(() => {
      //TODO: call api here vote proposal with data voteChoice
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        setIsVoting(false);
        notif.update({
          render: 'proposal voted successfully',
        });
        setVoteNotif(undefined);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => voteProposal(voteChoice)}
              notification={notif}
              //TODO: message should come from backend
              message={
                'There was an error casting your vote. Please try again!!!'
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
      <ConfirmDialog
        isCancelContained
        dialogMessage={
          <Typography>
            <Typography component="span" color={theme.palette.primary.main}>
              Note:{' '}
            </Typography>
            <Typography component="span">
              This is a suspicious proposal and could potentially lead to loss
              of all DAO memebers. We recommend voting against the proposal for
              the safety of all DAO members.
            </Typography>
          </Typography>
        }
        isDialogOpen={isConfirmUnsafeProposalVoteDialogOpen}
        dialogTitle={'Confirm vote cast'}
        closeDialog={() => setIsConfirmUnsafeProposalVoteDialogOpen(false)}
        confirm={() => {
          setIsConfirmUnsafeProposalVoteDialogOpen(false);
          setIsConfirmVoteProposalDialogOpen(true);
        }}
      />

      <ConfirmDialog
        closeDialog={() => setIsConfirmVoteProposalDialogOpen(false)}
        isDialogOpen={isConfirmVoteProposalDialogOpen}
        dialogTitle="Confirm proposal vote"
        dialogMessage={
          <Typography>
            <Typography component="span" color={theme.palette.primary.main}>
              Note:
            </Typography>
            <Typography component="span">
              Validating your vote for this proposal will use your governance
              power towards validating the proposal. Are you sure you want to
              continue?
            </Typography>
          </Typography>
        }
        confirm={() => {
          if (voteChoice !== undefined) {
            voteProposal(voteChoice);
          }
        }}
      />
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
            height: '99%',
          }}
        >
          <Box
            sx={{
              padding: 2,
              backgroundColor: '#28293D',
              borderRadius: 2,
              display: 'grid',
              gridTemplateRows: 'auto auto 1fr',
              rowGap: 3,
              position: 'relative',
            }}
          >
            {programStatus.status === VersionStatus.Unsafe && (
              <Chip
                icon={<DoNotDisturbAltOutlined sx={{ color: 'white' }} />}
                label="We recommend voting against the proposal"
                color="primary"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
            <Box display="grid" rowGap={1}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  justifyItems: 'end',
                  columnGap: 1,
                  alignItems: 'center',
                }}
              >
                <Button
                  startIcon={
                    <ArrowBackIosNewOutlined
                      sx={{ color: 'white' }}
                      fontSize="small"
                    />
                  }
                  variant="text"
                  color="primary"
                  onClick={() =>
                    navigate(pathname.split('/').slice(0, -1).join('/'))
                  }
                  sx={{ color: 'white' }}
                >
                  Back
                </Button>

                <Box
                  sx={{
                    display: 'grid',
                    alignItems: 'center',
                    gridAutoFlow: 'column',
                    columnGap: 1,
                  }}
                >
                  <Typography variant="body2" color="#D5F2E3">
                    {proposalDetail && !isProposalDetailLoading ? (
                      `Expire${
                        new Date(proposalDetail.expiration_time * 1000) >
                        new Date()
                          ? 's'
                          : 'd'
                      } on: 
                    ${formatDate(
                      new Date(proposalDetail.expiration_time * 1000),
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }
                    )}`
                    ) : (
                      <Skeleton
                        animation="wave"
                        width={100}
                        component="span"
                        sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                      />
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#D5F2E3',
                      backgroundColor: '#1C1C28',
                      borderRadius: 100,
                      border: ' 1px solid #D5F2E3',
                      padding: `4px 16px`,
                    }}
                  >
                    {'Voting'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="rgba(255, 255, 255, 0.5)"
                  lineHeight={1}
                >
                  Title
                </Typography>
                <Typography variant="h6" lineHeight={1}>
                  {proposalDetail ? (
                    proposalDetail.title
                  ) : (
                    <Skeleton
                      animation="wave"
                      width={250}
                      component="span"
                      sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                    />
                  )}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2">
              {proposalDetail ? (
                proposalDetail.description
              ) : (
                <>
                  <Skeleton
                    animation="wave"
                    width="100%"
                    component="span"
                    sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                  />
                  <Skeleton
                    animation="wave"
                    width="80%"
                    component="span"
                    sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                  />
                </>
              )}
            </Typography>

            <Box display="grid" gridTemplateRows="auto 1fr" rowGap={1}>
              <Box
                sx={{
                  display: 'grid',
                  alignItems: 'center',
                  columnGap: 1,
                  gridTemplateColumns: 'auto 1fr',
                  justifyItems: 'start',
                }}
              >
                <AutorenewOutlined sx={{ color: '#D5F2E3' }} />
                <Typography color="#D5F2E3">
                  Instructions and state changes
                </Typography>
              </Box>

              <Box borderRadius={2} border="1px solid #D5F2E3" padding={3}>
                <Scrollbars autoHide>
                  <Box display="grid" rowGap={4.5} gridTemplateRows="auto 1fr">
                    <Box>
                      <Typography
                        variant="caption"
                        color="#D5F2E3"
                        lineHeight={1}
                      >
                        Instruction type
                      </Typography>
                      <Typography>
                        {!proposalDetail || isProposalDetailLoading ? (
                          <Skeleton
                            animation="wave"
                            width={100}
                            component="span"
                            sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                          />
                        ) : proposalDetail.programUpgrade ? (
                          'Program upgrade'
                        ) : proposalDetail.voteAccount ? (
                          `Vote account: ${
                            proposalDetail.voteAccount.vote_type ===
                            VoteAccountEnum.Commission
                              ? 'swap commission'
                              : 'swap validator ID'
                          }`
                        ) : proposalDetail.configAccount ? (
                          `Config account: ${
                            proposalDetail.configAccount.config_type ===
                            ConfigAccountEnum.DiscordInvite
                              ? 'change discord invite'
                              : proposalDetail.configAccount.config_type ===
                                ConfigAccountEnum.InitialRedemptionFee
                              ? 'change initial redemption fee'
                              : proposalDetail.configAccount.config_type ===
                                ConfigAccountEnum.MaxPrimaryStake
                              ? 'change max primary stake'
                              : proposalDetail.configAccount.config_type ===
                                ConfigAccountEnum.NftHolderShare
                              ? 'change NFT holder share'
                              : proposalDetail.configAccount.config_type ===
                                ConfigAccountEnum.RedemptionFeeDuration
                              ? 'change redemption fee duration'
                              : proposalDetail.configAccount.config_type ===
                                ConfigAccountEnum.TwitterHandle
                              ? 'change twitter handle'
                              : 'change validator name'
                          }`
                        ) : (
                          <Typography
                            component="span"
                            color={theme.palette.primary.main}
                          >
                            Unknown Instruction Type
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                    <Box display="grid" rowGap={2.8}>
                      <Typography
                        variant="caption"
                        color="#D5F2E3"
                        lineHeight={1}
                      >
                        State changes
                      </Typography>
                      {proposalDetail ? (
                        proposalDetail.programUpgrade ? (
                          <Box display="grid" rowGap={2}>
                            <PropoposalVoteLine
                              color="#D5F2E3"
                              title="Buffer address of new program"
                              unsafe={
                                programStatus.status === VersionStatus.Unsafe
                              }
                              value={
                                proposalDetail.programUpgrade.buffer_account
                              }
                            />
                            <PropoposalVoteLine
                              title="Address before program upgrade"
                              strikethrough
                              value={
                                validatorDetails &&
                                !areValidatorDetailsLoading ? (
                                  validatorDetails.validator_id
                                ) : (
                                  <Skeleton
                                    animation="wave"
                                    width={100}
                                    component="span"
                                    sx={{
                                      backgroundColor: 'rgb(137 127 127 / 43%)',
                                    }}
                                  />
                                )
                              }
                            />
                            <PropoposalVoteLine
                              title="Code link"
                              // TODO: get github link here
                              value={
                                'https://github.com/ingl-DAO/permissionless-validators/v2.0.1'
                              }
                            />
                            <Box
                              display="grid"
                              gridAutoFlow="column"
                              justifyItems="start"
                              alignItems="center"
                              columnGap={2}
                            >
                              <PropoposalVoteLine
                                title="Current program version"
                                // TODO: get current program version here
                                value={`Version 2.0.1`}
                                color="#E5B800"
                                titleColor="rgba(255, 204, 0, 0.5)"
                              />
                              <PropoposalVoteLine
                                title="New program version"
                                titleColor={
                                  programStatus.status === VersionStatus.Unsafe
                                    ? 'rgba(239, 35, 60, 0.5)'
                                    : 'rgba(2, 195, 154, 1)'
                                }
                                value={
                                  programStatus ? (
                                    programStatus.status ===
                                    VersionStatus.Unsafe ? (
                                      'UNSAFE - Not a version of ingl program'
                                    ) : (
                                      `Version ${programStatus.version}`
                                    )
                                  ) : (
                                    <Skeleton
                                      animation="wave"
                                      height="80%"
                                      component="span"
                                      sx={{
                                        backgroundColor:
                                          'rgb(137 127 127 / 43%)',
                                      }}
                                    />
                                  )
                                }
                                unsafe={
                                  programStatus.status === VersionStatus.Unsafe
                                }
                                color="#02C39A"
                              />
                            </Box>
                          </Box>
                        ) : proposalDetail.voteAccount ? (
                          'Vote account variations'
                        ) : (
                          'Config account flash'
                        )
                      ) : (
                        <Skeleton
                          animation="wave"
                          height="100%"
                          component="span"
                          sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Scrollbars>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'grid',
              rowGap: theme.spacing(2.5),
              alignContent: 'start',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: theme.spacing(1),
              }}
            >
              <Button
                variant={
                  programStatus.status === VersionStatus.Unsafe
                    ? 'text'
                    : 'contained'
                }
                color={'primary'}
                disabled={areValidatorDetailsLoading || isProposalDetailLoading}
                onClick={() => {
                  setVoteChoice(true);
                  if (programStatus.status === VersionStatus.Unsafe)
                    setIsConfirmUnsafeProposalVoteDialogOpen(true);
                  else setIsConfirmVoteProposalDialogOpen(true);
                }}
                fullWidth
              >
                Vote Yes
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setVoteChoice(false);
                  setIsConfirmVoteProposalDialogOpen(true);
                }}
                disabled={areValidatorDetailsLoading || isProposalDetailLoading}
                fullWidth
              >
                Vote No
              </Button>
            </Box>
            <GovernancePower areNftsLoading={areNftsLoading} nfts={nfts} />
          </Box>
        </Box>
      </Box>
    </>
  );
}
