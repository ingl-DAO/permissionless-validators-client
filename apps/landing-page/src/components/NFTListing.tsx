import { Box, Button, Typography } from '@mui/material';
import theme from '../theme/theme';
import AOS from 'aos';
import 'aos/dist/aos.css';
import NftCard from './NFTCard';
AOS.init();

export default function NFTListing() {
  const nftsData = [
    {
      rarity: 'Mythic',
      image_ref:
        'https://arweave.net/fty1yQjfDAk_kwhXvIUhT1dtyIee5RXnpYh52qtrk9k',
      numeration: 1,
    },
    {
      rarity: 'Exalted',
      image_ref:
        'https://arweave.net/A-ooDu64VibK2izBinW9wjlPcwEWkzGZsXpQStHBu48',
      numeration: 2,
    },
    {
      rarity: 'Uncommon',
      image_ref:
        'https://arweave.net/AXpb4XMBmNPYNgoCLeiIhokJF8f1fCgz1yCCguQnOSw',
      numeration: 3,
    },
    {
      rarity: 'Common',
      image_ref:
        'https://arweave.net/nxnd63AwdayeP7TEfuRH6EMkD7WFUX_AoTAiFMm31rM',
      numeration: 4,
    },
  ];
  return (
    <Box
      data-aos="fade-left"
      sx={{
        borderRadius: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: theme.spacing(4, 0),
      }}
    >
      <Typography
        variant="h3"
        component="span"
        sx={{
          color: theme.palette.secondary.main,
          textAlign: 'justify',
          fontSize: '2rem',
        }}
      >
        Some NFTs
      </Typography>
      <Box
        style={{
          margin: theme.spacing(4, 0, 3, 0),
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {nftsData.map((nft) => (
          <NftCard nftData={nft} />
        ))}
      </Box>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        component="a"
        href="https://app.ingl.io/validators"
        rel="noreferrer"
        target="_blank"
        sx={{
          borderRadius: '90px',
          padding: theme.spacing(1.5, 8),
          marginTop: theme.spacing(2),

          fontWeight: 'bold',
        }}
      >
        Mint yours
      </Button>
    </Box>
  );
}
