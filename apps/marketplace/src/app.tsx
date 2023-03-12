import { ThemeProvider } from '@mui/material/styles';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { IntlProvider } from 'react-intl';
import { useRoutes } from 'react-router';
import { Flip, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLanguage } from './contexts/language/LanguageContextProvider';
import enMessages from './languages/en-us';
import frMessages from './languages/fr';
import { routes } from './routes/routes';
import theme from './theme/theme';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo, useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { verifyToken } from '@ingl-permissionless/axios';
import { CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import { SignIn } from '@ingl-permissionless/shared-components';

export function App() {
  const [statusOfCodeValidation, setStatusOfCodeValidation] = useState<
    'loading' | 'success' | 'failed'
  >('success');
  const { activeLanguage } = useLanguage();
  const activeMessage = activeLanguage === 'en' ? frMessages : enMessages;
  const routing = useRoutes(routes);

  const verifyCodeFromLocalStorage = () => {
    const accessToken = localStorage.getItem('accessToken');
    console.log('accessToken', accessToken);
    if (accessToken)
      verifyToken(accessToken)
        .then(() => {
          setStatusOfCodeValidation('success');
        })
        .catch(() => setStatusOfCodeValidation('failed'));
    else setStatusOfCodeValidation('failed');
  };

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  useEffect(() => {
    verifyCodeFromLocalStorage();
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={statusOfCodeValidation === 'success'}
      >
        <WalletModalProvider>
          <IntlProvider
            messages={activeMessage}
            locale={activeLanguage}
            defaultLocale="en"
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <ThemeProvider theme={theme}>
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  transition={Flip}
                />
                {statusOfCodeValidation === 'loading' ? (
                  <Box
                    sx={{
                      width: '100vw',
                      height: '100vh',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress
                      color="primary"
                      thickness={3}
                      size={'250px'}
                    />
                  </Box>
                ) : statusOfCodeValidation === 'success' ? (
                  routing
                ) : (
                  <SignIn />
                )}
              </ThemeProvider>
            </LocalizationProvider>
          </IntlProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
