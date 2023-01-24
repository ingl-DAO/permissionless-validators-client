import { Skeleton } from '@mui/material';
import { Box } from '@mui/system';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from 'bn.js';
import { useNavigate } from 'react-router';
import { Validator } from '../../interfaces';
import theme from '../../theme/theme';
import ValidatorCardContent from './validatorCardContent';

export default function ValidatorCard({
  validator: {
    apy,
    image_ref,
    nft_share,
    total_requested_stake: tr_stake,
    validator_name: name,
    validator_website: website,
    vote_account_id: va_id,
    validator_program_id: vp_id,
    unit_backing: unit_backing,
  },
  searchValue,
}: {
  validator: Validator;
  searchValue: string;
}) {
  console.log(tr_stake);
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        backgroundColor: '#28293D',
        borderRadius: theme.spacing(1),
        padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
        display: 'grid',
        rowGap: theme.spacing(2),
        width: '100%',
        cursor: 'pointer',
      }}
      onClick={() => navigate(vp_id)}
    >
      <img
        src={image_ref}
        width="100%"
        alt={name}
        style={{ borderRadius: theme.spacing(1) }}
      />
      <Box
        sx={{
          display: 'grid',
          gridAutoFlow: 'row',
          rowGap: theme.spacing(1.75),
        }}
      >
        <ValidatorCardContent
          title={website}
          value={name}
          revert
          searchValue={searchValue}
        />
        <ValidatorCardContent
          title="Vote account ID"
          value={va_id.slice(0, 4) + '...' + va_id.slice(-4)}
          searchValue={searchValue}
          trim
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            columnGap: theme.spacing(2),
          }}
        >
          <ValidatorCardContent title="NFTs share" value={`${nft_share}%`} />
          <ValidatorCardContent
            title="Unit backing"
            value={`${new BN(unit_backing ?? 0).div(
              new BN(LAMPORTS_PER_SOL)
            )} SOL`}
            right
          />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            columnGap: theme.spacing(2),
          }}
        >
          <ValidatorCardContent
            title="Total stake requested"
            value={`${new BN(tr_stake).div(new BN(LAMPORTS_PER_SOL))} SOL`}
          />
          <ValidatorCardContent title="APY" value={`${apy}%`} right />
        </Box>
      </Box>
    </Box>
  );
}
export function ValidatorSkeleton() {
  return (
    <Box
      sx={{
        backgroundColor: '#28293D',
        borderRadius: theme.spacing(1),
        padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
        display: 'grid',
        rowGap: theme.spacing(2),
        width: '100%',
      }}
    >
      <Skeleton
        animation="wave"
        height={'150px'}
        width="100%"
        sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
      />
      <Box
        sx={{
          display: 'grid',
          gridAutoFlow: 'row',
          rowGap: theme.spacing(1.75),
        }}
      >
        <ValidatorCardContent title={''} value={''} revert skeleton />
        <ValidatorCardContent title="Vote account ID" value={''} skeleton />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            columnGap: theme.spacing(2),
          }}
        >
          <ValidatorCardContent title="NFTs share" value={''} skeleton />
          <ValidatorCardContent title="Unit backing" value={''} skeleton />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            columnGap: theme.spacing(2),
          }}
        >
          <ValidatorCardContent
            title="Total stake requested"
            value={''}
            skeleton
          />
          <ValidatorCardContent title="APY" value={''} skeleton />
        </Box>
      </Box>
    </Box>
  );
}
