import { Box, Button, Checkbox, Typography } from '@mui/material';
import BN from 'bn.js';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import * as Yup from 'yup';
import theme from '../../theme/theme';
import { CustomInput } from './validatorInformation';

export interface VoteAccountInfo {
  max_primary_stake: BN;
  init_commission: number;
  nft_holders_share: number;
  initial_redemption_fee: number;
  redemption_fee_duration: number;
  is_validator_id_switchable: false;
}

export default function VoteAccountInformation({
  setStep,
  handleSubmit,
  voteAccountInfo,
  onPrev,
}: {
  setStep: (step: number) => void;
  handleSubmit: (val: VoteAccountInfo) => void;
  voteAccountInfo?: VoteAccountInfo;
  onPrev: () => void;
}) {
  const initialValues: VoteAccountInfo = voteAccountInfo ?? {
    max_primary_stake: new BN(0),
    init_commission: 0,
    nft_holders_share: 0,
    initial_redemption_fee: 10,
    redemption_fee_duration: 0,
    is_validator_id_switchable: false,
  };

  const validationSchema = Yup.object().shape({
    max_primary_stake: Yup.number().required('required').min(1),
    init_commission: Yup.number().required('required').max(100),
    nft_holders_share: Yup.number().required('required').max(100).min(50),
    initial_redemption_fee: Yup.number().max(25),
    redemption_fee_duration: Yup.number().required('required').max(2*365*3600),
    is_validator_id_switchable: Yup.boolean().required('required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      handleSubmit(values);
      setStep(3);
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
        <Typography variant="body2">Vote account's information</Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(2),
          }}
        >
          <Button variant="contained" color="primary" onClick={onPrev}>
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
            formikKey={'max_primary_stake'}
            label={'Total primary stake (SOL)'}
            subLabel={'Total SOLS needed to be accumulated through NFTs'}
            type="number"
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
                label: "NFT holder's share (%)",
                description: "NFT's holder percentage share of rewards",
                formikKey: 'nft_holders_share',
              },
              {
                label: 'Initial commission',
                description:
                  'Initial commission to be charged from secondary stakers',
                formikKey: 'init_commission',
              },
            ].map(({ description, formikKey, label }, index) => (
              <CustomInput
                formik={formik}
                formikKey={formikKey}
                label={label}
                subLabel={description}
                key={index}
                type="number"
              />
            ))}
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridAutoFlow: 'column',
              columnGap: theme.spacing(2),
            }}
          >
            {[
              {
                label: 'Initial redemption fee (%)',
                description:
                  'Leave empty if no redemption fee else at least 10%',
                formikKey: 'initial_redemption_fee',
              },
              {
                label: 'Redemption fee duration',
                description: 'in days',
                formikKey: 'redemption_fee_duration',
              },
            ].map(({ description, formikKey, label }, index) => (
              <CustomInput
                formik={formik}
                formikKey={formikKey}
                label={label}
                subLabel={description}
                key={index}
                type="number"
              />
            ))}
          </Box>
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
              {...formik.getFieldProps('is_validator_id_switchable')}
            />
            <Box>
              <Typography variant="h6">
                {'Is validator ID switchable ?'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'wheat' }}>
                {"Should validator's ID be switchable"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Scrollbars>
    </Box>
  );
}
