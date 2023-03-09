import {
  DangerousOutlined,
  ReportRounded,
  WarningAmberOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  OutlinedInput,
  Select,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import CopyTransactionId from '../../../../common/components/copyTransactionId';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate, useParams } from 'react-router';
import * as Yup from 'yup';
import ErrorMessage from '../../../../common/components/ErrorMessage';
import useNotification from '../../../../common/utils/notification';
import GovernancePower from '../../../../components/dao/governancePower';
import { CustomInput } from '../../../../components/register-validator/validatorInformation';
import {
  ConfigAccountEnum,
  CreateProposal,
  InglNft,
  InglValidator,
  ProgramUpgrade,
  VoteAccountEnum,
} from '../../../../interfaces';
import { NftService } from '../../../../services/nft.service';
import { ProposalService } from '../../../../services/proposal.service';
import { ValidatorService } from '../../../../services/validator.service';
import theme from '../../../../theme/theme';

export default function ProposalCreation() {
  const navigate = useNavigate();
  const { validator_program_id } = useParams();
  const { pathname } = useLocation();
  const { formatNumber } = useIntl();

  const [areValidatorDetailsLoading, setAreValidatorDetailsLoading] =
    useState<boolean>(false);

  const [validatorDetails, setValidatorDetails] = useState<InglValidator>();
  const [validatorDetailNotif, setValidatorDetailNotif] =
    useState<useNotification>();

  const walletContext = useWallet();
  const { connection } = useConnection();
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
        if (nfts.length === 0) {
          navigate(pathname.split('/').slice(0, -1).join('/'));
        } else {
          setNfts(nfts);
          setAreNftsLoading(false);
          notif.dismiss();
          setNftNotif(undefined);
        }
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
    if (validator_program_id) loadValidatorDetails(validator_program_id);
    if (nftService) loadNfts();
    return () => {
      //TODO: Cleanup above axios fetch
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validator_program_id, nftService]);

  const initialValues: { title: string; description: string } = {
    title: '',
    description: '',
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('required').max(130),
    description: Yup.string().required('required').max(300),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      alert(JSON.stringify(values));
      resetForm();
    },
  });

  const vId_init_vals: { new_value: string | number } = {
    new_value: '',
  };

  const vId_schema = Yup.object().shape({
    new_value: Yup.string().required('required'),
  });

  const vId_formik = useFormik({
    initialValues: vId_init_vals,
    validationSchema: vId_schema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      resetForm();
    },
  });

  const pu_init_vals: ProgramUpgrade = {
    buffer_account: '',
    code_link: '',
  };

  const pu_schema = Yup.object().shape({
    buffer_account: Yup.string().required('required'),
    code_link: Yup.string()
      .required('required')
      .matches(
        /https:\/\/github\.com/ && /.git$/,
        'code link must be a github repository.'
      ),
  });

  const pu_formik = useFormik({
    initialValues: pu_init_vals,
    validationSchema: pu_schema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      resetForm();
    },
  });

  const [proposalType, setProposalType] = useState<string>('Program upgrade');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [proposalNotif, setProposalNotif] = useState<useNotification>();

  const submitProposal = (proposal: CreateProposal) => {
    setIsCreating(true);
    const notif = new useNotification();
    if (proposalNotif) proposalNotif.dismiss();
    setProposalNotif(notif);
    notif.notify({
      render: 'Creating Proposal...',
    });
    proposalService
      ?.initGovernanace(proposal)
      .then((signature) => {
        notif.update({
          render: (
            <CopyTransactionId
              transaction_id={signature}
              message="Created proposal successfully"
            />
          ),
        });
        setProposalNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => submitProposal(proposal)}
              notification={notif}
              message={
                error?.message ||
                'There was an error creating your proposal. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setIsCreating(false));
  };

  const submitForms = () => {
    if (nfts.length > 0) {
      const { description: d, title: t } = formik.values;
      if (d !== '' && d.length <= 300 && t !== '' && t.length <= 130) {
        const submitData: CreateProposal = {
          description: d,
          title: t,
          nft_mint_id: nfts[0].nft_mint_id,
          program_id: validator_program_id as string,
        };

        if (proposalType === 'Program upgrade') {
          const { buffer_account, code_link } = pu_formik.values;
          if (buffer_account !== '' && code_link !== '') {
            submitData.programUpgrade = {
              buffer_account: buffer_account,
              code_link: code_link,
            };
          } else pu_formik.submitForm();
        } else if (proposalType.includes('Vote account')) {
          const { new_value } = vId_formik.values;
          if (new_value !== '') {
            submitData.voteAccount = {
              value: new_value,
              vote_type: proposalType.includes('commission')
                ? VoteAccountEnum.Commission
                : VoteAccountEnum.ValidatorID,
            };
          } else vId_formik.submitForm();
        } else if (proposalType.includes('Config account')) {
          const { new_value } = vId_formik.values;
          if (new_value !== '') {
            submitData.configAccount = {
              value: [
                'Config account : change max primary stake',
                'Config account : change NFT holder share',
                'Config account : change initial redemption fee',
                'Config account : change redemption fee duration',
              ].includes(proposalType)
                ? Number(new_value)
                : new_value,
              config_type: proposalType.includes('stake')
                ? ConfigAccountEnum.MaxPrimaryStake
                : proposalType.includes('share')
                ? ConfigAccountEnum.NftHolderShare
                : proposalType.includes('initial redemption')
                ? ConfigAccountEnum.InitialRedemptionFee
                : proposalType.includes('fee duration')
                ? ConfigAccountEnum.RedemptionFeeDuration
                : proposalType.includes('validator name')
                ? ConfigAccountEnum.ValidatorName
                : proposalType.includes('twitter')
                ? ConfigAccountEnum.TwitterHandle
                : ConfigAccountEnum.DiscordInvite,
            };
          } else vId_formik.submitForm();
        } else alert('testing new stuff');

        submitProposal(submitData);
      } else {
        const tt = new useNotification();
        tt.notify({ render: 'Notifying' });
        tt.update({
          autoClose: 5000,
          type: 'ERROR',
          icon: () => <DangerousOutlined color="error" />,
          render:
            'You must fill in the title and description fields correctly!!!',
        });
      }
    } else {
      const tt = new useNotification();
      tt.notify({ render: 'Notifying' });
      tt.update({
        autoClose: 5000,
        type: 'WARNING',
        icon: () => <DangerousOutlined color="warning" />,
        render:
          'You must own at least an nft on this validator to create a proposal!!!',
      });
      navigate(pathname.split('/').slice(0, -1).join('/'));
    }
  };

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
          height: '99%',
        }}
      >
        <Scrollbars autoHide>
          <Box
            sx={{
              backgroundColor: '#28293D',
              padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
              display: 'grid',
              rowGap: theme.spacing(2),
              borderRadius: theme.spacing(3),
              gridTemplateRows: 'auto 1fr',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: theme.spacing(1),
              }}
            >
              <Typography variant="h6">Create a new proposal</Typography>
              <Box
                sx={{
                  display: 'grid',
                  justifySelf: 'end',
                  gridAutoFlow: 'column',
                  columnGap: theme.spacing(1),
                }}
              >
                <Chip
                  size="small"
                  icon={<WarningAmberOutlined />}
                  color="primary"
                  label={
                    <Typography variant="caption">
                      Proposal creation fee:{' '}
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{ fontWeight: 'bold' }}
                      >
                        2 SOL
                      </Typography>
                    </Typography>
                  }
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  {`Expiration duration: 🕒${
                    validatorDetails && !areValidatorDetailsLoading ? (
                      formatNumber(
                        validatorDetails.governance_expiration_time,
                        {
                          style: 'unit',
                          unit: 'day',
                          unitDisplay: 'narrow',
                        }
                      )
                    ) : (
                      <Skeleton
                        animation="wave"
                        width={100}
                        component="span"
                        sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                      />
                    )
                  }`}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: 'grid' }}>
                <CustomInput
                  inputBackgroundColor="#1C1C28"
                  formik={formik}
                  formikKey="title"
                  label="Title"
                  subLabel="Give a title to your proposal"
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.5)', justifySelf: 'end' }}
                >{`${formik.values.title.length}/130`}</Typography>
              </Box>
              <Box sx={{ display: 'grid' }}>
                <CustomInput
                  inputBackgroundColor="#1C1C28"
                  formik={formik}
                  formikKey="description"
                  label="Description"
                  multiline
                  rows={3}
                  subLabel="Tell more about of your proposal or just use a github gist link"
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.5)', justifySelf: 'end' }}
                >{`${formik.values.description.length}/300`}</Typography>
              </Box>

              <Box>
                <Box>
                  <Typography variant="h6">Instruction</Typography>
                  <Typography variant="caption" sx={{ color: 'wheat' }}>
                    Select the type of instruction to be executed if proposal is
                    approved
                  </Typography>
                </Box>

                <FormControl fullWidth>
                  <Select
                    size="small"
                    required
                    fullWidth
                    value={proposalType}
                    onChange={(event) => setProposalType(event.target.value)}
                    input={
                      <OutlinedInput
                        fullWidth
                        sx={{
                          minWidth: theme.spacing(20),
                          '& input, & div, & svg': {
                            backgroundColor: '#1C1C28',
                            color: 'white',
                            '&::placeholder': {
                              color: 'white',
                            },
                          },
                        }}
                      />
                    }
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 48 * 4.5 + 8,
                        },
                      },
                    }}
                  >
                    {[
                      'Program upgrade',
                      'Vote account : swap validator ID',
                      'Vote account : swap commission',
                      'Config account : change max primary stake',
                      'Config account : change NFT holder share',
                      'Config account : change initial redemption fee',
                      'Config account : change redemption fee duration',
                      'Config account : change validator name',
                      'Config account : change twitter handle',
                      'Config account : change discord invite',
                    ].map((val, index) => (
                      <MenuItem key={index} value={val}>
                        {val}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box
                sx={{
                  border: '1px solid #D5F2E3',
                  padding: 2,
                  borderRadius: '15px',
                  marginTop: 3.125,
                }}
              >
                {proposalType === 'Program upgrade' ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridAutoFlow: 'column',
                      columnGap: 2,
                    }}
                  >
                    <CustomInput
                      inputBackgroundColor="#1C1C28"
                      formik={pu_formik}
                      formikKey="buffer_account"
                      label="Buffer address"
                      subLabel="Address of the new program"
                    />
                    <CustomInput
                      inputBackgroundColor="#1C1C28"
                      formik={pu_formik}
                      formikKey="code_link"
                      label="Code link"
                      subLabel="Github link to the code behind the deployed buffer data"
                    />
                  </Box>
                ) : proposalType === 'Vote account : swap validator ID' ? (
                  <CustomInput
                    inputBackgroundColor="#1C1C28"
                    formik={vId_formik}
                    formikKey="new_value"
                    label="New validator ID"
                    subLabel="Address of the validator to be newly onboarded"
                  />
                ) : proposalType === 'Vote account : swap commission' ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridAutoFlow: 'column',
                      columnGap: 2,
                    }}
                  >
                    <Box>
                      <Box>
                        <Typography variant="h6">
                          Previous commission
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'wheat' }}>
                          Commission currently charged from secondary stakers
                        </Typography>
                      </Box>
                      <TextField
                        size="small"
                        placeholder="Previous commission"
                        fullWidth
                        required
                        value={
                          validatorDetails
                            ? `${validatorDetails.init_commission}%`
                            : ''
                        }
                        disabled
                        sx={{
                          '& input, & div': {
                            backgroundColor: '#1C1C28',
                            color: 'white',
                            '&::placeholder': {
                              color: 'white',
                            },
                          },
                          '& .Mui-disabled': {
                            WebkitTextFillColor: 'rgba(255, 255, 255, 0.35)',
                          },
                        }}
                      />
                    </Box>
                    <CustomInput
                      inputBackgroundColor="#1C1C28"
                      type="number"
                      formik={vId_formik}
                      formikKey="new_value"
                      label="New commission"
                      subLabel="New commission to be charged from secondary stakers"
                    />
                  </Box>
                ) : proposalType.includes('Config account') ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridAutoFlow: 'column',
                      columnGap: 2,
                    }}
                  >
                    <Box>
                      <Box>
                        <Typography variant="h6">Previous value</Typography>
                        <Typography variant="caption" sx={{ color: 'wheat' }}>
                          Validator's current value
                        </Typography>
                      </Box>
                      <TextField
                        size="small"
                        fullWidth
                        required
                        value={
                          validatorDetails
                            ? proposalType.includes('stake')
                              ? `${Number(
                                  validatorDetails.max_primary_stake /
                                    10_000_000_000
                                )}SOL`
                              : proposalType.includes('share')
                              ? `${validatorDetails.nft_holders_share}%`
                              : proposalType.includes('initial redemption')
                              ? formatNumber(
                                  validatorDetails.initial_redemption_fee,
                                  {
                                    style: 'unit',
                                    unit: 'percent',
                                    unitDisplay: 'narrow',
                                  }
                                )
                              : proposalType.includes('fee duration')
                              ? formatNumber(
                                  validatorDetails.redemption_fee_duration,
                                  {
                                    style: 'unit',
                                    unit: 'day',
                                    unitDisplay: 'long',
                                  }
                                )
                              : proposalType.includes('validator name')
                              ? validatorDetails.validator_name
                              : proposalType.includes('twitter')
                              ? validatorDetails.twitter_handle
                              : validatorDetails.discord_invite
                            : ''
                        }
                        disabled
                        sx={{
                          '& input, & div': {
                            backgroundColor: '#1C1C28',
                            color: 'white',
                            '&::placeholder': {
                              color: 'white',
                            },
                          },
                          '& .Mui-disabled': {
                            WebkitTextFillColor: 'rgba(255, 255, 255, 0.35)',
                          },
                        }}
                      />
                    </Box>
                    <CustomInput
                      inputBackgroundColor="#1C1C28"
                      type={
                        [
                          'Config account : change max primary stake',
                          'Config account : change NFT holder share',
                          'Config account : change initial redemption fee',
                          'Config account : change redemption fee duration',
                        ].includes(proposalType)
                          ? 'number'
                          : 'string'
                      }
                      formik={vId_formik}
                      formikKey="new_value"
                      label="New value"
                      subLabel="Enter proposition to be voted for"
                    />
                  </Box>
                ) : (
                  proposalType
                )}
              </Box>
            </Box>
          </Box>
        </Scrollbars>
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
              variant="contained"
              color="inherit"
              fullWidth
              sx={{ color: theme.common.background }}
              disabled={isCreating}
              onClick={() =>
                navigate(pathname.split('/').slice(0, -1).join('/'))
              }
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={isCreating}
              onClick={submitForms}
            >
              {isCreating && (
                <CircularProgress color="primary" thickness={5} size={'20px'} />
              )}
              {isCreating ? 'Creating' : 'Create'}
            </Button>
          </Box>
          <GovernancePower areNftsLoading={areNftsLoading} nfts={nfts} />
        </Box>
      </Box>
    </Box>
  );
}
