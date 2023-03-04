import { Box, TextField, Typography } from '@mui/material';
import theme from '../../theme/theme';

export function Label({
  label,
  subLabel,
}: {
  label: string;
  subLabel: string;
}) {
  return (
    <Box>
      <Typography variant="h6" color={'white'}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: 'wheat' }}>
        {subLabel}
      </Typography>
    </Box>
  );
}

export default function BareCustomInput({
  label,
  subLabel,
  value,
  onChange,
}: {
  label: string;
  subLabel: string;
  value: Date;
  onChange: (val: Date) => void;
}) {
  return (
    <Box>
      <Label label={label} subLabel={subLabel} />
      <Typography>{value.toDateString()}</Typography>
      <TextField
        size="small"
        value={value.toLocaleDateString()}
        onChange={(event) => onChange(new Date(event.target.value))}
        type="date"
        placeholder={label}
        fullWidth
        required
        sx={{
          '& input, & div': {
            backgroundColor: theme.common.inputBackground,
            color: 'white',
            '&::placeholder': {
              color: 'white',
            },
          },
        }}
      />
    </Box>
  );
}
