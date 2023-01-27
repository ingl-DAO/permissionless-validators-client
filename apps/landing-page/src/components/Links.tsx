import { GitHub, Telegram, Twitter } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';
import theme from '../theme/theme';

export default function Links() {
  const LINKS: { tooltip: string; link: string; icon: JSX.Element }[] = [
    {
      tooltip: 'github',
      link: 'https://github.com/ingl-DAO',
      icon: <GitHub color="primary" />,
    },
    {
      tooltip: 'discord',
      link: 'https://discord.gg/9KWvjKV3Ed',
      icon: <img src={'/assets/discord.png'} height="24px" alt="discord" />,
    },
    {
      tooltip: 'twitter',
      link: 'https://twitter.com/ingldao',
      icon: <Twitter color="primary" />,
    },
    {
      tooltip: 'telegram',
      link: 'https://t.me/inglDAO',
      icon: <Telegram color="primary" />,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        justifyContent: 'start',
        columnGap: theme.spacing(1),
      }}
    >
      {LINKS.map(({ tooltip, link, icon }, index) => (
        <Typography
          component="a"
          href={link}
          rel="noreferrer"
          sx={{ display: 'grid', alignItems: 'center' }}
          key={index}
        >
          <Tooltip arrow title={tooltip}>
            {icon}
          </Tooltip>
        </Typography>
      ))}
    </Box>
  );
}
