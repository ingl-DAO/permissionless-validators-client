import {
  ArrowBackIosNewOutlined,
  CheckOutlined,
  ContentCopyRounded,
  ErrorOutlineOutlined,
  HistoryToggleOffOutlined,
  ReportRounded,
  ThumbUpOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import ErrorMessage from '../../common/components/ErrorMessage';
import useNotification from '../../common/utils/notification';
import random from '../../common/utils/random';
import ConfirmDialog from '../../components/confirmDialog';
import { ValidatorDetails } from '../../interfaces';
import { ValidatorService } from '../../services/validator.service';
import theme from '../../theme/theme';
import ValidatorCardContent from '../home/validatorCardContent';
import Graph from './graph';

function SectionDelimiter({ title }: { title: string }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto auto 1fr',
        columnGap: 0.5,
        alignItems: 'center',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: '#D5F2E3',
          fontWeight: '300',
        }}
      >
        {title}
      </Typography>
      <ErrorOutlineOutlined fontSize="small" sx={{ color: '#D5F2E3' }} />
      <Divider sx={{ backgroundColor: '#D5F2E3' }} />
    </Box>
  );
}

export default function ValidatorDetailsPage() {
  const { program_id } = useParams();
  const { formatNumber, formatDate } = useIntl();
  const navigate = useNavigate();
  const wallet = useWallet();
  const publicKey = wallet.publicKey;

  const [validatorDetails, setValidatorDetails] = useState<ValidatorDetails>();
  const [validatorNotif, setValidatorNotif] = useState<useNotification>();
  const [areDetailsLoading, setAreDetailsLoading] = useState<boolean>(false);

  const walletContext = useWallet();
  const { connection } = useConnection();
  const validatorService = useMemo(
    () => new ValidatorService(connection, walletContext),
    [connection, walletContext]
  );

  const handleOnClick = (type: 'open' | 'copy', content: string) => {
    if (type === 'open') {
      navigate(`/${program_id}`);
    } else {
      if (validatorNotif) validatorNotif.dismiss();
      const notif = new useNotification();
      notif.notify({
        render: 'Copying to clipboard...',
      });
      notif.update({
        render: 'Copied to clipboard',
        type: 'SUCCESS',
        autoClose: 2000,
      });
      setValidatorNotif(notif);
      navigator.clipboard.writeText(content);
    }
  };

  function loadValidatorDetails(program_id: string) {
    setAreDetailsLoading(true);
    const notif = new useNotification();
    if (validatorNotif) {
      validatorNotif.dismiss();
    }
    setValidatorNotif(notif);
    validatorService
      .loadValidatorDetails(new PublicKey(program_id))
      .then((validator) => {
        setValidatorDetails(validator);
        setAreDetailsLoading(false);
        notif.dismiss();
        setValidatorNotif(undefined);
      })
      .catch((error) => {
        notif.notify({
          render: 'Loading validator details...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadValidatorDetails(program_id)}
              notification={notif}
              message={
                error?.message ||
                'Something went wrong while loading validator details. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  }

  useEffect(() => {
    loadValidatorDetails(program_id as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeSecondaryItemIndex, setActiveSecondaryItemIndex] =
    useState<number>();
  const [isConsolidateItemDialogOpen, setIsConsolidateItemDialogOpen] =
    useState<boolean>(false);
  const [isConfirmClaimRewardsDialogOpen, setIsConfirmClaimRewardsDialogOpen] =
    useState<boolean>(false);
  const [isConfirmBuyDialogOpen, setIsConfirmBuyDialogOpen] =
    useState<boolean>(false);
  const [isConfirmDelistDialogOpen, setIsConfirmDelistDialogOpen] =
    useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionNotif, setSubmissionNotif] = useState<useNotification>();

  const buyValidator = (program_id: string, buyer_public_key: string) => {
    setIsSubmitting(true);
    const notif = new useNotification();
    if (submissionNotif) {
      submissionNotif.dismiss();
    }
    setSubmissionNotif(notif);
    notif.notify({
      render: `Completing buy validator transaction...`,
    });
    validatorService
      .buyValidator(new PublicKey(program_id))
      .then((transactionID) => {
        setIsSubmitting(false);
        //TODO: update validator details' secondary item to suit new change as show below
        if (validatorDetails)
          setValidatorDetails({ ...validatorDetails, buyer_public_key });
        notif.update({
          render: 'Successfully acquired validator',
        });
        setSubmissionNotif(undefined);
      })
      .catch((error) => {
        setIsSubmitting(false);
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => buyValidator(program_id, buyer_public_key)}
              notification={notif}
              message={
                error.message ||
                'Something went wrong while buying validator. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const delistValidator = (program_id: string) => {
    setIsSubmitting(true);
    const notif = new useNotification();
    if (submissionNotif) {
      submissionNotif.dismiss();
    }
    setSubmissionNotif(notif);
    notif.notify({
      render: `Delisting validator from Ingl Markets...`,
    });
    validatorService
      .delistValidator(new PublicKey(program_id))
      .then((transactionId) => {
        setIsSubmitting(false);
        navigate('/');
        notif.update({
          render: 'Successfully delisted validator from Ingl Markets!',
        });
        setSubmissionNotif(undefined);
      })
      .catch((error) => {
        setIsSubmitting(false);
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => delistValidator(program_id)}
              notification={notif}
              message={
                error?.message ||
                'Something went wrong while delisting your validator. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const claimRewards = (program_id: string) => {
    setIsSubmitting(true);
    const notif = new useNotification();
    if (submissionNotif) {
      submissionNotif.dismiss();
    }
    setSubmissionNotif(notif);
    notif.notify({
      render: `Claiming your rewards...`,
    });
    //TODO: CALL API HERE TO claim rewards
    validatorService
      .withdrawRewards(new PublicKey(program_id))
      .then((transactionId) => {
        setIsSubmitting(false);
        if (validatorDetails)
          setValidatorDetails({
            ...validatorDetails,
            total_validator_rewards: 0,
          });
        notif.update({
          render: 'Claimed rewards successfully!',
        });
        setSubmissionNotif(undefined);
      })
      .catch((error) => {
        setIsSubmitting(false);
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => claimRewards(program_id)}
              notification={notif}
              message={
                error?.message ||
                'Something went wrong while claiming your rewards. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const consolidateItem = (itemIndex: number) => {
    setIsSubmitting(true);
    const notif = new useNotification();
    if (submissionNotif) {
      submissionNotif.dismiss();
    }
    setSubmissionNotif(notif);
    notif.notify({
      render: `Consolidating reception of secondary item`,
    });

    validatorService
      .validateSecondaryItemTransfer(
        itemIndex,
        new PublicKey(program_id as string)
      )
      .then((transactionId) => {
        setIsSubmitting(false);
        if (validatorDetails) {
          const secondary_items = validatorDetails.secondary_items.map(
            (item, index) => {
              return index !== itemIndex
                ? item
                : { ...item, date_validated: new Date().getTime() };
            }
          );
          setValidatorDetails({ ...validatorDetails, secondary_items });
        }
        notif.update({
          render: 'Secondary item consolidated successfully',
        });
        setSubmissionNotif(undefined);
      })
      .catch((error) => {
        setIsSubmitting(false);
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => consolidateItem(itemIndex)}
              notification={notif}
              message={
                error?.message ||
                'Something went wrong while consolidating select item. Please try again!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const isDisabled = !validatorDetails || areDetailsLoading;

  return (
    <>
      <ConfirmDialog
        isDialogOpen={isConsolidateItemDialogOpen}
        closeDialog={() => {
          setIsConsolidateItemDialogOpen(false);
          setActiveSecondaryItemIndex(undefined);
        }}
        confirm={() =>
          activeSecondaryItemIndex !== undefined &&
          activeSecondaryItemIndex >= 0
            ? consolidateItem(activeSecondaryItemIndex)
            : alert('Item must be selected')
        }
        dialogMessage={`Confirming this dialog means you validate reception of secondary item "${
          validatorDetails
            ? validatorDetails.secondary_items[activeSecondaryItemIndex ?? 0]
                ?.name
            : 'no item selected'
        }". Note that this action is irreversible. Are you sure you want to continue?`}
        confirmButton="Consolidate"
        dialogTitle="Confirm Consolidation of Secondary Item !"
      />
      <ConfirmDialog
        isDialogOpen={isConfirmClaimRewardsDialogOpen}
        closeDialog={() => setIsConfirmClaimRewardsDialogOpen(false)}
        confirm={() =>
          program_id
            ? claimRewards(program_id)
            : alert('Program_id needed to complete transaction')
        }
        dialogMessage={`You are about to claim "${formatNumber(
          validatorDetails ? validatorDetails.total_validator_rewards : 0,
          {
            style: 'currency',
            currency: 'SOL',
          }
        )}" in validator rewards. Do you want to continue?`}
        confirmButton="Claim"
        dialogTitle="Confirm Claim Validator Rewards !"
      />
      <ConfirmDialog
        isDialogOpen={isConfirmBuyDialogOpen}
        closeDialog={() => setIsConfirmBuyDialogOpen(false)}
        confirm={() =>
          publicKey && program_id
            ? buyValidator(program_id, publicKey.toBase58())
            : alert(
                'User public key and program_id must be know for this transaction'
              )
        }
        dialogMessage={`Buying this validator will cost you "${formatNumber(
          validatorDetails
            ? validatorDetails.price +
                validatorDetails.secondary_items.reduce(
                  (total, { price }) => total + price,
                  0
                )
            : 0,
          {
            style: 'currency',
            currency: 'SOL',
          }
        )}". Are you sure you want to proceed with the transaction?`}
        confirmButton="Buy Now"
        dialogTitle="Confirm Buy Validator !"
      />
      <ConfirmDialog
        isDialogOpen={isConfirmDelistDialogOpen}
        closeDialog={() => setIsConfirmDelistDialogOpen(false)}
        confirm={() =>
          program_id
            ? delistValidator(program_id)
            : alert('progam_id required for this transaction')
        }
        dialogMessage={`Are you sure you want to delist this validator? Not that it will no longer appear in the list of buyable validaors`}
        confirmButton="Delist"
        dialogTitle="Confirm Delist Validator !"
      />
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
              height: '100%',
            }}
          >
            <Box>
              <Box sx={{ display: 'grid', rowGap: 3 }}>
                {validatorDetails ? (
                  <img
                    src={validatorDetails.validator_logo_url}
                    alt="validator logo"
                    width={300}
                    height={300}
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
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
                )}
                <Box sx={{ display: 'grid', rowGap: 2 }}>
                  <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <ValidatorCardContent
                      skeleton={isDisabled}
                      title={'Validator ID'}
                      value={
                        validatorDetails ? validatorDetails.validator_id : ''
                      }
                    />{' '}
                    &nbsp; &nbsp;
                    <label
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOnClick(
                          'copy',
                          validatorDetails?.validator_id as string
                        );
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
                  <ValidatorCardContent
                    skeleton={isDisabled}
                    title={
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.error.main,
                          fontWeight: '300',
                        }}
                      >
                        Total SOLS Staked
                      </Typography>
                    }
                    value={
                      validatorDetails
                        ? formatNumber(validatorDetails.total_stake, {
                            style: 'currency',
                            currency: 'SOL',
                          })
                        : ''
                    }
                  />
                </Box>
              </Box>
            </Box>
            <Scrollbars autoHide>
              <Box>
                <Box sx={{ display: 'grid', rowGap: 3 }}>
                  <Box sx={{ display: 'grid', rowGap: 3 }}>
                    <ValidatorCardContent
                      title="Name"
                      value={
                        validatorDetails ? validatorDetails.validator_name : ''
                      }
                      skeleton={isDisabled}
                    />
                    <Box>
                      <ValidatorCardContent
                        title="Description"
                        value={
                          validatorDetails ? validatorDetails.description : ''
                        }
                        skeleton={isDisabled}
                      />
                      {isDisabled && (
                        <>
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
                        </>
                      )}
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <ValidatorCardContent
                        title="Vote Account ID"
                        value={
                          validatorDetails
                            ? validatorDetails.vote_account_id
                            : ''
                        }
                        skeleton={isDisabled}
                      />
                      &nbsp; &nbsp;
                      <label
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOnClick(
                            'copy',
                            validatorDetails?.vote_account_id as string
                          );
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
                    <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <ValidatorCardContent
                        title="Authorized withdrawer ID (Seller)"
                        value={
                          validatorDetails
                            ? validatorDetails.seller_public_key
                            : ''
                        }
                        skeleton={isDisabled}
                      />
                      &nbsp; &nbsp;
                      <label
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOnClick(
                            'copy',
                            validatorDetails?.seller_public_key as string
                          );
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
                    <ValidatorCardContent
                      title="Cost of validator"
                      value={
                        validatorDetails
                          ? formatNumber(validatorDetails.price, {
                              style: 'currency',
                              currency: 'SOL',
                            })
                          : ''
                      }
                      skeleton={isDisabled}
                    />
                  </Box>
                  <Box sx={{ display: 'grid', rowGap: 3 }}>
                    <SectionDelimiter title="Validator activity" />
                    <ValidatorCardContent
                      title="Age of the validator"
                      value={
                        validatorDetails
                          ? `First activity on epoch ${validatorDetails.validator_initial_epoch}`
                          : ''
                      }
                      skeleton={isDisabled}
                    />
                    <ValidatorCardContent
                      title="Number of unique stakers"
                      value={
                        validatorDetails
                          ? `${formatNumber(
                              validatorDetails.number_of_unique_stakers
                            )} accounts`
                          : ''
                      }
                      skeleton={isDisabled}
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
                    <Graph
                      data={
                        validatorDetails
                          ? validatorDetails.stake_per_epochs
                          : []
                      }
                      isDataLoading={isDisabled}
                    />
                  </Box>
                  {validatorDetails &&
                    validatorDetails.secondary_items.length > 0 && (
                      <Box sx={{ display: 'grid', rowGap: 3 }}>
                        <SectionDelimiter title="Secondary items section" />
                        <ValidatorCardContent
                          title="Mediation Date"
                          value={formatDate(
                            new Date(validatorDetails.mediation_interval),
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        />
                        <Box sx={{ display: 'grid', rowGap: 1 }}>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto',
                              columnGap: 2,
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
                              Items
                            </Typography>
                            <Box
                              sx={{
                                display: 'grid',
                                gridAutoFlow: 'column',
                                columnGap: 1.5,
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
                                Total cost of secondary items:
                              </Typography>
                              <Typography variant="h6">
                                {formatNumber(
                                  validatorDetails.secondary_items.reduce(
                                    (total, { price }) => total + price,
                                    0
                                  ),
                                  {
                                    style: 'currency',
                                    currency: 'SOL',
                                  }
                                )}
                              </Typography>
                            </Box>
                          </Box>
                          {validatorDetails.secondary_items.map(
                            ({ description, name, price }, index) => (
                              <Box
                                key={index}
                                sx={{
                                  padding: '8px 16px',
                                  display: 'grid',
                                  gridTemplateColumns: '1fr auto',
                                  alignItems: 'center',
                                  columnGap: 2,
                                  backgroundColor: '#28293D',
                                  borderRadius: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    justifySelf: 'start',
                                    display: 'grid',
                                    gridAutoFlow: 'column',
                                    columnGap: 1,
                                    alignItems: 'center',
                                  }}
                                >
                                  <Typography>{name}</Typography>
                                  <Divider
                                    orientation="vertical"
                                    sx={{ backgroundColor: '#D5F2E3' }}
                                  />
                                  <Typography>{description}</Typography>
                                </Box>
                                <Typography variant="h6">
                                  {formatNumber(price, {
                                    style: 'currency',
                                    currency: 'SOL',
                                  })}
                                </Typography>
                              </Box>
                            )
                          )}
                        </Box>
                      </Box>
                    )}
                </Box>
              </Box>
            </Scrollbars>
            <Box>
              <Box sx={{ display: 'grid', rowGap: 3 }}>
                <Box sx={{ display: 'grid', rowGap: 2 }}>
                  <ValidatorCardContent
                    skeleton={isDisabled}
                    title={'Total Cost'}
                    value={
                      validatorDetails
                        ? formatNumber(
                            validatorDetails.price +
                              validatorDetails.secondary_items.reduce(
                                (total, { price }) => total + price,
                                0
                              ),
                            {
                              style: 'currency',
                              currency: 'SOL',
                            }
                          )
                        : ''
                    }
                  />
                  {publicKey && validatorDetails && (
                    <Button
                      disabled={
                        isDisabled ||
                        validatorDetails.buyer_public_key !== undefined ||
                        isSubmitting
                      }
                      variant="contained"
                      color="primary"
                      sx={{
                        '&:disabled': {
                          border: '1px solid #95535b',
                          color: '#95535b',
                        },
                      }}
                      onClick={() => {
                        validatorDetails.seller_public_key ===
                        publicKey.toBase58()
                          ? setIsConfirmDelistDialogOpen(true)
                          : setIsConfirmBuyDialogOpen(true);
                      }}
                    >
                      {validatorDetails.buyer_public_key
                        ? validatorDetails.seller_public_key ===
                          publicKey.toBase58()
                          ? 'Sold!'
                          : 'Bought!'
                        : validatorDetails.seller_public_key ===
                          publicKey.toBase58()
                        ? 'Delist'
                        : 'Buy Now'}
                    </Button>
                  )}
                </Box>
                {validatorDetails &&
                  validatorDetails.total_validator_rewards > 0 &&
                  (validatorDetails.buyer_public_key ===
                    publicKey?.toBase58() ||
                    (!validatorDetails.buyer_public_key &&
                      validatorDetails.seller_public_key ===
                        publicKey?.toBase58())) && (
                    <Box
                      sx={{
                        display: 'grid',
                        justifyItems: 'center',
                        rowGap: 3,
                      }}
                    >
                      <ValidatorCardContent
                        title="Rewards made"
                        value={formatNumber(
                          validatorDetails.total_validator_rewards,
                          {
                            style: 'currency',
                            currency: 'SOL',
                          }
                        )}
                      />
                      <Button
                        color="inherit"
                        sx={{
                          color: 'black',
                          ...theme.typography.h6,
                          textTransform: 'none',
                        }}
                        variant="contained"
                        disabled={isSubmitting}
                        onClick={() => setIsConfirmClaimRewardsDialogOpen(true)}
                      >
                        Claim my rewards
                      </Button>
                    </Box>
                  )}

                {validatorDetails &&
                  validatorDetails.secondary_items.length > 0 &&
                  validatorDetails.buyer_public_key && (
                    <Box sx={{ display: 'grid', rowGap: 1 }}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          columnGap: 2,
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
                          Items
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridAutoFlow: 'column',
                            columnGap: 1.5,
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
                            Total:
                          </Typography>
                          <Typography>
                            {formatNumber(
                              validatorDetails.secondary_items.reduce(
                                (total, { price }) => total + price,
                                0
                              ),
                              {
                                style: 'currency',
                                currency: 'SOL',
                              }
                            )}
                          </Typography>
                        </Box>
                      </Box>
                      {validatorDetails.secondary_items.map(
                        (
                          { description, name, price, date_validated: dv },
                          index
                        ) => (
                          <Box
                            key={index}
                            sx={{
                              padding: '8px 16px',
                              display: 'grid',
                              gridTemplateColumns: '1fr auto',
                              alignItems: 'center',
                              columnGap: 2,
                              backgroundColor: dv ? '#D5F2E3' : '#28293D',
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              sx={{
                                justifySelf: 'start',
                                display: 'grid',
                                gridAutoFlow: 'column',
                                columnGap: 1,
                                alignItems: 'center',
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: dv ? 'black' : 'white' }}
                              >
                                {name}
                              </Typography>
                              <Divider
                                orientation="vertical"
                                sx={{
                                  backgroundColor: dv ? 'black' : '#D5F2E3',
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: dv ? 'black' : 'white' }}
                              >
                                {description}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'grid',
                                gridAutoFlow: 'column',
                                alignItems: 'center',
                                columnGap: 2,
                              }}
                            >
                              <Typography
                                sx={{ color: dv ? 'black' : 'white' }}
                              >
                                {formatNumber(price, {
                                  style: 'currency',
                                  currency: 'SOL',
                                })}
                              </Typography>
                              {dv ? (
                                <CheckOutlined sx={{ color: 'black' }} />
                              ) : validatorDetails.buyer_public_key ===
                                publicKey?.toString() ? (
                                <Tooltip arrow title="Validate consolidation">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      backgroundColor: '#D5F2E3',
                                      transition: '0.2s',
                                      '&:hover': {
                                        backgroundColor: '#96AEA1',
                                        transition: '0.2s',
                                      },
                                    }}
                                    disabled={isSubmitting}
                                    onClick={() => {
                                      setActiveSecondaryItemIndex(index);
                                      setIsConsolidateItemDialogOpen(true);
                                    }}
                                  >
                                    <ThumbUpOutlined fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip
                                  arrow
                                  title="Wait for the buyer to validate the transfer of this secondary item"
                                >
                                  <HistoryToggleOffOutlined
                                    fontSize="small"
                                    color="inherit"
                                    sx={{ color: '#D5F2E3' }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        )
                      )}
                    </Box>
                  )}
              </Box>
            </Box>
          </Box>
        </Scrollbars>
      </Box>
    </>
  );
}
