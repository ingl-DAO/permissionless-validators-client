import { Box, Button, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import * as Yup from 'yup';
import theme from '../../theme/theme';

export interface ValidatorInfo {
  validator_name: string;
  validator_id: string;
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
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: any;
  label: string;
  subLabel: string;
  formikKey: string;
  type?: 'string' | 'number';
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
        type={type}
        required
        sx={{
          '& input': {
            backgroundColor: '#28293D',
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
  const initialValues: ValidatorInfo = validatorInfo ?? {
    validator_id: '',
    discord_invite: '',
    twitter_handle: '',
    validator_name: '',
    website: '',
  };

  const validationSchema = Yup.object().shape({
    validator_id: Yup.string().required('required'),
    validator_name: Yup.string().required('required').max(32),
    discord_invite: Yup.string().required('required').max(32),
    twitter_handle: Yup.string().required('required'),
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
          {[
            {
              label: 'Validator name',
              description: 'Make it sound outstanding and unique!',
              formikKey: 'validator_name',
            },
            {
              label: 'Validator ID',
              description: 'Solana public key of the validator account',
              formikKey: 'validator_id',
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
                description: 'ex: inglDao',
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
