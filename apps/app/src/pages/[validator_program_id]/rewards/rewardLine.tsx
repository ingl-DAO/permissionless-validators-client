import { Checkbox, TableCell, TableRow } from '@mui/material';
import { NftReward } from '../../../interfaces';
import theme from '../../../theme/theme';

export default function RewardLine({
  reward: { image_ref, nft_mint_id, numeration, rewards },
  reward,
  onSelect,
  isChecked,
}: {
  reward: NftReward;
  onSelect: (nft: NftReward) => void;
  isChecked: boolean;
}) {
  return (
    <TableRow
      sx={{
        padding: `0 ${theme.spacing(4.625)}`,
        backgroundColor: '#28293D',
        cursor: 'pointer',
        '& .MuiTableCell-root': {
          border: 'none',
          padding: '2px 8px',
        },
      }}
    >
      <TableCell align="center">
        <Checkbox
          color="primary"
          checked={isChecked}
          disabled={rewards === 0}
          onClick={() => onSelect(reward)}
        />
      </TableCell>
      <TableCell>
        <img
          src={image_ref}
          alt={`nft ${numeration}`}
          style={{
            objectFit: 'cover',
            height: '50px',
            width: '50px',
            borderRadius: '100%',
          }}
        />
      </TableCell>
      <TableCell sx={{ color: 'white' }}>{`#${numeration}`}</TableCell>
      <TableCell sx={{ color: 'white' }}>{nft_mint_id}</TableCell>
      <TableCell sx={{ color: 'white' }} align="right">
        {rewards}
      </TableCell>
    </TableRow>
  );
}
