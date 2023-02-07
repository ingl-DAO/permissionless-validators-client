import { ArrowBackIosNewOutlined } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import CollectionInformation from '../../components/register-validator/collectionInformation';
import DaoInformation, {
  DaoInfo
} from '../../components/register-validator/daoInformation';
import ValidatorInformation, {
  ValidatorInfo
} from '../../components/register-validator/validatorInformation';
import VoteAccountInformation, {
  VoteAccountInfo
} from '../../components/register-validator/voteAccountInformation';
import { CollectionJson, ValidatorRegistration } from '../../interfaces';
import { RegistryService } from '../../services/registry.service';
import theme from '../../theme/theme';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);

  const walletContext = useWallet();
  const { connection } = useConnection();
  const registryService = useMemo(
    () => new RegistryService(connection, walletContext),
    [connection, walletContext]
  );

  const [validatorInfo, setValidatorInfo] = useState<ValidatorInfo>({
    discord_invite: '',
    twitter_handle: '',
    validator_id: '',
    validator_name: '',
    website: '',
  });

  const [voteAccountInfo, setVoteAccountInfo] = useState<VoteAccountInfo>();
  const [jsonFileData, setJsonFileData] = useState<CollectionJson>();
  const [solBacking, setSolBacking] = useState<number>(0);
  const [creatorRoyalties, setCreatorRoyalties] = useState<number>(0);
  const [daoInfo, setDaoInfo] = useState<DaoInfo>();
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const stepComponent: Record<number, React.ReactNode> = {
    4: (
      <DaoInformation
        onPrev={(val: DaoInfo | undefined) => {
          setDaoInfo(val);
          setStep(3);
        }}
        handleSubmit={(val: DaoInfo) => {
          if (
            jsonFileData &&
            validatorInfo &&
            voteAccountInfo &&
            solBacking >= 1.05 &&
            creatorRoyalties <= 2
          ) {
            const validator: ValidatorRegistration = {
              nft_holders_share: voteAccountInfo.nft_holders_share,
              proposal_quorum: val.proposal_quorum,
              unit_backing: solBacking,
              collection_uri: jsonFileData.collection_uri,
              rarities: jsonFileData.rarities.map((rarity, index) => ({
                rarity,
                uris: jsonFileData.uris[index],
              })),
              discord_invite: validatorInfo.discord_invite,
              website: validatorInfo.website,
              twitter_handle: validatorInfo.twitter_handle.split('@')[1],
              rarity_names: jsonFileData.rarity_names,
              is_validator_id_switchable:
                voteAccountInfo.is_validator_id_switchable,
              validator_name: validatorInfo.validator_name,
              initial_redemption_fee: voteAccountInfo.initial_redemption_fee,
              max_primary_stake: voteAccountInfo.max_primary_stake,
              redemption_fee_duration: voteAccountInfo.redemption_fee_duration,
              init_commission: voteAccountInfo.init_commission,
              default_uri: jsonFileData.default_uri,
              governance_expiration_time: val.governance_expiration_time,
              creator_royalties: creatorRoyalties,
            };
            createValidator(validatorInfo.validator_id, validator);
          } else
            alert(
              'Unit backing must be greater than 1.05 and creator royalties less than 2%'
            );
        }}
        daoInfo={daoInfo}
        isCreating={isCreating}
      />
    ),
    3: (
      <CollectionInformation
        onPrev={(val) => {
          setJsonFileData(val.jsonFileData);
          setSolBacking(val.solBacking);
          setCreatorRoyalties(val.creatorRoyalties);
          setStep(2);
        }}
        onNext={(val) => {
          setJsonFileData(val.jsonFileData);
          setSolBacking(val.solBacking);
          setCreatorRoyalties(val.creatorRoyalties);
          setStep(4);
        }}
        jsonFileData={jsonFileData}
        solBacking={solBacking}
        creatorRoyalties={creatorRoyalties}
      />
    ),
    1: (
      <ValidatorInformation
        setStep={setStep}
        handleSubmit={(val: ValidatorInfo) => setValidatorInfo(val)}
        validatorInfo={validatorInfo}
      />
    ),
    2: (
      <VoteAccountInformation
        handleSubmit={(val: VoteAccountInfo) => setVoteAccountInfo(val)}
        onPrev={() => setStep(1)}
        setStep={setStep}
        voteAccountInfo={voteAccountInfo}
      />
    ),
  };

  // const [validatorNotif, setValidatorNotif] = useState<useNotification>();

  function createValidator(
    validatorId: string,
    validator: ValidatorRegistration
  ) {
    // TODO: Remove this after beta setup
    toast.warning('🛠️Registration currently not accessible for the public⚙️', {
      autoClose: 5000,
    });
    // end TODO
    // setIsCreating(true);
    // const notif = new useNotification();
    // if (validatorNotif) validatorNotif.dismiss();
    // setValidatorNotif(notif);
    // notif.notify({
    //   render: 'Creating Validator...',
    // });
    // registryService
    //   .registerProgram(new PublicKey(validatorId), validator)
    //   .then((signatures) => {
    //     notif.update({
    //       render: (
    //         <>
    //           {signatures.map((signature) => (
    //             <>
    //               <CopyTransactionId
    //                 transaction_id={signature}
    //                 message="Registered validator successfully !!"
    //               />
    //               <a
    //                 style={{ color: 'white' }}
    //                 href="https://whitepaper.ingl.io/components/onboarding-a-validator/after-registration."
    //               >
    //                 See what's next
    //               </a>
    //             </>
    //           ))}
    //         </>
    //       ),
    //     });
    //     setValidatorNotif(undefined);
    //   })
    //   .catch((error) => {
    //     notif.update({
    //       type: 'ERROR',
    //       render: (
    //         <ErrorMessage
    //           retryFunction={() => createValidator(validatorId, validator)}
    //           notification={notif}
    //           message={
    //             error?.message ||
    //             'There was an error creating validator. Please try again!!!'
    //           }
    //         />
    //       ),
    //       autoClose: false,
    //       icon: () => <ReportRounded fontSize="medium" color="error" />,
    //     });
    //   })
    //   .finally(() => setIsCreating(false));
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
        {step === 1 && (
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
        )}
        <Typography variant="h5">Validator Registration</Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          columnGap: theme.spacing(2),
          gridTemplateColumns: {
            mobile: 'auto',
            laptop: step !== 3 ? 'auto 1fr' : 'auto',
          },
          '&>img': {
            display: {
              mobile: 'none',
              laptop: step !== 3 ? 'initial' : 'none',
            },
          },
        }}
      >
        <img
          src="/assets/hero.png"
          alt="Hero"
          style={{
            width: '80%',
            justifySelf: 'center',
          }}
        />
        {stepComponent[step]}
      </Box>
    </Box>
  );
}
