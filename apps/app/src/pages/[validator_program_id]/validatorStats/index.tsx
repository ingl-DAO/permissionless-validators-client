import { GitHub, ReportRounded, Twitter } from '@mui/icons-material';
import { Box, Skeleton, Tooltip, Typography } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';
import ErrorMessage from '../../../common/components/ErrorMessage';
import useNotification from '../../../common/utils/notification';
import random from '../../../common/utils/random';
import StatCard from '../../../components/stats/statCard';
import ValidatorCardContent from '../../../components/validators/validatorCardContent';
import { InglValidator, VersionStatus } from '../../../interfaces';
import { ValidatorService } from '../../../services/validator.service';
import theme from '../../../theme/theme';

export default function ValidatorStats() {
  const { validator_program_id } = useParams();

  const [areDetailsLoading, setAreDetailsLoading] = useState<boolean>(false);
  const [details, setDetails] = useState<InglValidator>();
  const [detailNotif, setDetailNotif] = useState<useNotification>();

  const { connection } = useConnection();
  const validatorService = useMemo(
    () => new ValidatorService(connection),
    [connection]
  );

  const loadDetails = async (validator_program_id: string) => {
    setAreDetailsLoading(true);
    const notif = new useNotification();
    if (detailNotif) {
      detailNotif.dismiss();
    }
    setDetailNotif(notif);

    notif.notify({
      render: 'Loading validator details...',
    });
    validatorService
      .loadValidatorStats(new PublicKey(validator_program_id))
      .then((validatorInfo) => {
        setDetails(validatorInfo);
        setAreDetailsLoading(false);
        notif.dismiss();
        setDetailNotif(undefined);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadDetails(validator_program_id)}
              notification={notif}
              message={
                error?.message ||
                'There was an error loading validator details. please retry!!!'
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const { formatNumber } = useIntl();

  useEffect(() => {
    if (validator_program_id) loadDetails(validator_program_id);
    return () => {
      //TODO: CLEANUP fetch above
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validator_program_id]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        rowGap: theme.spacing(6),
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <Typography variant="h5">Validator's Stats</Typography>
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '0.32fr 1fr',
          columnGap: theme.spacing(2),
        }}
      >
        <Box
          sx={{
            borderRight: `2px solid ${theme.common.line}`,
            display: 'grid',
            rowGap: theme.spacing(5.25),
            gridTemplateRows: 'auto auto 1fr',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#FAFAFC',
            }}
          >
            Validators Information
          </Typography>
          {areDetailsLoading || !details ? (
            <Skeleton
              variant="circular"
              height={160}
              width={160}
              animation="wave"
              sx={{
                borderRadius: '100%',
                justifySelf: 'center',
                objectFit: 'cover',
                backgroundColor: 'rgb(137 127 127 / 43%)',
              }}
            />
          ) : (
            <img
              src={details.collection_uri}
              alt={details.validator_name}
              height="160px"
              width="160px"
              style={{
                borderRadius: '100%',
                justifySelf: 'center',
                objectFit: 'cover',
              }}
            />
          )}
          <Box
            sx={{
              display: 'grid',
              rowGap: theme.spacing(1),
              padding: `0 ${theme.spacing(1)} 0 0`,
            }}
          >
            <ValidatorCardContent
              value={
                areDetailsLoading || !details ? '' : details.validator_name
              }
              title="Name"
              revert
              skeleton={areDetailsLoading || !details}
            />
            <ValidatorCardContent
              value={
                areDetailsLoading || !details ? '' : `${details.validator_id}`
              }
              title="Validator ID"
              wrap
              skeleton={areDetailsLoading || !details}
            />
            <ValidatorCardContent
              value={
                areDetailsLoading || !details
                  ? ''
                  : `${details.init_commission} %`
              }
              title="Vote account commission"
              skeleton={areDetailsLoading || !details}
            />
            {/* <ValidatorCardContent
              value={
                areDetailsLoading || !details
                  ? ''
                  : `${details.current_skip_rate}`
              }
              title="Current skip rate"
              skeleton={areDetailsLoading || !details}
            /> */}
            <ValidatorCardContent
              value={
                areDetailsLoading || !details
                  ? ''
                  : `${details.validator_apy} %`
              }
              title="Validator APY"
              skeleton={areDetailsLoading || !details}
            />
            <ValidatorCardContent
              value={areDetailsLoading || !details ? '' : `${details.website}`}
              title="Website"
              skeleton={areDetailsLoading || !details}
            />
            <Box>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: '300' }}
              >
                Socials
              </Typography>
              {details && (
                <Box
                  sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    justifyContent: 'start',
                    columnGap: theme.spacing(1),
                  }}
                >
                  <Typography
                    component="a"
                    href={details.discord_invite}
                    rel="noreferrer"
                    sx={{ display: 'grid', alignItems: 'center' }}
                  >
                    <Tooltip arrow title={'discord'}>
                      <GitHub color="primary" />
                    </Tooltip>
                  </Typography>
                  <Typography
                    component="a"
                    href={'https://twitter.com/' + details.twitter_handle}
                    rel="noreferrer"
                    sx={{ display: 'grid', alignItems: 'center' }}
                  >
                    <Tooltip arrow title={'twitter'}>
                      <Twitter color="primary" />
                    </Tooltip>
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            rowGap: theme.spacing(6),
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridAutoFlow: 'column',
              columnGap: theme.spacing(2),
            }}
          >
            <StatCard
              title_1="Total NFTs delegated"
              upper={
                areDetailsLoading || !details
                  ? 0
                  : details.total_delegated_count
              }
              bottom={
                areDetailsLoading || !details ? 0 : details.total_minted_count
              }
              title_2="Total NFTs minted"
              skeleton={areDetailsLoading || !details}
            />
            <StatCard
              title_1="Total delegated stake(SOL)"
              upper={
                areDetailsLoading || !details
                  ? 0
                  : Number(details.total_delegated_stake.toFixed(3))
              }
              bottom={
                areDetailsLoading || !details
                  ? 0
                  : Number(details.max_primary_stake.toFixed(3))
              }
              title_2="Total stake requested(SOL)"
              skeleton={areDetailsLoading || !details}
            />
            <StatCard
              title_1="Total secondary stake(SOL)"
              upper={
                areDetailsLoading || !details
                  ? 0
                  : Number(details.total_secondary_stake.toFixed(3))
              }
              skeleton={areDetailsLoading || !details}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 0.2fr',
              columnGap: theme.spacing(1),
            }}
          >
            <Box
              sx={{
                height: 'fit-content',
                display: 'grid',
                rowGap: theme.spacing(3),
                padding: `0 ${theme.spacing(3)} 0 0`,
              }}
            >
              <ValidatorCardContent
                title="Vote account ID"
                value={
                  areDetailsLoading || !details ? '' : details.vote_account_id
                }
                skeleton={areDetailsLoading || !details}
              />
              <ValidatorCardContent
                title="Collection ID"
                value={
                  areDetailsLoading || !details ? '' : details.collection_id
                }
                skeleton={areDetailsLoading || !details}
              />
              <ValidatorCardContent
                title="Is validator ID Switchable ?"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : details.is_validator_id_switchable
                    ? 'Yes'
                    : 'No'
                }
                skeleton={areDetailsLoading || !details}
              />
              <ValidatorCardContent
                title="Initial redemption fee"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : `${details.initial_redemption_fee} %`
                }
                skeleton={areDetailsLoading || !details}
              />
              <ValidatorCardContent
                title="Governance expiration time"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : `${formatNumber(details.governance_expiration_time, {
                        style: 'unit',
                        unit: 'day',
                        unitDisplay: 'short',
                      })}`
                }
                skeleton={areDetailsLoading || !details}
              />
              <ValidatorCardContent
                title="Redemption fee duration"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : `${formatNumber(details.redemption_fee_duration, {
                        style: 'unit',
                        unit: 'day',
                        unitDisplay: 'short',
                      })}`
                }
                skeleton={areDetailsLoading || !details}
              />
            </Box>
            <Box
              sx={{
                height: 'fit-content',
                display: 'grid',
                rowGap: theme.spacing(5),
                padding: `0 ${theme.spacing(1)} 0 0`,
              }}
            >
              <ValidatorCardContent
                title="NFT Holders share"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : `${details.nft_holders_share}%`
                }
                skeleton={areDetailsLoading || !details}
              />
              <ValidatorCardContent
                title="Validator ID share"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : `${100 - details.nft_holders_share}%`
                }
                skeleton={areDetailsLoading || !details}
              />
              <ValidatorCardContent
                title="Creator royalties"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : `${details.creator_royalties}`
                }
                skeleton={areDetailsLoading || !details}
              />
              <ValidatorCardContent
                title="NFT backing (SOL)"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : `${details.unit_backing} SOL`
                }
                skeleton={areDetailsLoading || !details}
              />
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: '300' }}
              >
                Program version
              </Typography>
              {!details ? (
                <Skeleton
                  animation="wave"
                  width={`${random() * 10}%`}
                  sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
                />
              ) : details.programVersion === null ||
                details.programVersion.status === VersionStatus.Unsafe ? (
                <Typography color="error">
                  UNSAFE - Not a version of ingl program
                </Typography>
              ) : (
                <Typography
                  color={
                    details.programVersion.status === VersionStatus.Deprecated
                      ? 'yellow'
                      : 'greenF'
                  }
                >
                  `Version ${details.programVersion.version}`
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
