import { Box, Typography } from '@mui/material';
import theme from '../theme/theme';

export default function SectionTitle({
  title,
  center,
}: {
  title: string;
  center?: boolean;
}) {
  return (
    <Box
      sx={{
        marginBottom: theme.spacing(5.875),
        marginTop: theme.spacing(5.875),
        textAlign: center ? 'center' : 'initial',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Typography
        variant="h1"
        component="span"
        sx={{
          color: theme.palette.secondary.main,
          textAlign: 'justify',
          fontSize: { mobile: '2rem', laptop: center ? '4.5rem' : '6rem' },
        }}
      >
        {title.toUpperCase()}
      </Typography>
    </Box>
  );
}
