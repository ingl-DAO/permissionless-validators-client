import { Box, Button, Typography } from '@mui/material';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import * as Yup from 'yup';
import theme from '../../theme/theme';
import { CustomInput } from './moreValidatorInformation';

export interface ValidatorInfo {
  validator_name: string;
  validator_id: string;
  vote_account_id: string;
  price: number;
}

export default function ValidatorInformation({
  onPrev,
  onNext,
  validatorInfo,
  isCreating,
}: {
  onPrev: (val: ValidatorInfo) => void;
  onNext: (val: ValidatorInfo) => void;
  validatorInfo?: ValidatorInfo;
  isCreating: boolean;
}) {
  const initialValues: ValidatorInfo = validatorInfo ?? {
    price: 0,
    validator_id: '',
    validator_name: '',
    vote_account_id: '',
  };

  const validationSchema = Yup.object().shape({
    validator_id: Yup.string().required('required'),
    validator_name: Yup.string().required('required'),
    vote_account_id: Yup.string().required('required'),
    price: Yup.number().required('required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      onNext(values);
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
            columnGap: 2,
          }}
        >
          <Button
            variant="contained"
            color="inherit"
            disabled={true}
            onClick={() =>
              onPrev({
                price: formik.values.price,
                validator_id: formik.values.validator_id,
                validator_name: formik.values.validator_name,
                vote_account_id: formik.values.vote_account_id,
              })
            }
          >
            Prev
          </Button>
          <Button
            variant="contained"
            color="inherit"
            type="submit"
            sx={{ color: 'black' }}
            disabled={isCreating}
          >
            Next
          </Button>
        </Box>
      </Box>
      <Scrollbars autoHide>
        <Box sx={{ display: 'grid', rowGap: theme.spacing(4) }}>
          {[
            {
              label: 'Validator name',
              description: 'What is the name of your validator ?',
              formikKey: 'validator_name',
            },
            {
              label: 'Validator ID',
              description: 'Solana public key of the validator account🗝️ ',
              formikKey: 'validator_id',
            },
            {
              label: 'Vote account ID',
              description: 'Solana public key of the vote account🗝️',
              formikKey: 'vote_account_id',
            },
          ].map(({ description, formikKey, label }, index) => (
            <CustomInput
              formik={formik}
              formikKey={formikKey}
              label={label}
              subLabel={description}
              key={index}
              type={'string'}
            />
          ))}
          <CustomInput
            formik={formik}
            formikKey={'price'}
            label={'Cost (SOL)'}
            subLabel={'How much SOL do you want to sell your validator for ?'}
            type={'number'}
          />
        </Box>
      </Scrollbars>
    </Box>
  );
}
