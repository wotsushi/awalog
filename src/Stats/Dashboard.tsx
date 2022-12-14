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

import FSChart from './charts/FSChart';
import WLDChart from './charts/WLDChart';
import WPChart from './charts/WPChart';
import Recent from './Recent';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Root = styled.div`
  flex: 1;
  padding-top: 5px;
  padding-left: 5px;
`;

const ChartSelector = styled(Form.Select)`
  float: right;
  width: 180px;
`;

const Charts = {
  WPChart: WPChart,
  WLDChart: WLDChart,
  FSChart: FSChart,
} as const;

const StyledRecent = styled(Recent)`
  margin-top: 5px;
`;

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
        <option value="FSChart">先後別勝敗</option>
      </ChartSelector>
      {<Chart decks={decks} results={results} subjectID={subject.id} />}
      <StyledRecent decks={decks} results={results} subjectID={subject.id} />
    </Root>
  );
};

export default Dashboard;
