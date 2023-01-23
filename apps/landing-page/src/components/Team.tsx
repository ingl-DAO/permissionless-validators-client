import { Box, Typography } from '@mui/material';
import theme from '../theme/theme';
import UserCard from './UserCard';
import cyrial from '../assets/cyrial.png';
import marco from '../assets/marco.png';
import angelo from '../assets/angelo.png';
import lorrain from '../assets/lorrain.png';
import AOS from 'aos';
import 'aos/dist/aos.css';
import SectionTitle from './SectionTitle';
AOS.init();

export interface Member {
  imageRef: string;
  linkedinRef: string;
  role: string;
  fullname: string;
}

export default function Team() {
  const members: Member[] = [
    {
      fullname: 'Cyrial Kamda',
      role: 'dev',
      linkedinRef: 'https://www.linkedin.com/in/kamda-cyrial/',
      imageRef: cyrial,
    },
    {
      fullname: 'Marco Kuidja',
      role: 'dev',
      linkedinRef: 'https://www.linkedin.com/in/marco-kuidja',
      imageRef: marco,
    },
    {
      fullname: 'Ange Noubissie',
      role: 'dev',
      linkedinRef: 'https://www.linkedin.com/in/diepe-angelo/',
      imageRef: angelo,
    },
    {
      fullname: 'Lorrain Tchakoumi',
      role: 'dev',
      linkedinRef: 'https://www.linkedin.com/in/ltchakoumi',
      imageRef: lorrain,
    },
  ];
  return (
    <Box
      sx={{
        textAlign: 'center',
        marginTop: { laptop: theme.spacing(2), mobile: theme.spacing(6) },
        marginBottom: { laptop: theme.spacing(10), mobile: theme.spacing(6) },
      }}
    >
      <Box data-aos="zoom-in" data-aos-delay="300">
        <SectionTitle title="BROUGHT TO YOU BY" center />
      </Box>

      <Box
        data-aos="flip-up"
        sx={{
          display: 'grid',
          marginTop: { laptop: theme.spacing(17), mobile: theme.spacing(5) },
          gridTemplateColumns: {
            mobile: '192px',
            laptop: 'auto auto auto auto',
          },
          rowGap: theme.spacing(3.75),
          columnGap: theme.spacing(5.75),
          justifyContent: 'center',
        }}
      >
        {members.map((member, index) => (
          <UserCard member={member} key={index} />
        ))}
      </Box>
    </Box>
  );
}
