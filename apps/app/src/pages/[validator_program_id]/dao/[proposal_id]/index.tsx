import {
  ArrowBackIosNewOutlined,
  AutorenewOutlined,
  DoNotDisturbAltOutlined,
  ReportRounded,
} from '@mui/icons-material';
import { Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  ConfigAccountEnum,
  GovernanceInterface,
  InglNft,
  InglValidator,
  VoteAccountEnum,
} from '../../../..//interfaces';
import ErrorMessage from '../../../../common/components/ErrorMessage';
import useNotification from '../../../../common/utils/notification';
import ConfirmDialog from '../../../../components/confirmDialog';
import GovernancePower from '../../../../components/dao/governancePower';
import PropoposalVoteLine from '../../../../components/dao/proposalVoteLine';
import { NftService } from '../../../../services/nft.service';
import {
  ProgramVersion,
  ProposalService,
  VersionStatus,
} from '../../../../services/proposal.service';
import { ValidatorService } from '../../../../services/validator.service';
import theme from '../../../../theme/theme';

export default function ProposalVote() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { validator_program_id, numeration } = useParams();
  const { formatDate } = useIntl();
  const { connection } = useConnection();
  const walletContext = useWallet();

  const validatorService = useMemo(
    () => new ValidatorService(connection),
    [connection]
  );

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

  const [areValidatorDetailsLoading, setAreValidatorDetailsLoading] =
    useState<boolean>(false);

  const [validatorDetails, setValidatorDetails] = useState<InglValidator>();
  const [validatorDetailNotif, setValidatorDetailNotif] =
    useState<useNotification>();

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

  const [proposalDetail, setProposalDetail] = useState<GovernanceInterface>();
  const [isProposalDetailLoading, setIsProposalDetailLoading] =
    useState<boolean>(false);
  const [proposalNotif, setProposalNotif] = useState<useNotification>();

  const loadProposalDetail = (numeration: number) => {
    setIsProposalDetailLoading(true);
    const notif = new useNotification();
    if (proposalNotif) {
      proposalNotif.dismiss();
    }
    setProposalNotif(notif);
    proposalService
      ?.loadProposalDetail(numeration)
      .then((proposalDetail) => {
        if (proposalDetail.programUpgrade)
          loadProgramVersion(
            new PublicKey(proposalDetail.programUpgrade.buffer_account)
          );
        setProposalDetail(proposalDetail);
        setIsProposalDetailLoading(false);
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
              retryFunction={() => loadProposalDetail(numeration)}
              notification={notif}
              message={
                error?.message ||
                'There was an error loading proposal details. please retry!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const loadProgramVersion = (programId?: PublicKey) => {
    const notif = new useNotification();
    if (proposalNotif) {
      proposalNotif.dismiss();
    }
    setProposalNotif(notif);
    proposalService
      ?.verifyVersion(programId)
      .then((programVersion) => {
        if (programId) setBufferVersion(programVersion);
        setProgramVersion(programVersion);
        notif.dismiss();
      })
      .catch((error) => {
        notif.notify({
          render: 'Loading proposals...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadProgramVersion(programId)}
              notification={notif}
              message={
                error?.message ||
                `There was an error loading program ${
                  programId?.toBase58() ?? ''
                } version. please retry!!!`
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  useEffect(() => {
    if (nftService) loadNfts();
    return () => {
      //TODO: cleanup above axios calls
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftService]);
  useEffect(() => {
    if (validator_program_id && numeration) {
      loadProgramVersion();
      loadProposalDetail(Number(numeration));
      loadValidatorDetails(validator_program_id);
    }
    return () => {
      //TODO: cleanup above axios calls
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validator_program_id, numeration]);

  const [programVersion, setProgramVersion] = useState<ProgramVersion | null>();
  const [bufferVersion, setBufferVersion] = useState<ProgramVersion | null>();

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
    proposalService
      ?.voteGovernance(
        Number(numeration),
        voteChoice,
        nfts.map((_) => new PublicKey(_.nft_mint_id))
      )
      .then(() => {
        setIsVoting(false);
        notif.update({
          render: 'proposal voted successfully',
        });
        setVoteNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => voteProposal(voteChoice)}
              notification={notif}
              message={
                error?.message ||
                'There was an error casting your vote. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };
  return (
    <>
      <ConfirmDialog
        isCancelContained
        dialogMessage={
          <Typography>
            <Typography component="span" color={theme.palette.primary.main}>
              Note:
            </Typography>
            <Typography component="span" marginLeft={'4px'}>
              This is a suspicious proposal and could potentially lead to loss
              of all DAO members. We recommend voting against the proposal for
              the safety of all DAO members.
            </Typography>
          </Typography>
        }
        isDialogOpen={isConfirmUnsafeProposalVoteDialogOpen}
        dialogTitle={'Confirm vote cast'}
        closeDialog={() => {
          setIsConfirmUnsafeProposalVoteDialogOpen(false);
          setVoteChoice(undefined);
        }}
        confirm={() => {
          setIsConfirmUnsafeProposalVoteDialogOpen(false);
          setIsConfirmVoteProposalDialogOpen(true);
        }}
      />

      <ConfirmDialog
        closeDialog={() => {
          setIsConfirmVoteProposalDialogOpen(false);
          setVoteChoice(undefined);
        }}
        isDialogOpen={isConfirmVoteProposalDialogOpen}
        dialogTitle="Confirm proposal vote"
        dialogMessage={
          <Typography>
            <Typography component="span" color={theme.palette.primary.main}>
              Note:
            </Typography>
            <Typography component="span" marginLeft={'4px'}>
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
            {!programVersion ||
              (programVersion.status === VersionStatus.Unsafe && (
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
              ))}
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
                                !programVersion ||
                                programVersion.status === VersionStatus.Unsafe
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
                              value={proposalDetail.programUpgrade.code_link}
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
                                value={
                                  bufferVersion === undefined ? (
                                    <Skeleton
                                      animation="wave"
                                      height="80%"
                                      component="span"
                                      sx={{
                                        backgroundColor:
                                          'rgb(137 127 127 / 43%)',
                                      }}
                                    />
                                  ) : !bufferVersion ||
                                    bufferVersion.status ===
                                      VersionStatus.Unsafe ? (
                                    'UNSAFE - Not a version of ingl program'
                                  ) : (
                                    `Version ${bufferVersion.version}`
                                  )
                                }
                                color="#E5B800"
                                titleColor="rgba(255, 204, 0, 0.5)"
                              />
                              <PropoposalVoteLine
                                title="New program version"
                                titleColor={
                                  !programVersion ||
                                  programVersion.status === VersionStatus.Unsafe
                                    ? 'rgba(239, 35, 60, 0.5)'
                                    : 'rgba(2, 195, 154, 1)'
                                }
                                value={
                                  programVersion === undefined ? (
                                    <Skeleton
                                      animation="wave"
                                      height="80%"
                                      component="span"
                                      sx={{
                                        backgroundColor:
                                          'rgb(137 127 127 / 43%)',
                                      }}
                                    />
                                  ) : !programVersion ||
                                    programVersion.status ===
                                      VersionStatus.Unsafe ? (
                                    'UNSAFE - Not a version of ingl program'
                                  ) : (
                                    `Version ${programVersion.version}`
                                  )
                                }
                                unsafe={
                                  !programVersion ||
                                  programVersion.status === VersionStatus.Unsafe
                                }
                                color="#02C39A"
                              />
                            </Box>
                          </Box>
                        ) : proposalDetail.voteAccount ? (
                          <Box display="grid" rowGap={2}>
                            <PropoposalVoteLine
                              color="#D5F2E3"
                              title={
                                proposalDetail.voteAccount.vote_type ===
                                VoteAccountEnum.Commission
                                  ? 'New initial commission'
                                  : 'New validator ID'
                              }
                              value={`${proposalDetail.voteAccount.value}${
                                proposalDetail.voteAccount.vote_type ===
                                VoteAccountEnum.Commission
                                  ? '%'
                                  : null
                              }`}
                            />
                            <PropoposalVoteLine
                              title={
                                proposalDetail.voteAccount.vote_type ===
                                VoteAccountEnum.Commission
                                  ? 'Current initial commission'
                                  : 'Current validator ID'
                              }
                              strikethrough
                              value={
                                validatorDetails &&
                                !areValidatorDetailsLoading ? (
                                  proposalDetail.voteAccount.vote_type ===
                                  VoteAccountEnum.Commission ? (
                                    `${validatorDetails.init_commission}%`
                                  ) : (
                                    validatorDetails.validator_id
                                  )
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
                          </Box>
                        ) : proposalDetail.configAccount ? (
                          <Box display="grid" rowGap={2}>
                            <PropoposalVoteLine
                              color="#D5F2E3"
                              title={
                                proposalDetail.configAccount.config_type ===
                                ConfigAccountEnum.MaxPrimaryStake
                                  ? 'New max primary stake'
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.InitialRedemptionFee
                                  ? `New initial redemption fee`
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.NftHolderShare
                                  ? `New NFT holder's share`
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.RedemptionFeeDuration
                                  ? `New redemption duration`
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.DiscordInvite
                                  ? `New discord invite`
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.TwitterHandle
                                  ? `New twitter handle`
                                  : `New validator name`
                              }
                              value={`${proposalDetail.configAccount.value} ${
                                proposalDetail.configAccount.config_type ===
                                ConfigAccountEnum.MaxPrimaryStake
                                  ? 'SOL'
                                  : proposalDetail.configAccount.config_type ===
                                      ConfigAccountEnum.InitialRedemptionFee ||
                                    proposalDetail.configAccount.config_type ===
                                      ConfigAccountEnum.NftHolderShare
                                  ? '%'
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.RedemptionFeeDuration
                                  ? 'days'
                                  : null
                              }`}
                            />
                            <PropoposalVoteLine
                              strikethrough
                              title={
                                proposalDetail.configAccount.config_type ===
                                ConfigAccountEnum.MaxPrimaryStake
                                  ? 'Current max primary stake'
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.InitialRedemptionFee
                                  ? `Current initial redemption fee`
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.NftHolderShare
                                  ? `Current NFT holder's share`
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.RedemptionFeeDuration
                                  ? `Current redemption duration`
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.DiscordInvite
                                  ? `Current discord invite`
                                  : proposalDetail.configAccount.config_type ===
                                    ConfigAccountEnum.TwitterHandle
                                  ? `Current twitter handle`
                                  : `Current validator name`
                              }
                              value={
                                validatorDetails &&
                                !areValidatorDetailsLoading ? (
                                  proposalDetail.configAccount.config_type ===
                                  ConfigAccountEnum.MaxPrimaryStake ? (
                                    `${validatorDetails.max_primary_stake} SOL`
                                  ) : proposalDetail.configAccount
                                      .config_type ===
                                    ConfigAccountEnum.InitialRedemptionFee ? (
                                    `${validatorDetails.initial_redemption_fee} %`
                                  ) : proposalDetail.configAccount
                                      .config_type ===
                                    ConfigAccountEnum.NftHolderShare ? (
                                    `${validatorDetails.nft_holders_share} %`
                                  ) : proposalDetail.configAccount
                                      .config_type ===
                                    ConfigAccountEnum.RedemptionFeeDuration ? (
                                    `${validatorDetails.redemption_fee_duration}`
                                  ) : proposalDetail.configAccount
                                      .config_type ===
                                    ConfigAccountEnum.DiscordInvite ? (
                                    `${validatorDetails.discord_invite}`
                                  ) : proposalDetail.configAccount
                                      .config_type ===
                                    ConfigAccountEnum.TwitterHandle ? (
                                    `${validatorDetails.twitter_handle}`
                                  ) : (
                                    `${validatorDetails.validator_name}`
                                  )
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
                          </Box>
                        ) : null
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
                  !programVersion ||
                  programVersion.status === VersionStatus.Unsafe
                    ? 'text'
                    : 'contained'
                }
                color={'primary'}
                disabled={
                  isVoting ||
                  areValidatorDetailsLoading ||
                  isProposalDetailLoading
                }
                onClick={() => {
                  setVoteChoice(true);
                  if (
                    !programVersion ||
                    programVersion.status === VersionStatus.Unsafe
                  )
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
                disabled={
                  isVoting ||
                  areValidatorDetailsLoading ||
                  isProposalDetailLoading
                }
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
