import { DateTime } from 'luxon';
import { Table } from 'react-bootstrap';
import { AiOutlineCrown } from 'react-icons/ai';
import styled from 'styled-components';

import { Deck, findWinner, Result } from 'lib/result';

import { summaryDeck } from './Dashboard';

const ResultTable = styled(Table)`
  margin-bottom: 0;
`;

const ResultTh = styled.th`
  width: 200px;
  text-align: right;
`;

const LP = styled.td`
  text-align: right;
`;

type PlayerProps = {
  lp: number;
  isFirst: boolean;
};
const Player = ({ lp, isFirst }: PlayerProps) => (
  <LP role="cell">{`${lp}[${isFirst ? '先' : '後'}]`}</LP>
);

type Props = {
  className?: string;
  decks: Deck[];
  results: Result[];
  subjectID: number;
};

const Recent = ({ className, decks, results, subjectID }: Props) => {
  const deckName = Object.fromEntries(decks.map(({ id, name }) => [id, name]));
  return (
    <Table striped bordered className={className}>
      <thead>
        <tr>
          <th>#</th>
          <th>日時</th>
          <th>結果</th>
        </tr>
      </thead>
      <tbody>
        {results
          .filter(
            ({ decks }) =>
              subjectID === summaryDeck.id ||
              decks[1] === subjectID ||
              decks[2] === subjectID
          )
          .map<[Result, number]>((result, i) => [result, i + 1])
          .reverse()
          .slice(0, 50)
          .map(([result, i]) => {
            const you = result.decks[2] === subjectID ? 2 : 1;
            const opponent = you === 1 ? 2 : 1;
            return (
              <tr key={i} data-testid="recent-row">
                <td>{i}</td>
                <td>
                  {DateTime.fromFormat(
                    result.datetime,
                    'yyyy-MM-dd HH:mm'
                  ).toFormat('yyyy年MM月dd日HH:mm')}
                </td>
                <td>
                  <ResultTable borderless size="sm">
                    <thead>
                      <tr>
                        <ResultTh role="cell">
                          {findWinner(result) === you && <AiOutlineCrown />}
                          {deckName[result.decks[you]]}
                        </ResultTh>
                        <ResultTh role="cell">
                          {findWinner(result) === opponent && (
                            <AiOutlineCrown />
                          )}
                          {deckName[result.decks[opponent]]}
                        </ResultTh>
                      </tr>
                    </thead>
                    <tbody>
                      {result.duels.map((duel, i) => (
                        <tr key={i}>
                          <Player
                            lp={duel[you].lp}
                            isFirst={duel[you].isFirst}
                          />
                          <Player
                            lp={duel[opponent].lp}
                            isFirst={duel[opponent].isFirst}
                          />
                        </tr>
                      ))}
                    </tbody>
                  </ResultTable>
                </td>
              </tr>
            );
          })}
      </tbody>
    </Table>
  );
};

export default Recent;
