import { Box, Button, Typography } from '@mui/material';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import * as Yup from 'yup';
import theme from '../../theme/theme';
import { CustomInput } from './validatorInformation';

export interface DaoInfo {
  proposal_quorum: number;
  governance_expiration_time: number;
}

export default function DaoInformation({
  onPrev,
  handleSubmit,
  daoInfo,
  isCreating,
}: {
  onPrev: (val: DaoInfo) => void;
  handleSubmit: (val: DaoInfo) => void;
  daoInfo?: DaoInfo;
  isCreating: boolean;
}) {
  const initialValues: DaoInfo = daoInfo ?? {
    proposal_quorum: 0,
    governance_expiration_time: 35 * 24 * 3600,
  };

  const validationSchema = Yup.object().shape({
    proposal_quorum: Yup.number().required('required'),
    governance_expiration_time: Yup.number()
      .required('required')
      .min(35 * 24 * 3600, 'Must be greater an 35 days')
      .max(365 * 24 * 3599, 'Must be less than a year'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      handleSubmit(values);
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
        <Typography variant="body2">Validator's DAO information</Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(2),
          }}
        >
          <Button
            variant="contained"
            color="primary"
            disabled={isCreating}
            onClick={() =>
              onPrev({
                proposal_quorum: formik.values.proposal_quorum,
                governance_expiration_time:
                  formik.values.governance_expiration_time,
              })
            }
          >
            Prev
          </Button>
          <Button variant="contained" color="primary" disabled>
            Next
          </Button>
        </Box>
      </Box>
      <Scrollbars autoHide>
        <Box sx={{ display: 'grid', rowGap: theme.spacing(1) }}>
          {[
            {
              label: 'Proposal quorum',
              description:
                'Minimum percentage of NFTs required to vote on a proposal⚖ ',
              formikKey: 'proposal_quorum',
            },
            {
              label: 'Governance expiration time (seconds)',
              description: 'Time needed for proposal to expire in seconds!',
              formikKey: 'governance_expiration_time',
              isNumber: true,
            },
          ].map(({ description, formikKey, label, isNumber }, index) => (
            <CustomInput
              formik={formik}
              formikKey={formikKey}
              label={label}
              subLabel={description}
              key={index}
              type={isNumber ? 'number' : 'string'}
            />
          ))}
          {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={isCreating}
          >
            Create permissionless validator✨
          </Button>
        </Box>
      </Scrollbars>
    </Box>
  );
}
