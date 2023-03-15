import {
  Box,
  Button,
  Checkbox,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import random from '../../common/utils/random';
import theme from '../../theme/theme';

export interface ValidatorInfo {
  validator_name: string;
  validator_id?: string;
  vote_account_id?: string;
  website: string;
  discord_invite: string;
  twitter_handle: string;
}

export const CustomInput = ({
  formik,
  label,
  subLabel,
  formikKey,
  type = 'string',
  multiline = false,
  rows = 1,
  inputBackgroundColor = '#28293D',
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: any;
  label: string;
  subLabel: string;
  formikKey: string;
  type?: 'string' | 'number';
  multiline?: boolean;
  rows?: number;
  inputBackgroundColor?: string;
}) => {
  return (
    <Box>
      <Box>
        <Typography variant="h6">{label}</Typography>
        <Typography variant="caption" sx={{ color: 'wheat' }}>
          {subLabel}
        </Typography>
      </Box>
      <TextField
        size="small"
        placeholder={label}
        fullWidth
        multiline={multiline}
        rows={multiline ? rows : 1}
        type={type}
        required
        sx={{
          '& input, & div': {
            backgroundColor: inputBackgroundColor,
            color: 'white',
            '&::placeholder': {
              color: 'white',
            },
          },
        }}
        {...formik.getFieldProps(formikKey)}
        error={formik.touched[formikKey] && Boolean(formik.errors[formikKey])}
        helperText={formik.touched[formikKey] && formik.errors[formikKey]}
      />
    </Box>
  );
};

export default function ValidatorInformation({
  setStep,
  handleSubmit,
  validatorInfo,
  hasExistingVoteAccount,
  setHasExistingVoteAccount,
}: {
  setStep: (step: number) => void;
  handleSubmit: (val: ValidatorInfo) => void;
  validatorInfo: ValidatorInfo;
  hasExistingVoteAccount: boolean;
  setHasExistingVoteAccount: (val: boolean) => void;
}) {
  const fieldName = hasExistingVoteAccount ? 'vote_account_id' : 'validator_id';
  const initialValues: ValidatorInfo = validatorInfo ?? {
    [fieldName]: '',
    discord_invite: '',
    twitter_handle: '',
    validator_name: '',
    website: '',
  };

  const validationSchema = Yup.object().shape({
    [fieldName]: Yup.string().required('required'),
    validator_name: Yup.string().required('required').max(32),
    discord_invite: Yup.string().required('required').max(32),
    twitter_handle: Yup.string()
      .required('required')
      .matches(/^(@)?[A-Za-z0-9_]{1,15}$/, 'invalid twitter handle'),
    website: Yup.string().required('required').max(64),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      handleSubmit(values);
      setStep(2);
      resetForm();
    },
  });
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authorizedWithdrawer, setAuthorizedWithdrawer] = useState<string>();

  useEffect(() => {
    if (formik.values.vote_account_id) {
      try {
        const voteAccountKey = new PublicKey(formik.values.vote_account_id);
        setIsLoading(true);
        connection
          .getAccountInfo(new PublicKey(voteAccountKey))
          .then((voteAccountInfo) => {
            if (voteAccountInfo) {
              //The first four bytes are used to represent the vote account version, the 32 following stand for the validator_id
              const authorizedWithdrawer = new PublicKey(
                Uint8Array.from(voteAccountInfo.data).slice(36, 68)
              ).toBase58();
              if (wallet.publicKey?.toBase58() === authorizedWithdrawer)
                setAuthorizedWithdrawer(authorizedWithdrawer);
              else {
                setAuthorizedWithdrawer(undefined);
                toast.error(
                  "Vote account authorized withdrawer doesn't match with wallet pubkey"
                );
              }
            } else toast.error('Invalid vote account ID.');
          })
          .catch((error) => toast.error(error))
          .finally(() => setIsLoading(false));
      } catch (error) {
        toast.error('Invalid pubkey !!!');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, formik.values.vote_account_id]);

  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(4),
        height: '100%',
        gridTemplateRows: 'auto 1fr',
      }}
      component="form"
      onSubmit={formik.handleSubmit}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          columnGap: theme.spacing(3),
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">Validator's information</Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(2),
          }}
        >
          <Button variant="contained" color="primary" disabled>
            Prev
          </Button>
          <Button
            disabled={
              hasExistingVoteAccount
                ? !authorizedWithdrawer
                : hasExistingVoteAccount
            }
            variant="contained"
            color="primary"
            type="submit"
          >
            Next
          </Button>
        </Box>
      </Box>
      <Scrollbars autoHide>
        <Box sx={{ display: 'grid', rowGap: theme.spacing(1) }}>
          <CustomInput
            formik={formik}
            formikKey="validator_name"
            label="Validator name"
            subLabel="Make it sound outstanding and unique!"
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: theme.spacing(1),
              alignItems: 'center',
            }}
          >
            <Checkbox
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '40px',
                },
              }}
              checked={hasExistingVoteAccount}
              onChange={(e) => {
                formik.setFieldValue(fieldName, '');
                setHasExistingVoteAccount(!hasExistingVoteAccount);
              }}
            />
            <Box>
              <Typography variant="h6">{'I own a vote account'}</Typography>
              <Typography variant="caption" sx={{ color: 'wheat' }}>
                {'Fractionalizing an existing validator'}
              </Typography>
            </Box>
          </Box>
          {hasExistingVoteAccount ? (
            <Box
              sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: theme.spacing(2),
              }}
            >
              <CustomInput
                formik={formik}
                formikKey="vote_account_id"
                label="Existing vote account ID"
                subLabel="Solana public key of the vote account"
              />
              <Box>
                <Box>
                  <Typography variant="h6">Authorized withdrawer ID</Typography>
                  <Typography variant="caption" sx={{ color: 'wheat' }}>
                    Vote account authorized withdrawer ID
                  </Typography>
                </Box>
                {isLoading ? (
                  <Skeleton
                    animation="wave"
                    width={`${random() * 10}%`}
                    sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                  />
                ) : (
                  <TextField
                    placeholder="Authorized withdrawer ID"
                    value={authorizedWithdrawer}
                    size="small"
                    type="string"
                    fullWidth
                    disabled
                    required
                    sx={{
                      '& input, & div': {
                        backgroundColor: '#28293D',
                        color: 'white',
                        '&::placeholder': {
                          color: 'white',
                        },
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          ) : (
            <CustomInput
              formik={formik}
              label="Validator ID"
              formikKey="validator_id"
              subLabel="Solana public key of the validator account"
            />
          )}
          <CustomInput
            formik={formik}
            formikKey="website"
            label="Website"
            subLabel="Where do you live on the world wide web?"
          />
          <Box
            sx={{
              display: 'grid',
              gridAutoFlow: 'column',
              columnGap: theme.spacing(2),
            }}
          >
            {[
              {
                label: 'Discord invite',
                description: "Your community's home",
                formikKey: 'discord_invite',
              },
              {
                label: 'Twitter handle',
                description: 'ex: @inglDao',
                formikKey: 'twitter_handle',
              },
            ].map(({ description, formikKey, label }, index) => (
              <CustomInput
                formik={formik}
                formikKey={formikKey}
                label={label}
                subLabel={description}
                key={index}
              />
            ))}
          </Box>
        </Box>
      </Scrollbars>
    </Box>
  );
}
