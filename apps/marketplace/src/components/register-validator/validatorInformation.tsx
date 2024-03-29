import { Box, Button, Typography } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useFormik } from 'formik';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import theme from '../../theme/theme';
import BareCustomInput from './bareCustomInput';
import { CustomInput } from './moreValidatorInformation';

export interface ValidatorInfo {
  validator_name: string;
  vote_account_id: string;
  price: number;
}

export default function ValidatorInformation({
  onPrev,
  onNext,
  validatorInfo,
  isCreating,
  validatorImageUrl,
}: {
  onPrev: (val: ValidatorInfo) => void;
  onNext: (val: ValidatorInfo) => void;
  validatorInfo?: ValidatorInfo;
  validatorImageUrl?: string;
  isCreating: boolean;
}) {
  const initialValues: ValidatorInfo = validatorInfo ?? {
    price: 0,
    validator_name: '',
    vote_account_id: '',
  };

  const validationSchema = Yup.object().shape({
    validator_name: Yup.string().required('required'),
    vote_account_id: Yup.string().required('required'),
    price: Yup.number().required('required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      onNext(values);
      resetForm();
    },
  });

  const [programData, setProgramData] = useState<
    | {
        validator_id: string;
        authorized_withdrawer_id: string;
      }
    | undefined
  >();
  const wallet = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    const voteAccountKey =
      formik.values.vote_account_id ||
      (validatorInfo && validatorInfo.vote_account_id);
    if (
      voteAccountKey &&
      (formik.values.vote_account_id.length > 32 ||
        (validatorInfo && validatorInfo.vote_account_id.length > 32))
    ) {
      try {
        connection
          .getAccountInfo(new PublicKey(voteAccountKey))
          .then((voteAccountInfo) => {
            if (voteAccountInfo) {
              //The first four bytes are used to represent the vote account version
              const accountData = Uint8Array.from(voteAccountInfo.data);
              const vallidatorId = new PublicKey(
                accountData.slice(4, 36)
              ).toBase58();

              const authorizedWithdrawer = new PublicKey(
                accountData.slice(36, 68)
              ).toBase58();
              if (wallet.publicKey?.toBase58() === authorizedWithdrawer)
                setProgramData({
                  validator_id: vallidatorId,
                  authorized_withdrawer_id: wallet.publicKey.toBase58(),
                });
              else {
                setProgramData(undefined);
                toast.error(
                  "Vote account authorized withdrawer doesn't match with wallet pubkey"
                );
              }
            } else toast.error('Invalid vote account ID.');
          })
          .catch((error) => formik.setFieldError('vote_account_id', error));
      } catch (error) {
        toast.error('Invalid pubkey !!!');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.vote_account_id, validatorInfo?.vote_account_id]);

  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(4),
        height: '100%',
        gridTemplateRows: 'auto 1fr',
      }}
      component="form"
      onSubmit={formik.handleSubmit}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          columnGap: theme.spacing(3),
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">Validator's information</Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: 2,
          }}
        >
          <Button
            variant="contained"
            color="inherit"
            disabled={true}
            onClick={() =>
              onPrev({
                price: formik.values.price,
                validator_name: formik.values.validator_name,
                vote_account_id: formik.values.vote_account_id,
              })
            }
          >
            Prev
          </Button>
          <Button
            variant="contained"
            color="inherit"
            type="submit"
            sx={{ color: 'black' }}
            disabled={isCreating || !programData || !validatorImageUrl}
          >
            Next
          </Button>
        </Box>
      </Box>
      <Scrollbars autoHide>
        <Box sx={{ display: 'grid', rowGap: theme.spacing(4) }}>
          {[
            {
              label: 'Validator name',
              description: 'What is the name of your validator ?',
              formikKey: 'validator_name',
            },
            {
              label: 'Vote account ID',
              description: 'Solana public key of the vote account🗝️',
              formikKey: 'vote_account_id',
            },
          ].map(({ description, formikKey, label }, index) => (
            <CustomInput
              formik={formik}
              formikKey={formikKey}
              label={label}
              subLabel={description}
              key={index}
              type={'string'}
            />
          ))}
          {programData &&
            (formik.values.vote_account_id.length === 44 ||
              (validatorInfo &&
                validatorInfo.vote_account_id.length === 44)) && (
              <Box
                sx={{
                  display: 'grid',
                  gridAutoFlow: 'column',
                  alignItems: 'center',
                  columnGap: 2,
                }}
              >
                {[
                  {
                    label: 'Validator ID',
                    description:
                      'Solana public key of the validator account🗝️ ',
                    programDataKey: 'validator_id',
                  },
                  {
                    label: 'Authorized withdrawer ID',
                    description: 'Id of the authorized withdrawer🗝️',
                    programDataKey: 'authorized_withdrawer_id',
                  },
                ].map(({ description, label, programDataKey }, index) => (
                  <BareCustomInput
                    key={index}
                    label={label}
                    subLabel={description}
                    type="string"
                    disabled
                    value={
                      programData[
                        programDataKey as
                          | 'validator_id'
                          | 'authorized_withdrawer_id'
                      ]
                    }
                  />
                ))}
              </Box>
            )}
          <CustomInput
            formik={formik}
            formikKey={'price'}
            label={'Cost (SOL)'}
            subLabel={'How much SOL do you want to sell your validator for ?'}
            type={'number'}
          />
        </Box>
      </Scrollbars>
    </Box>
  );
}
