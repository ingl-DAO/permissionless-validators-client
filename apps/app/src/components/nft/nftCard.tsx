import { MoreHorizRounded } from '@mui/icons-material';
import {
  Box,
  Button,
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
  gem: { rarity, image_ref, is_delegated, numeration },
  isDialogOpen,
  disabled,
  setActionnedNft,
  gem,
  revealRarity,
  redeemNft,
  delegateNft,
  undelegateNft,
}: {
  gem: InglNft;
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

  return (
    <>
      <Box
        sx={{
          padding: theme.spacing(1.5),
          background:
            'linear-gradient(151.27deg, #EF233C 10.17%, #1C1C28 32.86%, #28293D 65.73%, #EF233C 150.23%)',
          borderRadius: theme.spacing(3.75),
          width: 'fit-content',
        }}
      >
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
    </>
  );
}
