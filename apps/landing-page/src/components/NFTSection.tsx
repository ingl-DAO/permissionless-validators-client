import { Button, Grid, Typography, Box, useMediaQuery } from '@mui/material';
import NFT from '../assets/nfts.png';
import theme from '../theme/theme';
import SectionTitle from './SectionTitle';
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();

export default function SectionNFT() {
  const matchless1200 = useMediaQuery('(max-width:1200px)');

  return (
    <Grid
      data-aos={'fade-left'}
      container
      alignItems=""
      columnSpacing={17.625}
      direction="row-reverse"
      style={{
        marginTop: theme.spacing(10),
        marginBottom: theme.spacing(10),
      }}
    >
      <Grid
        item
        mobile={0}
        laptop={matchless1200 ? 12 : 5.5}
        tablet={12}
        sx={{
          position: 'relative',
          justifyContent: 'flex-end',
          display: { mobile: 'none', laptop: 'flex', tablet: 'none' },
        }}
      >
        <Box
          sx={
            matchless1200
              ? { position: 'relative', paddingTop: theme.spacing(0) }
              : {
                  position: { laptop: 'absolute', mobile: 'relative' },
                  paddingTop: {
                    laptop: theme.spacing(15),
                    mobile: theme.spacing(0),
                  },
                }
          }
        >
          <SectionTitle title={'DeFi NFTS'} />
        </Box>
        <Box
          sx={{
            display: {
              mobile: 'none',
              laptop: matchless1200 ? 'none' : 'flex',
            },
          }}
        >
          <img
            src={NFT}
            alt={`NFT description`}
            style={{ width: '95%', marginRight: '-20%' }}
          />
        </Box>
      </Grid>
      <Grid
        item
        mobile={12}
        laptop={matchless1200 ? 12 : 6}
        tablet={12}
        sx={{
          alignSelf: 'center',
        }}
      >
        <Typography
          sx={{
            marginBottom: theme.spacing(3),
            fontSize: '30px',
            color: theme.palette.secondary.main,
          }}
        >
          Sol backed and redeemable NFTs. They are backed by an equivalent
          amount of sol used to mint.
        </Typography>

        <Typography
          component="span"
          style={{ fontSize: '20px', lineHeight: '32px' }}
        >
          NFTs Holders get a share of voting rewards from their validators.
          <br />
          These NFTs are the validators governance unit and are necessary to
          create, vote and execute proposals
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            justifyContent: 'start',
            width: '100%',
            marginTop: theme.spacing(5.8),
            columnGap: theme.spacing(30 / 8),
          }}
        >
          <Button
            sx={{
              borderRadius: '90px',
              padding: theme.spacing(1.25, 6),
              textAlign: 'center',
            }}
            variant="contained"
            color="primary"
            size="large"
            component="a"
            href="https://app.ingl.io/validators"
            rel="noreferrer"
          >
            Mint an NFT and start Earning
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
