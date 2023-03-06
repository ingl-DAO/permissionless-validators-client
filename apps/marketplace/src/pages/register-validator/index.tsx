import { ArrowBackIosNewOutlined, ReportRounded } from '@mui/icons-material';
import { Avatar, Box, TextField, Typography } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import CopyTransactionId from '../../common/components/copyTransactionId';
import ErrorMessage from '../../common/components/ErrorMessage';
import useNotification from '../../common/utils/notification';
import MoreValidatorInformation, {
  MoreValidatorInfo,
} from '../../components/register-validator/moreValidatorInformation';
import SecondaryItems, {
  DevValidatorSecondaryItem,
} from '../../components/register-validator/secondaryItems';
import ValidatorInformation, {
  ValidatorInfo,
} from '../../components/register-validator/validatorInformation';
import { ValidatorListing, ValidatorSecondaryItem } from '../../interfaces';
import { ValidatorService } from '../../services/validator.service';
import theme from '../../theme/theme';
import ValidatorCardContent from '../home/validatorCardContent';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [validatorImageUrl, setValidatorImageUrl] = useState<string>('');
  const [validatorInfo, setValidatorInfo] = useState<ValidatorInfo>();
  const [moreValidatorInfo, setMoreValidatorInfo] =
    useState<MoreValidatorInfo>();
  const [secondaryItems, setSecondaryItems] = useState<
    DevValidatorSecondaryItem[]
  >([]);
  const [mediatableDate, setMediatableDate] = useState(new Date());

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionNotif, setSubmissionNotif] = useState<useNotification>();

  const walletContext = useWallet();
  const { connection } = useConnection();
  const validatorService = useMemo(
    () => new ValidatorService(connection, walletContext),
    [connection, walletContext]
  );

  function listValidator(val: ValidatorListing) {
    setIsSubmitting(true);
    const notif = new useNotification();
    if (submissionNotif) {
      submissionNotif.dismiss();
    }
    setSubmissionNotif(notif);
    notif.notify({
      render: 'Listing validator',
    });
    validatorService
      .listValidator(val)
      .then((signature) => {
        setIsSubmitting(false);
        notif.update({
          render: (
            <CopyTransactionId
              transaction_id={signature}
              message="Validator listed successfully"
            />
          ),
        });
        setSubmissionNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => listValidator(val)}
              notification={notif}
              message={
                error?.message ||
                'Something happened when listing the validator. Please try again!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  }

  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(4),
        height: '100%',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <Box sx={{ display: 'grid', rowGap: theme.spacing(1) }}>
        <Box
          onClick={() => navigate('/validators')}
          sx={{
            display: 'grid',
            justifyContent: 'start',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(1),
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowBackIosNewOutlined sx={{ color: 'white' }} />
          <Typography variant="h6">Back</Typography>
        </Box>
        <Typography variant="h5">Validator Listing</Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          columnGap: 12,
          gridTemplateColumns: {
            mobile: 'auto',
            laptop: '1fr auto',
          },
          '&>img': {
            display: {
              mobile: 'none',
              laptop: 'initial',
            },
          },
        }}
      >
        {step === 1 ? (
          <ValidatorInformation
            onNext={(val: ValidatorInfo) => {
              setValidatorInfo(val);
              setStep(2);
            }}
            isCreating={false}
            onPrev={(val: ValidatorInfo) => setValidatorInfo(val)}
            validatorInfo={validatorInfo}
          />
        ) : step === 2 ? (
          <MoreValidatorInformation
            handleSubmit={(val: MoreValidatorInfo) => {
              if (validatorInfo)
                listValidator({
                  mediatable_date: mediatableDate.getTime(),
                  price: validatorInfo.price,
                  description: val.description,
                  validator_logo_url: validatorImageUrl,
                  validator_name: validatorInfo.validator_name,
                  vote_account_id: validatorInfo.vote_account_id,
                  secondary_items: [],
                });
            }}
            onNext={(val: MoreValidatorInfo) => {
              setMoreValidatorInfo(val);
              setStep(3);
            }}
            moreValidatorInfo={moreValidatorInfo}
            onPrev={(val: MoreValidatorInfo) => {
              setMoreValidatorInfo(val);
              setStep(1);
            }}
            isCreating={isSubmitting}
          />
        ) : (
          <SecondaryItems
            mediatableDate={mediatableDate}
            disabled={isSubmitting}
            secondaryItems={secondaryItems}
            setMediatableDate={setMediatableDate}
            handleSubmit={(val: DevValidatorSecondaryItem[]) => {
              const data: ValidatorSecondaryItem[] = val.map((item) => {
                const { description, name, price } = item;
                return {
                  description,
                  name,
                  price,
                };
              });
              if (validatorInfo && moreValidatorInfo)
                listValidator({
                  mediatable_date: mediatableDate.getTime(),
                  price: validatorInfo.price,
                  description: moreValidatorInfo.description,
                  validator_logo_url: validatorImageUrl,
                  validator_name: validatorInfo.validator_name,
                  vote_account_id: validatorInfo.vote_account_id,
                  secondary_items:
                    moreValidatorInfo.can_transfer_secondary_items ? data : [],
                });
            }}
            onPrev={(val: DevValidatorSecondaryItem[]) => {
              setSecondaryItems(val);
              setStep(2);
            }}
          />
        )}
        <Box
          sx={{
            display: 'grid',
            justifyItems: 'center',
            rowGap: 2,
            alignContent: 'center',
          }}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.light,
              height: '250px',
              width: '250px',
              justifySelf: 'center',
              alignSelf: 'center',
              border: '1.5px solid white',
            }}
            alt="Validator Avatar"
            src={validatorImageUrl}
          />
          <Box sx={{ display: 'grid', justifyItems: 'center' }}>
            <ValidatorCardContent
              title={step === 1 ? 'Enter your logo url' : ''}
              value={'Validator Image'}
              revert
            />
            {step === 1 && (
              <TextField
                size="small"
                fullWidth
                placeholder="https://image_ref.tld"
                onChange={(event) => setValidatorImageUrl(event.target.value)}
                value={validatorImageUrl}
                sx={{
                  '& input, & div': {
                    backgroundColor: theme.common.inputBackground,
                    color: 'white',
                    '&::placeholder': {
                      color: 'white',
                    },
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
