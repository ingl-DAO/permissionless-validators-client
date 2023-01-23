import { Button, Grid, Typography, Box } from '@mui/material';
import Validator from '../assets/elec_earth.png';
import theme from '../theme/theme';
import SectionTitle from './SectionTitle';
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();

export default function SectionValidator() {
  return (
    <Grid
      data-aos={'fade-right'}
      container
      alignItems="center"
      columnSpacing={17.625}
      style={{
        marginTop: theme.spacing(17.5),
        marginBottom: theme.spacing(17.5),
      }}
    >
      <Grid
        item
        mobile={0}
        laptop={5.8}
        tablet={12}
        sx={{
          display: 'flex',
          position: 'relative',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            paddingTop: theme.spacing(15),
          }}
        >
          <SectionTitle title={'VALIDATORS'} />
        </Box>

        <img
          src={Validator}
          alt={`Validators description`}
          style={{ width: '90%', marginLeft: '-30%' }}
        />
      </Grid>
      <Grid
        item
        mobile={12}
        laptop={5.8}
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
          Our mission is to profitably onboard as much validators as possible to
          the Solana blockchain.{' '}
        </Typography>

        <Typography
          component="span"
          style={{
            fontSize: '20px',
            lineHeight: '32px',
          }}
        >
          This is done by fractionalizing the vote account, the voting fees
          amongst NFTs holders and sharing voting rewards(transaction fees +
          inflation + mev) with them.
          <br />
          With{' '}
          <a
            href="https://whitepaper.ingl.io"
            target={'_blank'}
            rel="noreferrer"
            style={{ color: theme.palette.secondary.main }}
          >
            {' '}
            minimum solana validator requirements
          </a>{' '}
          met, device owners can onboard their computing unit to the solana
          network without worries of the necessary voting.
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
            color="secondary"
            variant="contained"
            size="large"
            component="a"
            href="https://whitepaper.ingl.io/components/onboarding-a-validator"
            rel="noreferrer"
            sx={{
              borderRadius: '90px',
              padding: theme.spacing(1.25, 6),
            }}
          >
            Onboard PC Now
          </Button>
          <Button
            sx={{
              borderRadius: '90px',
              padding: theme.spacing(1.25, 6),
            }}
            variant="contained"
            color="primary"
            size="large"
            component="a"
            href="https://app.ingl.io/register-validator"
            rel="noreferrer"
          >
            Register a new Validator
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
