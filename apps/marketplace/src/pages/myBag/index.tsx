import { ArrowBackIosNewOutlined, ReportRounded } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import ErrorMessage from '../../common/components/ErrorMessage';
import useNotification from '../../common/utils/notification';
import { Validator } from '../../interfaces';
import { ValidatorService } from '../../services/validator.service';
import ValidatorCard, { ValidatorSkeleton } from '../home/validatorCard';

export type MyBagUsage = 'Sales' | 'Purchases';

export default function MyBag({ usage }: { usage: MyBagUsage }) {
  const navigate = useNavigate();

  const wallet = useWallet();
  const { connection } = useConnection();
  const validatorService = useMemo(
    () => new ValidatorService(connection, wallet),
    [connection, wallet]
  );

  const [validators, setValidators] = useState<Validator[]>([]);
  const [validatorNotif, setValidatorNotif] = useState<useNotification>();
  const [areValidatorsLoading, setAreValidatorsLoading] =
    useState<boolean>(false);

  const loadValidators = () => {
    setAreValidatorsLoading(true);
    const notif = new useNotification();
    if (validatorNotif) {
      validatorNotif.dismiss();
    }
    setValidatorNotif(notif);
    validatorService
      .loadValidators()
      .then((validators) => {
        setValidators(
          validators.filter(
            (_) =>
              wallet.publicKey?.toBase58() ===
              (usage === 'Sales' ? _.seller_public_key : _.buyer_public_key)
          )
        );
        setAreValidatorsLoading(false);
        notif.dismiss();
        setValidatorNotif(undefined);
      })
      .catch((error) => {
        notif.notify({
          render: 'Loading your shopping cart...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadValidators()}
              notification={notif}
              message={
                error?.message ||
                'There was a problem loading your sales. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  useEffect(() => {
    loadValidators();

    return () => {
      //TODO: CLEANUP FETCH ABOVE
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ display: 'grid', height: '100%', gridTemplateRows: 'auto 1fr' }}>
      <Box sx={{ display: 'grid', rowGap: 1 }}>
        <Box
          onClick={() => navigate('/')}
          sx={{
            display: 'grid',
            justifyContent: 'start',
            gridAutoFlow: 'column',
            columnGap: 1,
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowBackIosNewOutlined sx={{ color: 'white' }} />
          <Typography variant="h6">Back</Typography>
        </Box>
        <Typography variant="h5">{`My ${usage}`}</Typography>
      </Box>

      {areValidatorsLoading ? (
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
      ) : validators.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          No validators to display
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
          {validators.map((validator, index) => (
            <ValidatorCard
              validator={validator}
              key={index}
              searchValue={''}
              chip={
                validator.secondary_items.find((_) => _.date_validated === null)
                  ? 'Ongoing'
                  : usage === 'Purchases'
                  ? 'Bought'
                  : 'Sold'
              }
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
