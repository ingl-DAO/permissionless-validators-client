import React from 'react';
import Question from './Question';
import SectionTitle from './SectionTitle';
import theme from '../theme/theme';
import Wave from '../assets/wave.png';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Box } from '@mui/material';
AOS.init();

export default function Faqs() {
  const QUESTIONS: { question: string; answer: string }[] = [
    {
      question:
        'How are the distributed rewards to the sol-backed NFTs generated ?',
      answer:
        'The created validators earn rewards from multiple sources including Inflation, transaction fees(base fee + prioritization fees). This reward is distributed to the validator’s owners(NFTs owners).',
    },
    {
      question: 'Who is qualified to Launch a fractionalized validator ?',
      answer: 'Anyone can launch a fractionalized validator.',
    },
    {
      question:
        'How is it possible to make the NFTs redeemable despite the Sol Used to mint being used ?',
      answer:
        '◉ The equivalent amount of Sol used to Mint the NFTs is held in a program by an escrow pda. This sol is only used for the purpose of staking to the launched validator. <br/> ◉ It is not exposed to any other risk than staking, and smart contract risk, nor is it ever converted to another token. So all the Tokens used to mint are held by the program 1-1 in the native form, although it might be staked to the validator.',
    },
    {
      question:
        'How are validators Fractionalized from a technical, decentralized and trustless standpoint ?',
      answer:
        '◉ The vote account is owned by a PDA, this pda has the authority to withdraw, change_validator_id, etc. for either of such transactions to occur, a significant majority of the NFT owners must approve that change. <br/> ◉ Each validator has a deployed program of their own, NFT owners have upgrade authority through another pda, and a significant majority must approve for any program upgrade to take place.',
    },
  ];
  return (
    <Box
      display={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        paddingTop: theme.spacing(10),
        paddingBottom: theme.spacing(40),
        paddingLeft: theme.spacing(30),
        paddingRight: theme.spacing(30),
        minHeight: '800px',
        height: 'auto',
        overflow: 'hidden',
      }}
    >
      <Box data-aos="zoom-out-down" width={'100%'}>
        <SectionTitle title="FAQS" />
        <Box
          sx={{
            border: '1px solid rgba(239, 35, 60)',
            width: { mobile: '150px', laptop: '250px' },
            height: '0px',
            position: 'relative',
            top: '-35px',
            marginBottom: theme.spacing(5),
          }}
        />
        {QUESTIONS.map((question, index) => (
          <Question question={question} key={index} />
        ))}
      </Box>
      <img
        src={Wave}
        alt="wave"
        style={{
          width: '170%',
          position: 'absolute',
          zIndex: -1,
          opacity: 0.5,
          bottom: '-100px',
        }}
      />
    </Box>
  );
}
