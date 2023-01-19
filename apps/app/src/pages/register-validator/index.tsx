import { ArrowBackIosNewOutlined } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import theme from '../../theme/theme';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const stepTitle: Record<number, string> = {
    1: "Validator's information",
    2: "Vote account's information",
    3: "NFT collection's information",
    4: "Validator's DAO information",
  };
  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: theme.spacing(4),
        height: '100%',
        gridTemplateRows: 'auto auto 1fr',
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
          gridTemplateColumns: '1fr auto',
          columnGap: theme.spacing(3),
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">{stepTitle[step]}</Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(2),
          }}
        >
          <Button
            variant="contained"
            color="primary"
            disabled={step === 1}
            onClick={() => setStep((prevStep) => prevStep - 1)}
          >
            Prev
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={step === 4}
            onClick={() => setStep((prevStep) => prevStep + 1)}
          >
            Next
          </Button>
        </Box>
      </Box>
      <Box sx={{ height: '100%' }}>
        <Scrollbars autoHide>Content</Scrollbars>
      </Box>
    </Box>
  );
}
