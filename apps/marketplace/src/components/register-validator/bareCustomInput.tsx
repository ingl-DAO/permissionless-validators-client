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
  type = 'date',
  disabled = false,
}: {
  label: string;
  subLabel: string;
  value: Date | string;
  onChange?: (val: Date) => void;
  type?: 'string' | 'date';
  disabled?: boolean;
}) {
  return (
    <Box>
      <Label label={label} subLabel={subLabel} />
      {type === 'date' && (
        <Typography>{(value as Date).toDateString()}</Typography>
      )}
      <TextField
        size="small"
        value={type === 'date' ? (value as Date).toLocaleDateString() : value}
        onChange={(event) =>
          onChange ? onChange(new Date(event.target.value)) : null
        }
        type={type}
        disabled={disabled}
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
