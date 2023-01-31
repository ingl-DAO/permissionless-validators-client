import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import theme from '../theme/theme';
import SectionTitle from './SectionTitle';
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();

export default function DaoSection() {
  return (
    <Box
      data-aos="flip-down"
      sx={{
        textAlign: 'center',
        marginTop: theme.spacing(10),
        marginBottom: theme.spacing(10),
        position: 'relative',
        zIndex: 1,
        maxWidth: { laptop: 1500, mobile: '100%' },
        minHeight: { laptop: 1000, mobile: 700 },
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <SectionTitle title="dao powered community" center />
      <Typography sx={{ mx: { laptop: 25, mobile: 0 } }}>
        Every launched validator is fully decentralised and DAO controlled.
        <br />
        Everything ranging from program upgrade to secondary stake share is a
        communal decision. The base governance units are the validators NFTs.
      </Typography>
      <Box
        sx={{
          width: { laptop: 'initial', mobile: '100%' },
          position: 'absolute',
          // width: '100%',
          height: '100%',
          right: '-27%',
          zIndex: -1,
          display: 'flex',
        }}
      >
        <img
          src={'/assets/spiral.png'}
          alt="dao over world"
          style={{
            position: 'absolute',
            // width: '100%',
            height: '100%',
            right: -75,
          }}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        size="large"
        component="a"
        href="https://app.ingl.io/validators"
        rel="noreferrer"
        target="_blank"
        sx={{
          borderRadius: '90px',
          marginTop: theme.spacing(11),
          padding: theme.spacing(1.5, 8),
        }}
      >
        Join a Validator
      </Button>
    </Box>
  );
}
