import { Bar } from 'react-chartjs-2';

type Props = {
  title: string;
  deckNames: string[];
  win: number[];
  lose: number[];
  draw: number[];
};

const NumberChart = (props: Props) => {
  const { title, deckNames, win, lose, draw } = props;
  return (
    <Bar
      width={700}
      height={350}
      options={{
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
        plugins: {
          title: {
            display: true,
            text: title,
          },
        },
      }}
      data={{
        labels: deckNames,
        datasets: [
          {
            label: '勝利数',
            data: win,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
            label: '敗北数',
            data: lose,
            backgroundColor: 'rgb(255, 99, 132, 0.5)',
          },
          {
            label: '引き分け数',
            data: draw,
            backgroundColor: 'rgb(75, 192, 192, 0.5)',
          },
        ],
      }}
    />
  );
};

export default NumberChart;
