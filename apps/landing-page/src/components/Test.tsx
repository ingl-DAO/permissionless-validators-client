import { Box } from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import theme from '../theme/theme';
import DaoSection from './DaoSection';
import Faqs from './Faqs';
import Footer from './Footer';
import HeroSection from './HeroSection';
import Navbar from './Navbar';
import SectionNFT from './NFTSection';
import SocialLinks from './SocialLinks';
import Team from './Team';
import SectionValidator from './ValidatorSection';
import NFTListing from './NFTListing';

export function Test({ intl: { formatMessage } }: { intl: IntlShape }) {
  return (
    <Box
      sx={{
        display: 'grid',
        justifyItems: 'center',
        minHeight: '100vh',
        borderTop: '2px solid ' + theme.palette.primary.main,
        borderBottom: '2px solid ' + theme.palette.primary.main,
        overflowX: 'hidden',
      }}
    >
      <Box
        sx={{
          px: theme.spacing(10),
          py: theme.spacing(2.375),
        }}
      >
        <Navbar />
        <HeroSection />
        <SocialLinks />
        <SectionValidator />
        <Box
          style={{
            width: '120%',
            marginLeft: '-10%',
            minHeight: '150px',
            height: 'auto',
            backgroundColor: theme.palette.secondary.main + '04',
          }}
        ></Box>
        <SectionNFT />
        <Box
          style={{
            width: '120%',
            marginLeft: '-10%',
            minHeight: '150px',
            height: 'auto',
            backgroundColor: theme.palette.secondary.main + '02',
          }}
        >
          <NFTListing />
        </Box>
        <DaoSection />
        <Team />
        <Box
          style={{
            width: '120%',
            marginLeft: '-10%',
            minHeight: '150px',
            height: 'auto',
            backgroundColor: theme.palette.secondary.main + '01',
          }}
        ></Box>
      </Box>
      <Faqs />
      <Footer />
    </Box>
  );
}
export default injectIntl(Test);
