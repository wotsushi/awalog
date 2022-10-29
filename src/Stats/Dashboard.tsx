import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';

import { Deck, Result } from 'lib/result';

import WLDChart from './charts/WLDChart';
import WPChart from './charts/WPChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Root = styled.div`
  padding-top: 5px;
  width: 700px;
`;

const ChartSelector = styled(Form.Select)`
  width: 180px;
  float: right;
`;

const Charts = {
  WPChart: WPChart,
  WLDChart: WLDChart,
} as const;

type Props = {
  decks: Deck[];
  results: Result[];
  subject: Deck;
};

export const summaryDeck: Deck = {
  id: 0,
  name: 'サマリー',
};

const Dashboard = ({ decks, results, subject }: Props) => {
  const [chart, setChart] = useState<keyof typeof Charts>('WLDChart');
  const Chart = Charts[chart];
  return (
    <Root>
      <ChartSelector
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setChart(e.target.value as keyof typeof Charts)
        }
      >
        <option value="WLDChart">勝利数</option>
        <option value="WPChart">勝率</option>
      </ChartSelector>
      {<Chart decks={decks} results={results} subjectID={subject.id} />}
    </Root>
  );
};

export default Dashboard;
