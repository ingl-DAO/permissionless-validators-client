import { Box, Button, Checkbox, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import { useState } from 'react';
import * as Yup from 'yup';
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
}: {
  setStep: (step: number) => void;
  handleSubmit: (val: ValidatorInfo) => void;
  validatorInfo: ValidatorInfo;
}) {
  const [isExistingValidator, setIsExistingValidator] =
    useState<boolean>(false);

  const initialValues: ValidatorInfo = validatorInfo ?? {
    [isExistingValidator ? 'vote_account_id' : 'validator_id']: '',
    discord_invite: '',
    twitter_handle: '',
    validator_name: '',
    website: '',
  };

  const validationSchema = Yup.object().shape({
    [isExistingValidator ? 'vote_account_id' : 'validator_id']:
      Yup.string().required('required'),
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
          <Button variant="contained" color="primary" type="submit">
            Next
          </Button>
        </Box>
      </Box>
      <Scrollbars autoHide>
        <Box sx={{ display: 'grid', rowGap: theme.spacing(1) }}>
          <CustomInput
            formik={formik}
            label="Validator name"
            formikKey="validator_name"
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
              checked={isExistingValidator}
              onChange={(e) => setIsExistingValidator(!isExistingValidator)}
            />
            <Box>
              <Typography variant="h6">{'I own a vote account'}</Typography>
              <Typography variant="caption" sx={{ color: 'wheat' }}>
                {'Fractionalizing an existing validator'}
              </Typography>
            </Box>
          </Box>
          {[
            {
              label: isExistingValidator
                ? 'Existing vote account ID'
                : 'Validator ID',
              description: `Solana public key of the validator ${
                isExistingValidator ? 'vote account' : 'account'
              }`,
              formikKey: isExistingValidator
                ? 'vote_account_id'
                : 'validator_id',
            },
            {
              label: 'Website',
              description: 'Where do you live on the world wide web?',
              formikKey: 'website',
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
