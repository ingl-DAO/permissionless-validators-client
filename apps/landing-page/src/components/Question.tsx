import { Add, Remove } from '@mui/icons-material';
import { Box, Collapse, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import theme from '../theme/theme';

export default function Question({
  question: { question, answer },
}: {
  question: { question: string; answer: string };
}) {
  const [isQuestionOpen, setIsQuestionOpen] = useState<boolean>(false);
  return (
    <Box
      sx={{
        borderBottom: `1px solid rgba(213, 242, 227, 0.3)`,
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(6),
      }}
    >
      <Box
        onClick={() => setIsQuestionOpen(!isQuestionOpen)}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignItems: 'center',
        }}
      >
        <IconButton
          size="small"
          onClick={() => setIsQuestionOpen(!isQuestionOpen)}
          style={{ margin: '0 30px 0 0' }}
        >
          <Tooltip arrow title="expand more">
            {isQuestionOpen ? (
              <Remove fontSize="large" color="primary" />
            ) : (
              <Add fontSize="large" color="primary" />
            )}
          </Tooltip>
        </IconButton>
        <Typography
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: theme.palette.secondary.main,
            fontFamily: 'Space Grotesk',
          }}
        >
          {question}
        </Typography>
      </Box>
      <Collapse
        sx={{ marginTop: isQuestionOpen ? '28px' : 0 }}
        in={isQuestionOpen}
      >
        <Box
          style={{
            borderLeft: '2px solid rgba(239, 35, 60, 0.5)',
            padding: theme.spacing(0, 4),
            width: '95%',
            margin: 'auto',
          }}
        >
          <Typography
            style={{
              fontSize: '18px',
              fontFamily: 'Poppins',
              fontWeight: '400',
              lineHeight: '36px',
            }}
            dangerouslySetInnerHTML={{ __html: answer }}
          ></Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
