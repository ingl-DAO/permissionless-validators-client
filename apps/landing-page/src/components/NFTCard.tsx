import { OpenInFullOutlined } from '@mui/icons-material';
import { Box, Dialog, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { InglNft } from '../interfaces';
import theme from '../theme/theme';

export default function NftCard({
  nftData: { rarity, image_ref, numeration },
}: {
  nftData: InglNft;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <>
      <Box
        data-aos="fade-left"
        sx={{
          position: 'relative',
          padding: theme.spacing(1.5),
          background:
            'linear-gradient(151.27deg, #EF233C 10.17%, #1C1C28 32.86%, #28293D 65.73%, #EF233C 150.23%)',
          borderRadius: theme.spacing(3.75),
          width: 'fit-content',
          ':hover': {
            '& .expand_icon': {
              visibility: 'visible',
            },
          },
          margin: theme.spacing(2, 4),
        }}
      >
        <Tooltip arrow title={'Expand'}>
          <Box
            className="expand_icon"
            onClick={() => setIsExpanded(true)}
            sx={{
              zIndex: 1,
              visibility: 'hidden',
              position: 'absolute',
              height: '75px',
              width: '75px',
              backgroundColor: theme.palette.secondary.main,
              borderRadius: '75px',
              top: '50%',
              left: '50%',
              margin: '-37.5px 0 0 -37.5px',
              display: 'grid',
              alignItems: 'center',
              justifyItems: 'center',
            }}
          >
            <OpenInFullOutlined sx={{ color: 'black', fontSize: '2.5rem' }} />
          </Box>
        </Tooltip>
        <Box
          sx={{
            background: 'rgba(9, 44, 76, 0.6)',
            borderRadius: theme.spacing(2.5),
            position: 'relative',
            height: { laptop: '220px', mobile: '200px' },
            width: { laptop: '220px', mobile: '200px' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              margin: 'auto',
              borderTopRightRadius: theme.spacing(2.5),
              borderBottomLeftRadius: theme.spacing(2.5),
              height: '100%',
              width: '100%',
            }}
          >
            <img
              src={image_ref}
              alt={`nft ${numeration}`}
              style={{
                objectFit: 'cover',
                height: '100%',
                width: '100%',
                borderRadius: theme.spacing(2.5),
              }}
            />
          </Box>
          {rarity && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#1C1C28',
                padding: '5px 7px',
                borderTopRightRadius: theme.spacing(2.5),
                borderBottomLeftRadius: theme.spacing(2.5),
              }}
            >
              <Typography
                variant="h3"
                sx={{ fontSize: { laptop: 'initial', mobile: '0.80rem' } }}
              >
                {rarity}
              </Typography>
            </Box>
          )}

          <Box
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                backgroundColor: '#1C1C28',
                padding: '5px 7px',
                borderRadius: '30px',
                bottom: 0,
                margin: 'auto',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { laptop: 'initial', mobile: '0.80rem' },
                  textAlign: 'center',
                  color: theme.palette.primary.main,
                }}
              >
                {`#${numeration}`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={isExpanded}
        onClose={() => setIsExpanded(false)}
        sx={{
          '& .MuiPaper-root': {
            width: '50vw',
            height: '50vh',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            background: 'rgba(9, 44, 76, 0.6)',
            borderRadius: theme.spacing(0.5),
            position: 'relative',
            height: '100%',
            width: '100%',
          }}
        >
          <img
            src={image_ref}
            alt={`nft ${numeration}`}
            style={{
              objectFit: 'cover',
              height: '100%',
              width: '100%',
              borderRadius: theme.spacing(0.5),
            }}
          />
          <Box
            sx={{
              background: 'rgba(28, 28, 40, 0.75)',
              position: 'absolute',
              borderRadius: '20px 20px 0px 0px',
              bottom: 0,
              left: '50%',
              transform: 'translate(-50%, 0%)',
              padding: '10px',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { laptop: 'initial', mobile: '0.80rem' },
                textAlign: 'center',
              }}
            >
              {`#${numeration}`}
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontSize: { laptop: 'initial', mobile: '0.80rem' },
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Rarity
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { laptop: 'initial', mobile: '0.80rem' },
                textAlign: 'center',
              }}
            >
              {rarity ?? 'Not yet revealed'}
            </Typography>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
