import {
  ArrowBackIosNewOutlined,
  ErrorOutlineOutlined,
  ReportRounded,
} from '@mui/icons-material';
import { Box, Button, Divider, Skeleton, Typography } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ErrorMessage from '../../common/components/ErrorMessage';
import useNotification from '../../common/utils/notification';
import random from '../../common/utils/random';
import { ValidatorDetails } from '../../interfaces';
import ValidatorCardContent from '../home/validatorCardContent';

export default function ValidatorDetailsPage() {
  const { program_id } = useParams();
  const navigate = useNavigate();

  const [validatorDetails, setValidatorDetails] = useState<ValidatorDetails>();
  const [validatorNotif, setValidatorNotif] = useState<useNotification>();
  const [areDetailsLoading, setAreDetailsLoading] = useState<boolean>(false);

  function loadValidatorDetails(program_id: string) {
    setAreDetailsLoading(true);
    const notif = new useNotification();
    if (validatorNotif) {
      validatorNotif.dismiss();
    }
    setValidatorNotif(notif);
    setTimeout(() => {
      //TODO: CALL API HERE TO LOAD submissionsAnswers
      // eslint-disable-next-line no-constant-condition
      if (5 > 4) {
        const newDetails: ValidatorDetails = {
          description: 'Testing things massa',
          mediatable_date: new Date().getTime(),
          number_of_unique_stakers: 20,
          price: 2000,
          program_id: 'make things happen',
          secondary_items: [],
          seller_public_key: 'this is it',
          stake_per_epochs: [],
          total_stake: 2000,
          total_validator_rewards: 2000,
          validator_id: 'validator_id_is_all_we_need_to_exist',
          validator_initial_epoch: 2,
          validator_logo_url: '/assets/full_logo.png',
          validator_name: 'Laine.SOL',
          vote_account_id: 'vote_account_id_is_it',
        };
        setValidatorDetails(newDetails);
        setAreDetailsLoading(false);
        notif.dismiss();
        setValidatorNotif(undefined);
      } else {
        notif.notify({
          render: 'Loading validator details...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadValidatorDetails(program_id)}
              notification={notif}
              //TODO: message should come from backend
              message="Something went wrong while loading validator details. Please try again!!!"
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        rowGap: 2,
      }}
    >
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
        <Typography variant="h5">Validator Details</Typography>
      </Box>
      <Scrollbars autoHide>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            columnGap: 2,
          }}
        >
          <Box>
            {!validatorDetails ? (
              <Box sx={{ display: 'grid', rowGap: 3 }}>
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  height={300}
                  width={300}
                  sx={{
                    backgroundColor: 'rgb(137 127 127 / 43%)',
                    borderRadius: '10px',
                  }}
                />
                <Box sx={{ display: 'grid', rowGap: 2 }}>
                  <ValidatorCardContent
                    skeleton
                    title={'Validator ID'}
                    value=""
                  />
                  <ValidatorCardContent
                    skeleton
                    title={'Total SOLS Staked'}
                    value=""
                  />
                </Box>
              </Box>
            ) : (
              <Typography>Image section</Typography>
            )}
          </Box>
          <Box>
            {!validatorDetails ? (
              <Box sx={{ display: 'grid', rowGap: 3 }}>
                <Box sx={{ display: 'grid', rowGap: 3 }}>
                  <ValidatorCardContent title="Name" value="" skeleton />
                  <Box>
                    <ValidatorCardContent
                      title="Description"
                      value=""
                      skeleton
                    />
                    <Skeleton
                      animation="wave"
                      width={`${100}%`}
                      sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                    />
                    <Skeleton
                      animation="wave"
                      width={`${random() * 10}%`}
                      sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                    />
                  </Box>
                  <ValidatorCardContent
                    title="Vote Account ID"
                    value=""
                    skeleton
                  />
                  <ValidatorCardContent
                    title="Authorized withdrawer ID"
                    value=""
                    skeleton
                  />
                  <ValidatorCardContent
                    title="Cost of validator"
                    value=""
                    skeleton
                  />
                </Box>
                <Box sx={{ display: 'grid', rowGap: 3 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'auto auto 1fr',
                      columnGap: 0.5,
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontWeight: '300',
                      }}
                    >
                      Validator Activity
                    </Typography>
                    <ErrorOutlineOutlined
                      fontSize="small"
                      sx={{ color: '#D5F2E3' }}
                    />
                    <Divider sx={{ backgroundColor: '#D5F2E3' }} />
                  </Box>
                  <ValidatorCardContent
                    title="Age of the validator"
                    value=""
                    skeleton
                  />
                  <ValidatorCardContent
                    title="Number of unique stakers"
                    value=""
                    skeleton
                  />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: '300',
                    }}
                  >
                    Stake growth over time
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridAutoFlow: 'column',
                      columnGap: 2,
                      alignItems: 'end',
                      borderBottom: '2px solid grey',
                      borderLeft: '2px solid grey',
                      paddingLeft: 2,
                    }}
                  >
                    {[...new Array(30)].map(() => (
                      <Skeleton
                        animation="wave"
                        height={`${random() * 20}px`}
                        sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography>Details section</Typography>
            )}
          </Box>
          <Box>
            {!validatorDetails ? (
              <Box sx={{ display: 'grid', rowGap: 3 }}>
                <Box sx={{ display: 'grid', rowGap: 2 }}>
                  <ValidatorCardContent
                    skeleton
                    title={'Total Cost'}
                    value=""
                  />
                  <Button
                    disabled
                    variant="contained"
                    color="primary"
                    sx={{
                      '&:disabled': {
                        backgroundColor: '#95535b',
                        color: '#282525',
                      },
                    }}
                  >
                    Transact Now
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography>buying section</Typography>
            )}
          </Box>
        </Box>
      </Scrollbars>
    </Box>
  );
}
