import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import Footer from '../footer';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ProgramUsage, signIn } from '@ingl-permissionless/axios';
import { toast } from 'react-toastify';

export function SignIn() {
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
      code: Yup.string().required('The code is required'),
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
          padding: '0px 20px 0px 20px',
        }}
      >
        <img
          src={'/assets/full_logo.png'}
          alt="ingl-logo"
          style={{ width: '60%', maxWidth: '250px' }}
        />
        <Typography
          sx={{
            fontSize: '24px',
            fontWeight: '300',
            textAlign: 'center',
            margin: '20px 0px 30px 0px',
          }}
        >
          Commoditizing Solana Validators
        </Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            background: '#28293D',
            boxShadow: '0px -10px 40px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '50px 40px 70px 40px',
            margin: '50px 0px 50px 0px',
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
                margin: '15px 0px 15px 0px',
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
              padding: '15px 0px 15px 0px',
              margin: '30px 0px 30px 0px',
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
