import { ArrowBackOutlined, ArrowForwardOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { CollectionJson } from '../../interfaces';
import theme from '../../theme/theme';

interface JsonNft {
  image_ref: string;
  is_delegated: boolean;
  rarity: string;
}

interface RaritySpread {
  rarity_name: string;
  percentage: number;
}

function CollectionNFT({
  nft,
  pos,
  skeleton = false,
}: {
  nft?: JsonNft;
  pos: number;
  skeleton?: boolean;
}) {
  return (
    <Box
      sx={{
        background: 'rgba(9, 44, 76, 0.6)',
        borderRadius: theme.spacing(2.5),
        position: 'relative',
        height: { laptop: '300px', mobile: '150px' },
        width: { laptop: '300px', mobile: '150px' },
        display: 'grid',
        alignItems: 'center',
        justifyItems: 'center',
      }}
    >
      {skeleton || !nft ? (
        <Box sx={{ padding: theme.spacing(2) }}>
          <CircularProgress color="primary" size={150} thickness={1} />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#1C1C28',
              padding: '5px 7px',
              borderTopRightRadius: theme.spacing(2.5),
              borderBottomLeftRadius: theme.spacing(2.5),
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontSize: { laptop: 'initial', mobile: '0.80rem' } }}
            >
              {nft.rarity}
            </Typography>
          </Box>
          <img
            src={nft.image_ref}
            alt={`nft ${pos}`}
            style={{
              objectFit: 'cover',
              height: '100%',
              width: '100%',
              borderRadius: theme.spacing(2.5),
            }}
          />
        </>
      )}
    </Box>
  );
}

export default function CollectionInformation({
  onPrev,
  onNext,
  solBacking: sb,
  jsonFileData: jfd,
  creatorRoyalties:cr,
}: {
  solBacking: number;
  jsonFileData?: CollectionJson;
  creatorRoyalties: number;
  onPrev: (val: { jsonFileData: CollectionJson|undefined; solBacking: number, creatorRoyalties:number }) => void;
  onNext: (val: { jsonFileData: CollectionJson; solBacking: number, creatorRoyalties:number }) => void;
}) {
  const [jsonFileData, setJsonFileData] = useState<CollectionJson | undefined>(jfd);
  const [solBacking, setSolBacking] = useState<number>(sb);
  const [creatorRoyalties, setCreatorRoyalties] = useState<number>(cr)
  const [jsonNfts, setJsonNfts] = useState<JsonNft[]>([]);
  const [raritySpread, setRaritySpread] = useState<RaritySpread[]>([]);
  const [activeNftPos, setActiveNftPos] = useState<number>(0);

  const getImages = async (rarity_names: string[], uris: string[][]) => {
    const nfts: JsonNft[] = [];

    for (let index = 0; index < rarity_names.length; index++) {
      for (let i = 0; i < uris[index].length; i++) {
        const uriData = await (await fetch(uris[index][i])).json();
        nfts.push({
          image_ref: uriData.image,
          is_delegated: true,
          rarity: rarity_names[index],
        });
      }
    }
    return nfts;
  };

  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  useEffect(() => {
    if (jsonFileData) {
      const { rarities, rarity_names, uris } = jsonFileData;
      const totalRarities = rarities.reduce((total, x) => {
        return x + total;
      }, 0);

      const ans: RaritySpread[] = [];
      rarity_names.forEach((name, index) => {
        ans.push({
          percentage: (rarities[index] / totalRarities) * 100,
          rarity_name: name,
        });
      });

      setIsLoadingImages(true);
      getImages(rarity_names, uris).then((nfts) => {
        setJsonNfts(nfts);
        setIsLoadingImages(false);
      });
      setRaritySpread(ans);
    }
  }, [jsonFileData]);

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          columnGap: theme.spacing(3),
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">NFT Collection's information</Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(2),
          }}
        >
          <Button variant="contained" color="primary" onClick={() =>onPrev({ jsonFileData, solBacking, creatorRoyalties })
            }>
            Prev
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!jsonFileData}
            onClick={() =>
              jsonFileData ? onNext({ jsonFileData, solBacking, creatorRoyalties }) : null
            }
          >
            Next
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '0.52fr 1fr',
          columnGap: theme.spacing(3),
        }}
      >
        <Box sx={{ display: 'grid', rowGap: '16px', justifyItems: 'center' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center',
              columnGap: theme.spacing(1),
            }}
          >
            {activeNftPos > 0 && (
              <Tooltip arrow title="Back">
                <IconButton
                  disabled={isLoadingImages}
                  onClick={() => setActiveNftPos((prevVal) => prevVal - 1)}
                >
                  <ArrowBackOutlined color="primary" />
                </IconButton>
              </Tooltip>
            )}
            {jsonFileData && (
              <CollectionNFT
                nft={jsonNfts[activeNftPos]}
                pos={activeNftPos}
                skeleton={isLoadingImages}
              />
            )}
            {activeNftPos < jsonNfts.length && (
              <Tooltip arrow title="Next">
                <IconButton
                  disabled={isLoadingImages}
                  onClick={() => setActiveNftPos((prevVal) => prevVal + 1)}
                >
                  <ArrowForwardOutlined color="primary" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Box
            sx={{
              display: 'grid',
              justifyItems: 'center',
              rowGap: theme.spacing(2),
            }}
          >
            <Box sx={{ display: 'grid', justifyItems: 'center' }}>
              <Typography variant="h6">NFT Collection</Typography>
              {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
              <Typography variant="caption" sx={{ textAlign: 'center' }}>
                Don't have an nft collection ? fine, select an Ingl predefined
                beautiful NFT collection and get rapidly started🚀
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', justifyItems: 'center' }}>
              <Box>
                <input
                  id="add-image-button"
                  accept={'.json'}
                  type="file"
                  hidden
                  onChange={(event) => {
                    if (event.target.files) {
                      const tt = event.target.files[0];
                      const fileread = new FileReader();
                      fileread.onload = function (e) {
                        if (e.target) {
                          const content = e.target.result;
                          const intern = JSON.parse(content as string); // parse json
                          const expectedKeys = [
                            'rarity_names',
                            'collection_uri',
                            'rarities',
                            'uris',
                            'default_uri'
                          ];

                          if (
                            expectedKeys
                              .map((ll) => Object.keys(intern).includes(ll))
                              .includes(false)
                          )
                            alert(
                              `json file must have fields ${expectedKeys.join(
                                ', '
                              )}`
                            );
                          else {
                            setJsonFileData({
                              collection_uri: intern.collection_uri,
                              rarities: intern.rarities,
                              rarity_names: intern.rarity_names,
                              uris: intern.uris,
                              default_uri: intern.default_uri
                            });
                          }
                        }
                      };
                      fileread.readAsText(tt);
                    }
                  }}
                />
                <label htmlFor="add-image-button">
                  <Button
                    component="span"
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: 'none' }}
                    size="large"
                  >
                    Upload your json
                  </Button>
                </label>
              </Box>
              <Typography variant="caption">Get json format here</Typography>
            </Box>
          </Box>
        </Box>
        <Box>
          <Box>
            <Box>
              <Typography variant="h6">Collection URI</Typography>
              {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
              <Typography variant="caption" sx={{ color: 'wheat' }}>
                A link point to a web3 storage e.g arweave🎨
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Collection URI"
              fullWidth
              disabled
              required
              sx={{
                '& input': {
                  '&.Mui-disabled': {
                    WebkitTextFillColor: 'white',
                  },
                  backgroundColor: '#28293D',
                  color: 'white',
                  '&::placeholder': {
                    color: 'white',
                  },
                },
              }}
              value={jsonFileData?.collection_uri}
            />
          </Box>
          <Box>
            <Box>
              <Typography variant="h6">Rarities</Typography>
              {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
              <Typography variant="caption" sx={{ color: 'wheat' }}>
                From least rare to the rarest📉
              </Typography>
            </Box>
            <Box
              sx={{
                height: '36px',
                width: '100%',
                backgroundColor: '#28293D',
                color: 'white',
                borderRadius: '4px',
                display: 'grid',
                gridAutoFlow: 'column',
                justifyItems: 'start',
                columnGap: theme.spacing(2),
                padding: '4px',
              }}
            >
              {raritySpread
                .sort((a, b) => (a.percentage > b.percentage ? 1 : -1))
                .map(({ percentage: p, rarity_name: rn }, index) => (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: 'rgba(29, 29, 41, 0.78)',
                      borderRadius: '10px',
                      display: 'grid',
                      width: 'fit-content',
                      gridTemplateColumns: '1fr auto',
                      columnGap: theme.spacing(4),
                      alignItems: 'center',
                      padding: '4px 8px',
                    }}
                  >
                    <Typography variant="body2">{rn}</Typography>
                    <Typography variant="body2">{`${p}%`}</Typography>
                  </Box>
                ))}
            </Box>
            {/* <TextField
              size="small"
              placeholder="Unit backing"
              fullWidth
              disabled
              required
              sx={{
                '& input': {
                  backgroundColor: '#28293D',
                  color: 'white',
                  '&::placeholder': {
                    color: 'white',
                  },
                },
              }}
              value={jsonFileData?.collection_uri}
            /> */}
          </Box>
          <Box>
            <Box>
              <Typography variant="h6">Unit backing</Typography>
              {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
              <Typography variant="caption" sx={{ color: 'wheat' }}>
                Amount of SOLs backing each NFT💰
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Unit backing"
              fullWidth
              required
              type="number"
              sx={{
                '& input': {
                  backgroundColor: '#28293D',
                  color: 'white',
                  '&::placeholder': {
                    color: 'white',
                  },
                },
              }}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 0) {
                  setSolBacking(val);
                }
              }}
              value={solBacking}
            />
          </Box>
          <Box>
            <Box>
              <Typography variant="h6">Creator royalties</Typography>
              {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
              <Typography variant="caption" sx={{ color: 'wheat' }}>
                Profit gotten by nft creator when it's sold!
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Creator royalties"
              fullWidth
              required
              type="number"
              sx={{
                '& input': {
                  backgroundColor: '#28293D',
                  color: 'white',
                  '&::placeholder': {
                    color: 'white',
                  },
                },
              }}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 0 && val<200) {
                  setCreatorRoyalties(val);
                }else alert('must be greater than 0 and less than 200')
              }}
              value={creatorRoyalties}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
