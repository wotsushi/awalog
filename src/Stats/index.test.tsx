import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from 'firebase/auth';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { MemoryRouter } from 'react-router-dom';

import { useDecks, useResults, useUser } from 'lib/firebase';
import { Deck, Result } from 'lib/result';
import { Media, MediaValue, useMedia } from 'lib/useMedia';

import OriginalStats from '.';

jest.mock('lib/firebase');
const useDecksMock = useDecks as jest.MockedFunction<typeof useDecks>;
const useResultsMock = useResults as jest.MockedFunction<typeof useResults>;
const useUserMock = useUser as jest.MockedFunction<typeof useUser>;

jest.mock('lib/useMedia');
const useMediaMock = jest.mocked(useMedia);

jest.mock('react-chartjs-2', () => ({
  // グラフの代わりにグラフ描画に使われる引数を表示するmock
  Bar: (props: { data: React.ComponentProps<typeof Bar>['data'] }) => {
    const labels = props.data.labels as string[];
    const datasets = props.data.datasets as { label: string; data: number[] }[];
    return (
      <ul>
        {datasets.map((dataset) =>
          labels.map((label, i) => (
            <li key={`${dataset.label}:${label}`}>
              {dataset.label}:{label}={dataset.data[i]}
            </li>
          ))
        )}
      </ul>
    );
  },
}));

type Props = {
  decks?: Deck[];
  results?: Result[];
  user?: User;
  media?: MediaValue;
};

const Stats = ({
  decks = [
    { id: 1, name: '旋風BF' },
    { id: 2, name: '代行天使' },
  ],
  results = [],
  user = { emailVerified: true } as User,
  media = Media.Tablet,
}: Props) => {
  useDecksMock.mockReturnValue(decks);
  useResultsMock.mockReturnValue(results);
  useUserMock.mockReturnValue(user);
  useMediaMock.mockReturnValue(media);
  return (
    <MemoryRouter>
      <OriginalStats />
    </MemoryRouter>
  );
};

const user = userEvent.setup();

describe('サイドメニュー', () => {
  it('デッキリストが[旋風BF, 代行天使]のときサイドメニューには[サマリー、旋風BF、代行天使]の順で項目が表示される', async () => {
    render(
      <Stats
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );

    const items = within(screen.getByTestId('sidebar')).getAllByRole('button');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('サマリー');
    expect(items[1]).toHaveTextContent('旋風BF');
    expect(items[2]).toHaveTextContent('代行天使');
  });
  it('初期状態ではサマリーが選択状態', async () => {
    render(
      <Stats
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );

    expect(screen.getByText('サマリー')).toHaveClass('active');
  });
  it('サイドメニューの旋風BFをクリックすると旋風BFが選択状態になる', async () => {
    render(
      <Stats
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );

    expect(screen.getByText('サマリー')).toHaveClass('active');
    expect(screen.getByText('旋風BF')).not.toHaveClass('active');

    await user.click(screen.getByText('旋風BF'));

    expect(screen.getByText('サマリー')).not.toHaveClass('active');
    expect(screen.getByText('旋風BF')).toHaveClass('active');
  });
  it('タブレットでデッキが16個ある場合、ページ1にはサマリーと15個のデッキが表示される', async () => {
    render(
      <Stats
        decks={[...Array(16)].map((_, i) => ({
          id: i + 1,
          name: `デッキ${i + 1}`,
        }))}
        media={Media.Tablet}
      />
    );

    const sidebar = within(screen.getByTestId('sidebar'));
    expect(sidebar.getByText('1 / 2')).toBeInTheDocument();
    expect(sidebar.getByText('サマリー')).toBeInTheDocument();
    [...Array(15)].forEach((_, i) => {
      expect(sidebar.getByText(`デッキ${i + 1}`)).toBeInTheDocument();
    });
    expect(sidebar.queryByText('デッキ16')).not.toBeInTheDocument();
  });
  it('タブレットでデッキが16個ある場合、ページ2には16個目のデッキ個表示される', async () => {
    render(
      <Stats
        decks={[...Array(16)].map((_, i) => ({
          id: i + 1,
          name: `デッキ${i + 1}`,
        }))}
        media={Media.Tablet}
      />
    );
    const sidebar = within(screen.getByTestId('sidebar'));

    await userEvent.click(sidebar.getByText('Next'));

    expect(sidebar.getByText('2 / 2')).toBeInTheDocument();
    expect(sidebar.getByText('サマリー')).toBeInTheDocument();
    [...Array(15)].forEach((_, i) => {
      expect(sidebar.queryByText(`デッキ${i + 1}`)).not.toBeInTheDocument();
    });
    expect(sidebar.getByText('デッキ16')).toBeInTheDocument();
  });
});

describe('勝利数グラフ', () => {
  describe('サマリー', () => {
    it('戦績が空の場合、グラフは空', async () => {
      render(
        <Stats
          results={[]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝利数');

      expect(screen.queryByText(/.*:.*=/)).not.toBeInTheDocument();
    });

    it('旋風BF対代行天使oo-の戦績のみ存在する場合、旋風BFは勝利数1敗北数0引き分け数0、代行天使は勝利数0敗北数1引き分け数0', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝利数');

      expect(screen.getByText('勝利数:旋風BF=1')).toBeInTheDocument();
      expect(screen.getByText('敗北数:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('引き分け数:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('勝利数:代行天使=0')).toBeInTheDocument();
      expect(screen.getByText('敗北数:代行天使=1')).toBeInTheDocument();
      expect(screen.getByText('引き分け数:代行天使=0')).toBeInTheDocument();
    });
    it('旋風BFと代行天使で引き分けの戦績のみ存在する場合、旋風BFは勝利数0敗北数0引き分け数1、代行天使は勝利数0敗北数0引き分け数1', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
                { 1: { lp: 0, isFirst: true }, 2: { lp: 0, isFirst: false } },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝利数');

      expect(screen.getByText('勝利数:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('敗北数:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('引き分け数:旋風BF=1')).toBeInTheDocument();
      expect(screen.getByText('勝利数:代行天使=0')).toBeInTheDocument();
      expect(screen.getByText('敗北数:代行天使=0')).toBeInTheDocument();
      expect(screen.getByText('引き分け数:代行天使=1')).toBeInTheDocument();
    });
    it('戦績が旋風BF勝ちと代行天使負け、旋風BF勝ちとヒーロービート負け、代行天使勝ちとヒーロービート負けの場合、旋風BFは勝利数2敗北数0引き分け数0、代行天使は5勝利数1敗北数1引き分け数0、ヒーロービートは勝利数0敗北数2引き分け数0', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 3, 2: 1 },
              duels: [
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 1000, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 2, 2: 3 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
            { id: 3, name: 'ヒーロービート' },
          ]}
        />
      );

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝利数');

      expect(screen.getByText('勝利数:旋風BF=2')).toBeInTheDocument();
      expect(screen.getByText('敗北数:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('引き分け数:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('勝利数:代行天使=1')).toBeInTheDocument();
      expect(screen.getByText('敗北数:代行天使=1')).toBeInTheDocument();
      expect(screen.getByText('引き分け数:代行天使=0')).toBeInTheDocument();
      expect(screen.getByText('勝利数:ヒーロービート=0')).toBeInTheDocument();
      expect(screen.getByText('敗北数:ヒーロービート=2')).toBeInTheDocument();
      expect(
        screen.getByText('引き分け数:ヒーロービート=0')
      ).toBeInTheDocument();
    });
    it('ミラーマッチの戦績のみ存在する場合、戦績は空', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 1 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '旋風BF' },
          ]}
        />
      );

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝利数');

      expect(screen.queryByText(/.*:.*=/)).not.toBeInTheDocument();
    });
  });
  describe('個別', () => {
    it('戦績が空の場合、旋風BFの個別戦績グラフは空', async () => {
      render(
        <Stats
          results={[]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.click(screen.getByText('旋風BF'));

      expect(screen.getByText('旋風BF')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝利数');

      expect(screen.queryByText(/.*:.*=/)).not.toBeInTheDocument();
    });
    it('旋風BF勝ち代行天使負けの戦績のみ存在する場合の旋風BF個別戦績: 代行天使に対する勝利数1敗北数0引き分け数0', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: '旋風BF' }));

      expect(screen.getByRole('button', { name: '旋風BF' })).toHaveClass(
        'active'
      );

      expect(screen.getByText('勝利数:代行天使=1')).toBeInTheDocument();
      expect(screen.getByText('敗北数:代行天使=0')).toBeInTheDocument();
      expect(screen.getByText('引き分け数:代行天使=0')).toBeInTheDocument();
    });
    it('旋風BF勝ち代行天使負けの戦績のみ存在する場合の代行天使個別戦績: 旋風BFに対する勝率0%勝利数0敗北数1引き分け数0', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: '代行天使' }));

      expect(screen.getByRole('button', { name: '代行天使' })).toHaveClass(
        'active'
      );

      expect(screen.getByText('勝利数:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('敗北数:旋風BF=1')).toBeInTheDocument();
      expect(screen.getByText('引き分け数:旋風BF=0')).toBeInTheDocument();
    });
    it('戦績が旋風BF勝ちと代行天使負け、旋風BF勝ちとヒーロービート負け、代行天使勝ちとヒーロービート負けの場合の代行天使の個別戦績: 旋風BFに対する勝率0%勝利数0敗北数1引き分け数0、ヒーロービートに対する勝率100%勝利数1敗北数0引き分け数0', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 3, 2: 1 },
              duels: [
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 1000, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 2, 2: 3 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
            { id: 3, name: 'ヒーロービート' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: '代行天使' }));

      expect(screen.getByRole('button', { name: '代行天使' })).toHaveClass(
        'active'
      );

      expect(screen.getByText('勝利数:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('勝利数:ヒーロービート=1')).toBeInTheDocument();
      expect(screen.getByText('敗北数:旋風BF=1')).toBeInTheDocument();
      expect(screen.getByText('敗北数:ヒーロービート=0')).toBeInTheDocument();
      expect(screen.getByText('引き分け数:旋風BF=0')).toBeInTheDocument();
      expect(
        screen.getByText('引き分け数:ヒーロービート=0')
      ).toBeInTheDocument();
    });
  });
});

describe('勝率グラフ', () => {
  describe('サマリー', () => {
    it('戦績が空の場合、グラフは空', async () => {
      render(
        <Stats
          results={[]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.selectOptions(screen.getByRole('combobox'), '勝率');

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝率');

      expect(screen.queryByText(/.*:.*=/)).not.toBeInTheDocument();
    });
    it('旋風BF対代行天使oo-の戦績のみ存在する場合、旋風BFの勝率は100%、代行天使の勝率は0%', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );

      await user.selectOptions(screen.getByRole('combobox'), '勝率');

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝率');

      expect(screen.getByText('勝率:旋風BF=100')).toBeInTheDocument();
      expect(screen.getByText('勝率:代行天使=0')).toBeInTheDocument();
    });
    it('戦績が旋風BF勝ちと代行天使負け、旋風BF勝ちとヒーロービート負け、代行天使勝ちとヒーロービート負けの場合、旋風BFの勝率は100%で勝利数2敗北数0引き分け数0、代行天使の勝率は50%、ヒーロービートの勝率は0%', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 3, 2: 1 },
              duels: [
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 1000, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 2, 2: 3 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
            { id: 3, name: 'ヒーロービート' },
          ]}
        />
      );
      await user.selectOptions(screen.getByRole('combobox'), '勝率');

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝率');

      expect(screen.getByText('勝率:旋風BF=100')).toBeInTheDocument();
      expect(screen.getByText('勝率:代行天使=50')).toBeInTheDocument();
      expect(screen.getByText('勝率:ヒーロービート=0')).toBeInTheDocument();
    });
    it('旋風BFと代行天使で引き分けの戦績のみ存在する場合、旋風BFの勝率は0%、代行天使の勝率は0%', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
                { 1: { lp: 0, isFirst: true }, 2: { lp: 0, isFirst: false } },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );

      await user.selectOptions(screen.getByRole('combobox'), '勝率');

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝率');

      expect(screen.getByText('勝率:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('勝率:代行天使=0')).toBeInTheDocument();
    });
    it('ミラーマッチの戦績のみ存在する場合、戦績は空', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 1 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '旋風BF' },
          ]}
        />
      );
      await user.selectOptions(screen.getByRole('combobox'), '勝率');

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝率');

      expect(screen.queryByText(/.*:.*=/)).not.toBeInTheDocument();
    });
  });
  describe('個別', () => {
    it('戦績が空の場合、旋風BFの個別戦績グラフは空', async () => {
      render(
        <Stats
          results={[]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.click(screen.getByText('旋風BF'));
      await user.selectOptions(screen.getByRole('combobox'), '勝率');

      expect(screen.getByText('旋風BF')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝率');

      expect(screen.queryByText(/.*:.*=/)).not.toBeInTheDocument();
    });
    it('旋風BF勝ち代行天使負けの戦績のみ存在する場合の旋風BF個別戦績: 代行天使に対する勝率100%', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: '旋風BF' }));
      await user.selectOptions(screen.getByRole('combobox'), '勝率');

      expect(screen.getByRole('button', { name: '旋風BF' })).toHaveClass(
        'active'
      );
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝率');

      expect(screen.getByText('勝率:代行天使=100')).toBeInTheDocument();
    });
    it('旋風BF勝ち代行天使負けの戦績のみ存在する場合の代行天使個別戦績: 旋風BFに対する勝率0%', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: '代行天使' }));
      await user.selectOptions(screen.getByRole('combobox'), '勝率');

      expect(screen.getByRole('button', { name: '代行天使' })).toHaveClass(
        'active'
      );
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝率');

      expect(screen.getByText('勝率:旋風BF=0')).toBeInTheDocument();
    });
    it('戦績が旋風BF勝ちと代行天使負け、旋風BF勝ちとヒーロービート負け、代行天使勝ちとヒーロービート負けの場合の代行天使の個別戦績: 旋風BFに対する勝率0%、ヒーロービートに対する勝率100%', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 3, 2: 1 },
              duels: [
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 1000, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 2, 2: 3 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
            { id: 3, name: 'ヒーロービート' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: '代行天使' }));
      await user.selectOptions(screen.getByRole('combobox'), '勝率');

      expect(screen.getByRole('button', { name: '代行天使' })).toHaveClass(
        'active'
      );
      expect(screen.getByRole('combobox')).toHaveDisplayValue('勝率');

      expect(screen.getByText('勝率:旋風BF=0')).toBeInTheDocument();
      expect(screen.getByText('勝率:ヒーロービート=100')).toBeInTheDocument();
    });
  });
});

describe('先後別勝敗', () => {
  describe('サマリー', () => {
    it('戦績が空の場合、グラフは空', async () => {
      render(
        <Stats
          results={[]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.selectOptions(screen.getByRole('combobox'), '先後別勝敗');

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('先後別勝敗');

      expect(screen.queryByText(/.*:.*=/)).not.toBeInTheDocument();
    });
    it('旋風BF対代行天使で先o先x後oの戦績のみ存在する場合、旋風BFは先勝1先負1後勝1、代行天使は先負1後勝1後負1', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
                {
                  1: { lp: 3000, isFirst: false },
                  2: { lp: 0, isFirst: true },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );

      await user.selectOptions(screen.getByRole('combobox'), '先後別勝敗');

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('先後別勝敗');

      expect(screen.getByText('先勝:旋風BF=1')).toBeInTheDocument();
      expect(screen.getByText('先負:旋風BF=1')).toBeInTheDocument();
      expect(screen.getByText('後勝:旋風BF=1')).toBeInTheDocument();
      expect(screen.getByText('先負:代行天使=1')).toBeInTheDocument();
      expect(screen.getByText('後勝:代行天使=1')).toBeInTheDocument();
      expect(screen.getByText('後負:代行天使=1')).toBeInTheDocument();
    });
    it('ミラーマッチの勝敗は両方ともカウントされる', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 1 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
                {
                  1: { lp: 3000, isFirst: false },
                  2: { lp: 0, isFirst: true },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[{ id: 1, name: '旋風BF' }]}
        />
      );

      await user.selectOptions(screen.getByRole('combobox'), '先後別勝敗');

      expect(screen.getByText('サマリー')).toHaveClass('active');
      expect(screen.getByRole('combobox')).toHaveDisplayValue('先後別勝敗');

      expect(screen.getByText('先勝:旋風BF=1')).toBeInTheDocument();
      expect(screen.getByText('先負:旋風BF=2')).toBeInTheDocument();
      expect(screen.getByText('後勝:旋風BF=2')).toBeInTheDocument();
      expect(screen.getByText('後負:旋風BF=1')).toBeInTheDocument();
    });
  });
  describe('個別', () => {
    it('戦績が空の場合、旋風BFの個別戦績グラフは空', async () => {
      render(
        <Stats
          results={[]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: '旋風BF' }));
      await user.selectOptions(screen.getByRole('combobox'), '先後別勝敗');

      expect(screen.getByRole('button', { name: '旋風BF' })).toHaveClass(
        'active'
      );
      expect(screen.getByRole('combobox')).toHaveDisplayValue('先後別勝敗');

      expect(screen.queryByText(/.*:.*=/)).not.toBeInTheDocument();
    });
    it('旋風BF対代行天使で先o先x後oの戦績のみ存在する場合の旋風BF個別戦績: 代行天使に対して先勝1先負1後勝1', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
                {
                  1: { lp: 3000, isFirst: false },
                  2: { lp: 0, isFirst: true },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: '旋風BF' }));
      await user.selectOptions(screen.getByRole('combobox'), '先後別勝敗');

      expect(screen.getByRole('button', { name: '旋風BF' })).toHaveClass(
        'active'
      );
      expect(screen.getByRole('combobox')).toHaveDisplayValue('先後別勝敗');

      expect(screen.getByText('先勝:代行天使=1')).toBeInTheDocument();
      expect(screen.getByText('先負:代行天使=1')).toBeInTheDocument();
      expect(screen.getByText('後勝:代行天使=1')).toBeInTheDocument();
    });
    it('ミラーマッチの勝敗は両方ともカウントされる', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 1 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
                {
                  1: { lp: 3000, isFirst: false },
                  2: { lp: 0, isFirst: true },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
          ]}
          decks={[{ id: 1, name: '旋風BF' }]}
        />
      );
      await user.click(screen.getByRole('button', { name: '旋風BF' }));
      await user.selectOptions(screen.getByRole('combobox'), '先後別勝敗');

      expect(screen.getByRole('button', { name: '旋風BF' })).toHaveClass(
        'active'
      );
      expect(screen.getByRole('combobox')).toHaveDisplayValue('先後別勝敗');

      expect(screen.getByText('先勝:旋風BF=1')).toBeInTheDocument();
      expect(screen.getByText('先負:旋風BF=2')).toBeInTheDocument();
      expect(screen.getByText('後勝:旋風BF=2')).toBeInTheDocument();
      expect(screen.getByText('後負:旋風BF=1')).toBeInTheDocument();
    });
  });
});

describe('リーセント表', () => {
  describe('サマリー', () => {
    it('新しいゲームから順に表示される', () => {
      render(
        <Stats
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 100, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 200, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 2, 2: 1 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-10-23 08:45',
            },
          ]}
        />
      );

      const rows = screen.getAllByTestId('recent-row');
      expect(within(rows[0]).getByText('2')).toBeInTheDocument();
      expect(within(rows[1]).getByText('1')).toBeInTheDocument();
    });

    it('日時列はyyyy年MM月HH:mmの形式で表示される', () => {
      render(
        <Stats
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 100, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 200, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:09',
            },
          ]}
        />
      );

      const row = within(screen.getByTestId('recent-row'));
      expect(row.getByText('2022年09月23日08:09')).toBeInTheDocument();
    });

    it('結果列にはデッキ名をヘッダー、各デュエル結果を行とする表が表示される', () => {
      render(
        <Stats
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 100, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: false },
                  2: { lp: 200, isFirst: true },
                },
                {
                  1: { lp: 1000, isFirst: false },
                  2: { lp: 0, isFirst: true },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:09',
            },
          ]}
        />
      );

      const row = within(screen.getByTestId('recent-row'));
      const resultRows = row.getAllByRole('row');
      const resultHeader = within(resultRows[0]);
      expect(resultHeader.getAllByRole('cell')[0]).toHaveTextContent('旋風BF');
      expect(resultHeader.getAllByRole('cell')[1]).toHaveTextContent(
        '代行天使'
      );
      const firstDuel = within(resultRows[1]);
      expect(firstDuel.getAllByRole('cell')[0]).toHaveTextContent('100[先]');
      expect(firstDuel.getAllByRole('cell')[1]).toHaveTextContent('0[後]');
      const secondDuel = within(resultRows[2]);
      expect(secondDuel.getAllByRole('cell')[0]).toHaveTextContent('0[後]');
      expect(secondDuel.getAllByRole('cell')[1]).toHaveTextContent('200[先]');
      const thirdDuel = within(resultRows[3]);
      expect(thirdDuel.getAllByRole('cell')[0]).toHaveTextContent('1000[後]');
      expect(thirdDuel.getAllByRole('cell')[1]).toHaveTextContent('0[先]');
    });
  });

  describe('個別', () => {
    it('戦績が空の場合、旋風BFのリーセント表は空', async () => {
      render(
        <Stats
          results={[]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
          ]}
        />
      );
      await user.click(screen.getByText('旋風BF'));

      expect(screen.getByText('旋風BF')).toHaveClass('active');
      expect(screen.queryByTestId('recent-row')).not.toBeInTheDocument();
    });
    it('旋風BF対代行天使の試合と代行天使対ヒーロービートの試合が記録されている場合、ヒーロービートのリーセント表には代行天使対ヒーロービートの試合のみ表示され番号列の値は1となる', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 2, 2: 3 },
              duels: [
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 1000, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-10-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
            { id: 3, name: 'ヒーロービート' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: 'ヒーロービート' }));

      expect(
        screen.getByRole('button', { name: 'ヒーロービート' })
      ).toHaveClass('active');
      const row = within(screen.getByTestId('recent-row'));
      expect(row.getByText('1')).toBeInTheDocument();
      expect(row.queryByText('2')).not.toBeInTheDocument();
      expect(row.getByText('2022年10月23日08:45')).toBeInTheDocument();
      expect(row.getByText('ヒーロービート')).toBeInTheDocument();
      expect(row.queryByText('旋風BF')).not.toBeInTheDocument();
      expect(row.getByText('代行天使')).toBeInTheDocument();
    });
    it('代行天使のリーセント表の各結果表の1列目は代行天使である', async () => {
      render(
        <Stats
          results={[
            {
              decks: { 1: 1, 2: 2 },
              duels: [
                {
                  1: { lp: 1000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
                {
                  1: { lp: 2000, isFirst: true },
                  2: { lp: 0, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-09-23 08:45',
            },
            {
              decks: { 1: 2, 2: 3 },
              duels: [
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 1000, isFirst: false },
                },
                {
                  1: { lp: 0, isFirst: true },
                  2: { lp: 2000, isFirst: false },
                },
              ],
              format: 'Match',
              datetime: '2022-10-23 08:45',
            },
          ]}
          decks={[
            { id: 1, name: '旋風BF' },
            { id: 2, name: '代行天使' },
            { id: 3, name: 'ヒーロービート' },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: '代行天使' }));

      expect(screen.getByRole('button', { name: '代行天使' })).toHaveClass(
        'active'
      );
      const recentRows = screen.getAllByTestId('recent-row');
      expect(
        within(within(recentRows[0]).getAllByRole('row')[0]).getAllByRole(
          'cell'
        )[0]
      ).toHaveTextContent('代行天使');
      expect(
        within(within(recentRows[1]).getAllByRole('row')[0]).getAllByRole(
          'cell'
        )[0]
      ).toHaveTextContent('代行天使');
    });
  });
});
