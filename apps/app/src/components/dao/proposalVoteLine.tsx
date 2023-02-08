import { Box, Typography } from '@mui/material';
import theme from '../../theme/theme';

export default function PropoposalVoteLine({
  title,
  value,
  color = 'white',
  strikethrough = false,
  unsafe = false,
  titleColor,
}: {
  title: string;
  value: string | JSX.Element;
  color?: string;
  strikethrough?: boolean;
  titleColor?: string;
  unsafe?: boolean;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color={titleColor ?? 'rgba(255, 255, 255, 0.5)'}
        fontSize="0.875rem"
        lineHeight={1}
      >
        {title}
      </Typography>
      <Typography
        lineHeight={1}
        color={unsafe ? theme.palette.primary.main : color}
        sx={{ textDecoration: strikethrough ? 'line-through' : 'initial' }}
      >
        {value}
      </Typography>
    </Box>
  );
}
