import {
  Box,
  Button,
  Checkbox,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import * as Yup from 'yup';
import theme from '../../theme/theme';

export interface MoreValidatorInfo {
  website: string;
  description: string;
  can_transfer_secondary_items: boolean;
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

export default function MoreValidatorInformation({
  handleSubmit,
  moreValidatorInfo,
  isCreating = false,
  onPrev,
  onNext,
}: {
  handleSubmit: (val: MoreValidatorInfo) => void;
  moreValidatorInfo?: MoreValidatorInfo;
  isCreating?: boolean;
  onPrev: (val: MoreValidatorInfo) => void;
  onNext: (val: MoreValidatorInfo) => void;
}) {
  const initialValues: MoreValidatorInfo = moreValidatorInfo ?? {
    website: '',
    description: '',
    can_transfer_secondary_items: false,
  };

  const validationSchema = Yup.object().shape({
    website: Yup.string().required('required'),
    description: Yup.string().required('required').max(32),
    can_transfer_secondary_items: Yup.boolean().required('required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (values.can_transfer_secondary_items) {
        onNext(values);
      } else handleSubmit(values);
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
        <Typography variant="body2">More validator information</Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(2),
          }}
        >
          <Button
            variant="contained"
            color="inherit"
            sx={{ color: 'black' }}
            disabled={isCreating}
            onClick={() =>
              onPrev({
                can_transfer_secondary_items:
                  formik.values.can_transfer_secondary_items,
                description: formik.values.description,
                website: formik.values.website,
              })
            }
          >
            Prev
          </Button>
          <Button
            variant="contained"
            disabled={isCreating}
            sx={{
              color: !formik.values.can_transfer_secondary_items
                ? 'inherit'
                : 'black',
            }}
            color={
              !formik.values.can_transfer_secondary_items
                ? 'primary'
                : 'inherit'
            }
            type="submit"
          >
            {formik.values.can_transfer_secondary_items ? 'Next' : 'List Now'}
          </Button>
        </Box>
      </Box>
      <Scrollbars autoHide>
        <Box sx={{ display: 'grid', rowGap: theme.spacing(1) }}>
          {[
            {
              label: 'Website',
              description: 'Where do you live on the world wide web ? 🌐',
              formikKey: 'website',
            },
            {
              label: 'Description',
              description: 'Short description of your offer📝',
              formikKey: 'description',
              multiline: true,
              rows: 5,
            },
          ].map(({ description, formikKey, label, multiline, rows }, index) => (
            <CustomInput
              formik={formik}
              formikKey={formikKey}
              label={label}
              subLabel={description}
              key={index}
              multiline={multiline}
              rows={rows}
            />
          ))}
          <Tooltip
            arrow
            title={
              'A secondary item is any thing valuable, related to the validator and which can be sold alongside with the vote account for the continuous proper functioning of the entity.'
            }
          >
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
                    backgroundColor: theme.common.inputBackground,
                  },
                }}
                checked={formik.values.can_transfer_secondary_items}
                {...formik.getFieldProps('can_transfer_secondary_items')}
                onChange={(e) =>
                  formik.setFieldValue(
                    'can_transfer_secondary_items',
                    e.target.checked
                  )
                }
              />
              <Box>
                <Typography variant="h6">
                  {'Transfer secondary items'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'wheat' }}>
                  {
                    'Want to transfer ownership of your validator’s secondary items like website, discord, twitter etc..'
                  }
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        </Box>
      </Scrollbars>
    </Box>
  );
}
