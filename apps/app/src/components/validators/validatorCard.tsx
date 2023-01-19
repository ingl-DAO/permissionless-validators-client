import { Skeleton } from '@mui/material';
import { Box } from '@mui/system';
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
  },
  searchValue,
}: {
  validator: Validator;
  searchValue: string;
}) {
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
      onClick={() => navigate(va_id)}
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
          value={va_id}
          searchValue={searchValue}
          trim
        />
        <ValidatorCardContent title="NFTs share" value={`${nft_share}%`} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            columnGap: theme.spacing(2),
          }}
        >
          <ValidatorCardContent
            title="Total stake requested"
            value={`${tr_stake} SOL`}
          />
          <ValidatorCardContent title="APY" value={`${apy}%`} />
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
        <ValidatorCardContent title="NFTs share" value={''} skeleton />
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
