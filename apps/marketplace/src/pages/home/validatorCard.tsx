import { ContentCopyRounded } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import useNotification from '../../common/utils/notification';
import { Validator } from '../../interfaces';
import theme from '../../theme/theme';
import ValidatorCardContent from './validatorCardContent';

export default function ValidatorCard({
  validator: {
    validator_logo_url: image_ref,
    number_of_unique_stakers: n_us,
    price,
    total_stake: ts,
    validator_name: name,
    vote_account_id: va_id,
    program_id,
  },
  searchValue,
}: {
  validator: Validator;
  searchValue: string;
}) {
  const { formatNumber } = useIntl();

  const [validatorCardNotif, setValidatorCardNotif] =
    useState<useNotification>();
  const navigate = useNavigate();

  const handleOnClick = (type: 'open' | 'copy') => {
    if (type === 'open') {
      navigate(program_id);
    } else {
      if (validatorCardNotif) validatorCardNotif.dismiss();
      const notif = new useNotification();
      notif.notify({
        render: 'Copying the vote account ID to clipboard...',
      });
      notif.update({
        render: 'Copied the vote account ID to clipboard',
        type: 'SUCCESS',
        autoClose: 2000,
      });
      setValidatorCardNotif(notif);
      navigator.clipboard.writeText(va_id);
    }
  };

  return (
    <div onClick={(e) => handleOnClick('open')} style={{ cursor: 'pointer' }}>
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
        <img
          src={image_ref}
          width="100%"
          alt={name}
          style={{ borderRadius: theme.spacing(1), cursor: 'pointer' }}
          onClick={() => handleOnClick('open')}
        />

        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'row',
            rowGap: theme.spacing(1.75),
          }}
        >
          <ValidatorCardContent
            title={''}
            value={name}
            revert
            searchValue={searchValue}
          />
          <Box style={{ display: 'grid', gridAutoFlow: 'column' }}>
            <ValidatorCardContent
              title="Vote account ID"
              value={va_id.slice(0, 10) + '...' + va_id.slice(-4)}
              searchValue={searchValue}
              trim
            />
            <label
              onClick={(e) => {
                e.stopPropagation();
                handleOnClick('copy');
              }}
            >
              <ContentCopyRounded
                fontSize="small"
                sx={{
                  color: 'white',
                  '&:hover': { color: `#EF233C` },
                  justifySelf: 'start',
                  cursor: 'pointer',
                }}
              />
            </label>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              columnGap: theme.spacing(2),
            }}
          >
            <ValidatorCardContent
              title="Number of US"
              value={formatNumber(n_us)}
            />
            <ValidatorCardContent
              title="Total Stake"
              value={formatNumber(ts, {
                style: 'currency',
                currency: 'SOL',
              })}
              right
            />
          </Box>
          <ValidatorCardContent
            title="Price"
            value={formatNumber(price, {
              style: 'currency',
              currency: 'SOL',
            })}
          />
        </Box>
      </Box>
    </div>
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
          <ValidatorCardContent title="Number of US" value={''} skeleton />
          <ValidatorCardContent title="Total Stake" value={''} skeleton />
        </Box>
        <ValidatorCardContent title="Price" value={''} skeleton />
      </Box>
    </Box>
  );
}
