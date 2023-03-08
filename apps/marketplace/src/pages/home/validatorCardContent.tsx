import { Box, Skeleton, Typography } from '@mui/material';
import random from '../../common/utils/random';
import theme from '../../theme/theme';

export default function ValidatorCardContent({
  title,
  value,
  searchValue,
  revert = false,
  skeleton = false,
  trim = false,
  wrap = false,
  right = false,
}: {
  title: string | JSX.Element;
  value: string;
  revert?: boolean;
  skeleton?: boolean;
  searchValue?: string;
  trim?: boolean;
  wrap?: boolean;
  right?: boolean;
}) {
  return (
    <Box
      sx={{
        maxWidth: '300px',
        display: 'flex',
        flexFlow: revert ? 'column-reverse' : 'column',
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: '300' }}
      >
        {skeleton && revert ? (
          <Skeleton
            animation="wave"
            width={`${random() * 10}%`}
            sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
          />
        ) : (
          title
        )}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          lineHeight: 1,
          textOverflow: wrap ? 'initial' : 'ellipsis',
          overflow: 'hidden',
          whiteSpace: wrap ? 'initial' : 'nowrap',
          width: trim ? '250px' : 'initial',
          overflowWrap: wrap ? 'anywhere' : 'initial',
          fontSize: revert ? '1.45rem' : theme.typography.h6.fontSize,
          textAlign: right ? 'right' : 'initial',
        }}
      >
        {skeleton && !revert ? (
          <Skeleton
            animation="wave"
            width={title === 'APY' ? '100%' : `${random() * 10}%`}
            sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
          />
        ) : searchValue ? (
          <Typography component="div" variant="body1">
            {value.split(searchValue).map((_, index) =>
              value.split(searchValue).length - 1 === index ? (
                _
              ) : (
                <>
                  {_}
                  <Typography
                    component="span"
                    sx={{ backgroundColor: theme.palette.secondary.light }}
                  >
                    {searchValue}
                  </Typography>
                </>
              )
            )}
          </Typography>
        ) : (
          value
        )}
      </Typography>
    </Box>
  );
}
