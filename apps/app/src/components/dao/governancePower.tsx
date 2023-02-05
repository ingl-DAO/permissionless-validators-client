import { Box, Skeleton, Typography } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { InglNft } from '../../interfaces';
import theme from '../../theme/theme';

export default function GovernancePower({
  nfts,
  areNftsLoading,
}: {
  nfts: InglNft[];
  areNftsLoading: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(1),
        backgroundColor: '#28293D',
        padding: theme.spacing(1),
        borderRadius: '15px',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          columnGap: theme.spacing(1),
        }}
      >
        <Typography variant="caption" sx={{ color: 'white' }}>
          My governance power
        </Typography>
        <Typography
          component={'span'}
          variant="caption"
          sx={{
            color: 'white',
            display: 'grid',
            gridAutoFlow: 'column',
            alignItems: 'center',
            justifyContent: 'end',
            columnGap: theme.spacing(2),
          }}
        >
          {areNftsLoading ? (
            <Skeleton
              animation="wave"
              width={50}
              sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
            />
          ) : (
            nfts.length
          )}{' '}
          NFTs
        </Typography>
      </Box>
      <Box
        sx={{
          padding: theme.spacing(1),
          backgroundColor: 'rgba(28, 28, 40, 1)',
          borderRadius: '15px',
          height: '92px',
        }}
      >
        <Scrollbars autoHide>
          <Box
            sx={{
              display: 'grid',
              gridAutoFlow: 'column',
              justifyContent: 'start',
              columnGap: theme.spacing(1.2),
            }}
          >
            {areNftsLoading ? (
              [...new Array(10)].map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  animation="wave"
                  sx={{
                    backgroundColor: 'rgb(137 127 127 / 43%)',
                    borderRadius: theme.spacing(2),
                  }}
                  height={92}
                  width={92}
                />
              ))
            ) : nfts.length === 0 ? (
              <Typography variant="caption">You own no Nft's</Typography>
            ) : (
              nfts.map(({ image_ref, numeration }, index) => (
                <img
                  alt={`${numeration}`}
                  src={image_ref}
                  key={index}
                  width="88px"
                  height="88px"
                  style={{
                    objectFit: 'cover',
                    borderRadius: theme.spacing(2),
                    border: `2px solid ${theme.palette.primary.main}`,
                  }}
                />
              ))
            )}
          </Box>
        </Scrollbars>
      </Box>
    </Box>
  );
}
