import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import Footer from '../../components/footer';
import theme from '../../theme/theme';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ProgramUsage, signIn } from '@ingl-permissionless/axios';
import { toast } from 'react-toastify';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (code: string) => {
    setIsLoading(true);
    signIn(ProgramUsage.Permissionless, code)
      .then((accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        window.location.reload();
      })
      .catch((error) => toast.error(error?.message || 'Unexpected error !!!'))
      .finally(() => setIsLoading(false));
  };

  const formik = useFormik({
    initialValues: {
      code: '',
    },
    validationSchema: Yup.object().shape({
      code: Yup.string().required('The code is required').length(6),
    }),
    onSubmit: ({ code }) => {
      handleSubmit(code);
    },
  });
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'grid',
        gridTemplateRows: 'auto 30px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing(0, 2),
        }}
      >
        <img
          src={'/assets/full_logo.png'}
          alt="ingl-logo"
          style={{ width: '60%', maxWidth: '200px' }}
        />
        <Typography
          sx={{
            fontSize: '24px',
            fontWeight: '300',
            textAlign: 'center',
            margin: theme.spacing(2, 0, 3, 0),
          }}
        >
          Fractionalizing Solana Validators
        </Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            background: '#28293D',
            boxShadow: '0px -10px 40px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: theme.spacing(5, 4, 7, 4),
            margin: theme.spacing(5, 0),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
            maxWidth: '320px',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Typography
              sx={{
                fontSize: '18px',
              }}
            >
              Code
            </Typography>
            <TextField
              variant="outlined"
              name="code"
              required
              fullWidth
              type="password"
              value={formik.values.code}
              onChange={formik.handleChange}
              error={Boolean(formik.errors.code)}
              helperText={formik.errors.code}
              sx={{
                borderRadius: '8px',
                height: '60px',
                margin: theme.spacing(1.5, 0),
                '& input': {
                  borderRadius: '8px',
                  backgroundColor: '#1C1C28',
                  color: 'white',
                  '&::placeholder': {
                    color: 'gray',
                  },
                },
              }}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{
              width: '100%',
              padding: theme.spacing(1.5, 0, 1.5, 0),
              margin: theme.spacing(3, 0, 3, 0),
              borderRadius: '15px',
              fontFamily: 'Poppins',
            }}
          >
            {isLoading ? (
              <CircularProgress
                style={{ color: 'white' }}
                thickness={5}
                size={'20px'}
              />
            ) : (
              'Sign-in'
            )}
          </Button>
          <Typography
            sx={{
              fontSize: '12px',
              marginBottom: '20px',
              fontFamily: 'Poppins',
              fontWeight: 'normal',
              textAlign: 'center',
            }}
          >
            Insert code to access our Beta version
          </Typography>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
