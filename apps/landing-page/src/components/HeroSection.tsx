import { Box, Button, Grid, Typography } from '@mui/material';
import AOS from 'aos';
import 'aos/dist/aos.css';
import theme from '../theme/theme';
AOS.init();

export default function HeroSection() {
  return (
    <Grid
      data-aos="fade-down"
      data-aos-delay="300"
      container
      spacing={4.5}
      sx={{ marginTop: 12.3 }}
    >
      <Grid item container mobile={12} laptop={6.5} alignContent="center">
        <Grid item mobile={12} sx={{ textAlign: 'left', wordSpacing: '20px' }}>
          <Typography
            variant="h1"
            component="span"
            sx={{
              fontSize: { mobile: '2rem', laptop: '3.125rem' },
            }}
          >
            <Typography variant="h1" component="span" color="secondary">
              Launch a{' '}
            </Typography>
            <Typography
              variant="h1"
              component="span"
              sx={{
                background:
                  'linear-gradient(277.92deg, #EF233C 37.73%, #D5F2E3 100.47%);',
                backgroundClip: 'text',
                textFillColor: 'transparent',
              }}
            >
              fractionalized{' '}
            </Typography>
            <Typography variant="h1" component="span" color="secondary">
              validator equivalently backed by profitable and redeemable NFTs
            </Typography>
          </Typography>
        </Grid>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            justifyContent: 'start',
            width: '100%',
            marginTop: theme.spacing(10.5),
            columnGap: theme.spacing(30 / 8),
          }}
        >
          <Button
            sx={{
              borderRadius: '90px',
              padding: theme.spacing(1.25, 6),
            }}
            variant="contained"
            color="primary"
            size="large"
            component="a"
            href="https://app.ingl.io/"
            rel="noreferrer"
          >
            Visit App
          </Button>
          <Button
            sx={{
              borderRadius: '90px',
              padding: theme.spacing(1.25, 6),
            }}
            variant="contained"
            color="secondary"
            size="large"
            component="a"
            href="https://whitepaper.ingl.io"
            rel="noreferrer"
          >
            Whitepaper
          </Button>
        </Box>
      </Grid>
      <Grid
        item
        mobile={0}
        laptop={5.5}
        alignContent="center"
        sx={{
          display: { mobile: 'none', laptop: 'flex' },
          position: 'relative',
          minHeight: '73vh',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <img
          src={'/assets/hero_moon.png'}
          alt="ingl hero"
          style={{
            width: '120%',
            objectFit: 'contain',
            position: 'absolute',
            right: '-10%',
            marginTop: '-150px',
          }}
        />
      </Grid>
    </Grid>
  );
}
