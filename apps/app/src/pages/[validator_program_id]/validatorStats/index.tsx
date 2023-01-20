import { GitHub, ReportRounded, Twitter } from '@mui/icons-material';
import { Box, Skeleton, Tooltip, Typography } from '@mui/material';
import { InglValidator } from '../../../interfaces';
import { useEffect, useState } from 'react';
import ValidatorCardContent from '../../../components/validators/validatorCardContent';
import theme from '../../../theme/theme';
import StatCard from '../../../components/stats/statCard';
import BN from 'bn.js';
import { useIntl } from 'react-intl';
import useNotification from '../../../common/utils/notification';
import { useParams } from 'react-router';
import ErrorMessage from '../../../common/components/ErrorMessage';

export default function ValidatorStats() {
  const [areDetailsLoading, setAreDetailsLoading] = useState<boolean>(false);
  const [details, setDetails] = useState<InglValidator>();
  const [detailNotif, setDetailNotif] = useState<useNotification>();
  const { validator_program_id } = useParams();

  const loadDetails = (validator_program_id: string) => {
    setAreDetailsLoading(true);
    const notif = new useNotification();
    if (detailNotif) {
      detailNotif.dismiss();
    }
    setDetailNotif(notif);
    setTimeout(() => {
      //TODO: call api here to load validator details with data vote_account_id
      // eslint-disable-next-line no-constant-condition
      if (6 > 5) {
        const newDetails: InglValidator = {
          collection_id: 'sioe',
          collection_uri:
            'https://img.bitscoins.net/v7/www.bitscoins.net/wp-content/uploads/2021/06/NFT-Marketplace-Rarible-Raises-Over-14-Million-Plans-to-Launch.jpg',
          creator_royalties: 2,
          current_skip_rate: 1.2,
          default_uri: 'iwoel',
          governance_expiration_time: 2323,
          init_commission: 2,
          initial_redemption_fee: 100,
          is_validator_id_switchable: false,
          nft_holders_share: 2,
          proposal_quorum: 2,
          redemption_fee_duration: 2,
          total_delegated_count: 2,
          max_primary_stake: new BN(2),
          total_secondary_stake: new BN(2),
          unit_backing: new BN(2),
          validator_apy: 1.2,
          validator_id: 'wiel',
          validator_name: 'Laine.Sol',
          vote_account_id: 'soeis',
          website: 'https://somewhere.com',
          discord_invite: 'https://discord.gg/9KWvjKV3Ed',
          twitter_handle: 'https://twitter.com/ingldao',
          total_minted_count: 50,
          total_delegated_stake: new BN(50),
        };
        setDetails(newDetails);
        setAreDetailsLoading(false);
        notif.dismiss();
        setDetailNotif(undefined);
      } else {
        notif.notify({
          render: 'Loading validator details...',
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadDetails(validator_program_id)}
              notification={notif}
              //TODO: message should come from backend
              message="There was an error loading validator details. please retry!!!"
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const { formatNumber } = useIntl();

  useEffect(() => {
    loadDetails(validator_program_id as string);
    return () => {
      //TODO: CLEANUP fetch above
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  : `${details.init_commission}`
              }
              title="Vote account commission"
              skeleton={areDetailsLoading || !details}
            />
            <ValidatorCardContent
              value={
                areDetailsLoading || !details
                  ? ''
                  : `${details.current_skip_rate}`
              }
              title="Current skip rate"
              skeleton={areDetailsLoading || !details}
            />
            <ValidatorCardContent
              value={
                areDetailsLoading || !details ? '' : `${details.validator_apy}`
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
                    href={details.twitter_handle}
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
              title_1="Total delegated stake"
              upper={
                areDetailsLoading || !details
                  ? 0
                  : details.total_delegated_stake
              }
              bottom={
                areDetailsLoading || !details ? 0 : details.max_primary_stake
              }
              title_2="Total stake requested"
              skeleton={areDetailsLoading || !details}
            />
            <StatCard
              title_1="Total secondary stake"
              upper={
                areDetailsLoading || !details
                  ? 0
                  : details.total_secondary_stake
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
                rowGap: theme.spacing(1),
                padding: `0 ${theme.spacing(1)} 0 0`,
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
                    : `${details.initial_redemption_fee} SOL`
                }
                skeleton={areDetailsLoading || !details}
              />
            </Box>
            <Box
              sx={{
                height: 'fit-content',
                display: 'grid',
                rowGap: theme.spacing(1),
                padding: `0 ${theme.spacing(1)} 0 0`,
              }}
            >
              <ValidatorCardContent
                title="Governance expiration time"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : `${formatNumber(details.governance_expiration_time, {
                        style: 'unit',
                        unit: 'second',
                        unitDisplay: 'short',
                      })}`
                }
                skeleton={areDetailsLoading || !details}
              />
              <ValidatorCardContent
                title="Validator share"
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
              <ValidatorCardContent
                title="Redemption fee duration"
                value={
                  areDetailsLoading || !details
                    ? ''
                    : `${formatNumber(details.redemption_fee_duration, {
                        style: 'unit',
                        unit: 'day',
                        unitDisplay: 'short',
                      })} SOL`
                }
                skeleton={areDetailsLoading || !details}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
