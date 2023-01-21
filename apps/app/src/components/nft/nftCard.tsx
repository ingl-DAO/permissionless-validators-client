import { MoreHorizRounded, OpenInFullOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { InglNft } from '../../interfaces';
import theme from '../../theme/theme';

export default function NftCard({
  nftData: { rarity, image_ref, is_delegated, numeration, nft_mint_id },
  isDialogOpen,
  disabled,
  setActionnedNft,
  nftData: gem,
  revealRarity,
  redeemNft,
  delegateNft,
  undelegateNft,
}: {
  nftData: InglNft;
  disabled: boolean;
  isDialogOpen: boolean;
  setActionnedNft: (nft: InglNft) => void;
  revealRarity: () => void;
  delegateNft: () => void;
  undelegateNft: () => void;
  redeemNft: () => void;
}) {
  const gemActions: {
    title: string;
    condition: boolean;
    onClick: () => void;
  }[] = [
    {
      title: 'redeem',
      condition: !is_delegated,
      onClick: () => {
        redeemNft();
        closeMenu();
      },
    },
    {
      title: 'delegate',
      condition: !is_delegated,
      onClick: () => {
        delegateNft();
        closeMenu();
      },
    },
    {
      title: 'undelegate',
      onClick: () => {
        undelegateNft();
        closeMenu();
      },
      condition: is_delegated,
    },
  ];

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setMenuAnchor(null);
  };

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <>
      <Box
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
              height: '100px',
              width: '100px',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '100px',
              top: '50%',
              left: '50%',
              margin: '-50px 0 0 -50px',
              display: 'grid',
              alignItems: 'center',
              justifyItems: 'center',
            }}
          >
            <OpenInFullOutlined sx={{ color: 'white', fontSize: '2.5rem' }} />
          </Box>
        </Tooltip>
        <Box
          sx={{
            background: 'rgba(9, 44, 76, 0.6)',
            borderRadius: theme.spacing(2.5),
            position: 'relative',
            height: { laptop: '300px', mobile: '150px' },
            width: { laptop: '300px', mobile: '150px' },
          }}
        >
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
            {rarity === undefined ? (
              <Button
                variant="contained"
                color="primary"
                size="small"
                disabled={disabled}
                onClick={revealRarity}
                sx={{
                  zIndex: 1,
                  color: 'white',
                  borderRadius: '30px',
                  textTransform: 'none',
                  fontSize: { mobile: '0.55rem', laptop: 'initial' },
                }}
              >
                Reveal rarity
              </Button>
            ) : (
              <Typography
                variant="h3"
                sx={{ fontSize: { laptop: 'initial', mobile: '0.80rem' } }}
              >
                {rarity}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              padding: '5px 7px',
              borderTopRightRadius: theme.spacing(2.5),
              borderBottomLeftRadius: theme.spacing(2.5),
            }}
          >
            <IconButton
              onClick={
                disabled
                  ? () => null
                  : (event) => {
                      setMenuAnchor(event.currentTarget);
                      setIsMenuOpen(true);
                      setActionnedNft(gem);
                    }
              }
            >
              <Tooltip arrow title="more">
                <MoreHorizRounded
                  sx={{
                    zIndex: 1,
                    color: 'white',
                    fontSize: '25px',
                  }}
                />
              </Tooltip>
            </IconButton>
          </Box>
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
      </Box>
      <Menu
        anchorEl={menuAnchor}
        open={isMenuOpen}
        elevation={0}
        onClose={closeMenu}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: theme.common.dialogBackground,
          },
        }}
      >
        {gemActions.map(({ title, condition, onClick }, index) =>
          condition ? (
            <MenuItem
              sx={{
                '&:hover': {
                  backgroundColor: isDialogOpen
                    ? 'black'
                    : theme.palette.secondary.light,
                },
              }}
              dense
              onClick={() => onClick()}
              key={index}
            >
              {title}
            </MenuItem>
          ) : null
        )}
      </Menu>
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
              ID
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { laptop: 'initial', mobile: '0.80rem' },
                textAlign: 'center',
              }}
            >
              {nft_mint_id}
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
              {rarity}
            </Typography>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
