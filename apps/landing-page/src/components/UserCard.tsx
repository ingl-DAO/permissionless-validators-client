import { LinkedIn } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';
import theme from '../theme/theme';
import { Member } from './Team';
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();

export default function UserCard({
  member: { imageRef, linkedinRef, role, fullname },
}: {
  member: Member;
}) {
  return (
    <Box
      data-aos="fade-left"
      sx={{
        borderRadius: '30px',
        position: 'relative',
        background: `linear-gradient(180deg, #28293D 0%, #1C1C28 100%);`,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: { laptop: '300px', mobile: '192px' },
          '&:hover': {
            transform: 'scale(1.2)',
          },
          transformOrigin: 'top top',
          transition: 'ease-in 0.5s',
        }}
      >
        <img
          src={imageRef}
          alt={`${fullname}'s profile`}
          style={{
            width: '100%',
            height: 'inherit',
            objectFit: 'cover',
            borderRadius: '30px',
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 4,
          right: 0,
          left: '-2px',
          width: '95%',
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'center',
          background:
            'linear-gradient(180deg, rgba(40, 41, 61, 0.6) 0%, rgba(28, 28, 40, 0.6) 100%);',
          borderRadius: '36px',
          padding: '10px 0px',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: 'white',
            textAlign: 'start',
            fontSize: {
              laptop: '1.5rem',
              mobile: '0.96rem',
              padding: '0 20px',
            },
          }}
        >
          {fullname}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            padding: '0 20px',
          }}
        >
          <Typography
            color={theme.palette.primary.main}
            sx={{
              fontSize: {
                laptop: '1.125rem',
                mobile: '0.72rem',
                textAlign: 'start',
              },
              fontWeight: 'bold',
            }}
          >
            {role}
          </Typography>
          <Box>
            <Typography
              component="a"
              href={linkedinRef}
              rel="noreferrer"
              target="_blank"
            >
              <Tooltip arrow title={`${fullname}'s linkedin`}>
                <LinkedIn color="primary" />
              </Tooltip>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
