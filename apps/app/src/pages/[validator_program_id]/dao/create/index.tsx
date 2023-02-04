import { ReportRounded, WarningAmberOutlined } from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    FormControl,
    MenuItem,
    OutlinedInput,
    Select,
    Skeleton, Typography
} from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
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
import { InglNft, InglValidator, ProgramUpgrade } from '../../../../interfaces';
import { ValidatorService } from '../../../../services/validator.service';
import theme from '../../../../theme/theme';

export default function CreateProposal() {
  const navigate = useNavigate();
  const { validator_program_id } = useParams();
  const { pathname } = useLocation();
  const { formatNumber } = useIntl();

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
    max_primary_stake: new BN(20),
    nft_holders_share: 20,
    proposal_quorum: 10,
    redemption_fee_duration: 37923829293,
    total_delegated_count: 0,
    total_delegated_stake: new BN(0),
    total_minted_count: 0,
    total_secondary_stake: new BN(2),
    twitter_handle: 'ieol',
    unit_backing: new BN(20),
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

  useEffect(() => {
    loadValidatorDetails(validator_program_id as string);
    loadNfts();
    return () => {
      //TODO: Cleanup above axios fetch
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const pu_init_vals: ProgramUpgrade = {
    buffer_account: '',
    code_link: '',
  };

  const pu_schema = Yup.object().shape({
    buffer_account: Yup.string().required('required'),
    code_link: Yup.string().required('required'),
  });

  const pu_formik = useFormik({
    initialValues: pu_init_vals,
    validationSchema: pu_schema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      alert(JSON.stringify(values));
      resetForm();
    },
  });

  const [proposalType, setProposalType] = useState<string>('Program upgrade');

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
                  subLabel="Tell more about of your proposal or just use a github gist link (optional)"
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

                {/* <TextField
                  size="small"
                  required
                  select
                  fullWidth
                  value={proposalType}
                  onChange={(event) => setProposalType(event.target.value)}
                  sx={{
                    '& input, & div, & svg': {
                      backgroundColor: '#1C1C28',
                      color: 'white',
                      '&::placeholder': {
                        color: 'white',
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
                </TextField> */}
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
              onClick={() =>
                navigate(pathname.split('/').slice(0, -1).join('/'))
              }
            >
              Cancel
            </Button>
            <Button variant="contained" color="primary" fullWidth>
              Create
            </Button>
          </Box>
          <GovernancePower areNftsLoading={areNftsLoading} nfts={nfts} />
        </Box>
      </Box>
    </Box>
  );
}
