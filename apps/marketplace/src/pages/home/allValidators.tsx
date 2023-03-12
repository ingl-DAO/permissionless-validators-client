import { ReportRounded } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useMemo, useState } from 'react';
import ErrorMessage from '../../common/components/ErrorMessage';
import useNotification from '../../common/utils/notification';
import { Validator } from '../../interfaces';
import { ValidatorService } from '../../services/validator.service';
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

  const walletContext = useWallet();
  const { connection } = useConnection();
  const validatorService = useMemo(
    () => new ValidatorService(connection, walletContext),
    [connection, walletContext]
  );

  const loadValidators = () => {
    setAreValidatorsLoading(true);
    const notif = new useNotification();
    if (validatorsNotif) {
      validatorsNotif.dismiss();
    }
    setValidatorsNotif(notif);
    validatorService
      .loadValidators()
      .then((validators) => {
        setValidators(
          validators.filter((validator) => !validator.buyer_public_key) // filter already bought validators
        );
        setAreValidatorsLoading(false);
        notif.dismiss();
        setValidatorsNotif(undefined);
      })
      .catch((error) => {
        notif.notify({
          render: 'Loading validators...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadValidators}
              notification={notif}
              message={
                error?.message ||
                'There was an error loading validators. please retry!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
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
        : 'No validators on sale yet'}
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
