import { ArrowBackIosNewOutlined, ReportRounded } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import ErrorMessage from '../../common/components/ErrorMessage';
import useNotification from '../../common/utils/notification';
import { Validator } from '../../interfaces';
import ValidatorCard, { ValidatorSkeleton } from '../home/validatorCard';

export type MyBagUsage = 'Sales' | 'Purchases';

export default function MyBag({ usage }: { usage: MyBagUsage }) {
  const navigate = useNavigate();

  const wallet = useWallet();

  const [validators, setValidators] = useState<Validator[]>([]);
  const [validatorNotif, setValidatorNotif] = useState<useNotification>();
  const [areValidatorsLoading, setAreValidatorsLoading] =
    useState<boolean>(false);

  const loadValidators = (usage: MyBagUsage) => {
    setAreValidatorsLoading(true);
    const notif = new useNotification();
    if (validatorNotif) {
      validatorNotif.dismiss();
    }
    setValidatorNotif(notif);
    if (usage === 'Sales') {
      setTimeout(() => {
        //TODO: CALL API HERE TO LOAD my sales
        // eslint-disable-next-line no-constant-condition
        if (5 > 4) {
          const newValidators: Validator[] = [
            {
              number_of_unique_stakers: 2,
              price: 2,
              program_id: 'soeisl',
              secondary_items: [],
              seller_public_key: 'sielsiel',
              total_stake: 2,
              validator_logo_url: '/assets/logo.png',
              validator_name: 'Laine.SOL',
              vote_account_id: 'wieols',
              buyer_public_key: 'siels',
            },
          ];
          setValidators(newValidators);
          setAreValidatorsLoading(false);
          notif.dismiss();
          setValidatorNotif(undefined);
        } else {
          notif.notify({
            render: 'Loading your sales',
          });
          notif.update({
            type: 'ERROR',
            render: (
              <ErrorMessage
                retryFunction={() => loadValidators(usage)}
                notification={notif}
                //TODO: message should come from backend
                message="There was a problem loading your sales. Please try again!!!"
              />
            ),
            autoClose: false,
            icon: () => <ReportRounded fontSize="medium" color="error" />,
          });
        }
      }, 3000);
    } else {
      setTimeout(() => {
        //TODO: CALL API HERE TO LOAD my purchases
        // eslint-disable-next-line no-constant-condition
        if (5 > 4) {
          const newValidators: Validator[] = [];
          setValidators(newValidators);
          setAreValidatorsLoading(false);
          notif.dismiss();
          setValidatorNotif(undefined);
        } else {
          notif.notify({
            render: 'Loading your purchases',
          });
          notif.update({
            type: 'ERROR',
            render: (
              <ErrorMessage
                retryFunction={() => loadValidators(usage)}
                notification={notif}
                //TODO: message should come from backend
                message="There was a problem loading your purchases. Please try again!!!"
              />
            ),
            autoClose: false,
            icon: () => <ReportRounded fontSize="medium" color="error" />,
          });
        }
      }, 3000);
    }
  };

  const [displayValidators, setDisplayValidators] = useState<Validator[]>([]);

  useEffect(() => {
    const publicKey = wallet.publicKey;
    if (!publicKey) {
      setDisplayValidators([]);
    } else {
      switch (usage) {
        case 'Purchases': {
          setDisplayValidators(
            validators.filter(
              (_) => _.buyer_public_key === publicKey.toBase58()
            )
          );
          break;
        }
        case 'Sales': {
          setDisplayValidators(
            validators.filter(
              (_) => _.seller_public_key === publicKey.toBase58()
            )
          );
          //TODO: REMOVE THIS LINE. USED ONLY FOR DEV PURPOSES
          setDisplayValidators(validators);
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validators]);

  useEffect(() => {
    loadValidators(usage);

    return () => {
      //TODO: CLEANUP FETCH ABOVE
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ display: 'grid', height: '100%', gridTemplateRows: 'auto 1fr' }}>
      <Box sx={{ display: 'grid', rowGap: 1 }}>
        <Box
          onClick={() => navigate('/validators')}
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
      ) : displayValidators.length === 0 ? (
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
          {displayValidators.map((validator, index) => (
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
