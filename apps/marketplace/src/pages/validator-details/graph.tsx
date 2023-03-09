import { Box, Skeleton } from '@mui/material';
import Chart, { ChartItem } from 'chart.js/auto';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import random from '../../common/utils/random';
import { StakePerEpoch } from '../../interfaces';
import theme from '../../theme/theme';

export default function Graph({
  data,
  isDataLoading,
}: {
  data: StakePerEpoch[];
  isDataLoading: boolean;
}) {
  const { formatNumber } = useIntl();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (data: any) => {
    return {
      type: 'line',
      data,
      options: {
        maintainAspectRatio: false,
        tension: 0.2,
        scales: {
          y: {
            stacked: true,
            grid: {
              display: false,
              color: theme.common.titleActive,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        parsing: {
          xAxisKey: 'epoch',
          yAxisKey: 'stake',
        },
      },
    };
  };

  const updateGraph = () => {
    const dataChart = Chart.getChart('dataChart');
    if (dataChart) dataChart.destroy();

    new Chart(
      document.getElementById('dataChart') as ChartItem,
      config({
        datasets: [
          {
            label: 'Stake Growth Over Time',

            data: data
              .sort((a, b) => (a.epoch > b.epoch ? 1 : -1))
              .map(({ epoch, stake }) => ({
                stake: stake,
                epoch: formatNumber(epoch),
              })),
            borderColor: theme.palette.primary.light,
            fill: true,
            order: 2,
          },
        ],
      })
    );
  };
  useEffect(() => {
    updateGraph();
    // eslint-disable-next-line
  }, [data]);

  return (
    <>
      <div
        style={{
          height: '250px',
          width: '100%',
          display: isDataLoading ? 'none' : 'grid',
        }}
      >
        <canvas id="dataChart"></canvas>
      </div>
      {isDataLoading && (
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: 2,
            alignItems: 'end',
            borderBottom: '2px solid grey',
            borderLeft: '2px solid grey',
            paddingLeft: 2,
          }}
        >
          {[...new Array(30)].map(() => (
            <Skeleton
              animation="wave"
              height={`${random() * 20}px`}
              sx={{ backgroundColor: 'rgb(137 127 127 / 43%)' }}
            />
          ))}
        </Box>
      )}
    </>
  );
}
