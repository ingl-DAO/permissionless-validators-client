import { Box, Typography } from '@mui/material';
import { Validator } from '../../interfaces';
import { useState, useEffect } from 'react';
import useNotification from '../../common/utils/notification';
import ErrorMessage from '../../common/components/ErrorMessage';
import { ReportRounded } from '@mui/icons-material';
import ValidatorCard, { ValidatorSkeleton } from './validatorCard';

export default function AllValidators({
  searchValue,
}: {
  searchValue: string;
}) {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [areValidatorsLoading, setAreValidatorsLoading] =
    useState<boolean>(false);
  const [validatorsNotif, setValidatorsNotif] = useState<useNotification>();

  const loadValidators = () => {
    setAreValidatorsLoading(true);
    const notif = new useNotification();
    if (validatorsNotif) {
      validatorsNotif.dismiss();
    }
    setValidatorsNotif(notif);
    setTimeout(() => {
      //TODO: call api here to load validators
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        const newValidators: Validator[] = [
          {
            apy: 20,
            image_ref:
              'https://img.bitscoins.net/v7/www.bitscoins.net/wp-content/uploads/2021/06/NFT-Marketplace-Rarible-Raises-Over-14-Million-Plans-to-Launch.jpg',
            nft_share: 20,
            total_requested_stake: 4000,
            validator_name: 'Lane.SOL',
            validator_website: 'https://make.com',
            vote_account_id: '5Jkv2mQeoBDhByhgVamWJZEnWd8JkvCb1EhaStMYFEP',
          },
        ];
        setValidators(newValidators);
        setAreValidatorsLoading(false);
        notif.dismiss();
        setValidatorsNotif(undefined);
      } else {
        notif.notify({
          render: 'Loading validators...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadValidators}
              notification={notif}
              //TODO: message should come from backend
              message={'There was an error loading validators. please retry!!!'}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const [displayValidators, setDisplayValidators] = useState<Validator[]>([]);

  useEffect(() => {
    if (searchValue === '') setDisplayValidators(validators);
    else
      setDisplayValidators(
        validators.filter(({ validator_name, vote_account_id }) => {
          return (
            validator_name.includes(searchValue) ||
            vote_account_id?.includes(searchValue)
          );
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, validators]);

  useEffect(() => {
    loadValidators();
    return () => {
      //TODO: CLEANUP FETCH ABOVE
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return areValidatorsLoading ? (
    <Box
      sx={{
        display: 'grid',
        justifyItems: 'start',
        justifyContent: 'center',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 300px))',
        columnGap: '53px',
        rowGap: '20px',
      }}
    >
      {[...new Array(10)].map((_, index) => (
        <ValidatorSkeleton key={index} />
      ))}
    </Box>
  ) : displayValidators.length === 0 ? (
    <Typography variant="h6" sx={{ textAlign: 'center' }}>
      {validators.length > 0
        ? 'No validators match search value'
        : 'No validators available yet'}
    </Typography>
  ) : (
    <Box
      sx={{
        display: 'grid',
        justifyItems: 'start',
        justifyContent: 'center',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 300px))',
        columnGap: '53px',
        rowGap: '20px',
      }}
    >
      {displayValidators.map((validator, index) => (
        <ValidatorCard
          validator={validator}
          key={index}
          searchValue={searchValue}
        />
      ))}
    </Box>
  );
}
