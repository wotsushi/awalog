import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from 'firebase/auth';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useDecks, useUser } from 'lib/firebase';
import { Deck } from 'lib/result';

import OriginalLP from '.';

jest.mock('lib/firebase');
const useDecksMock = useDecks as jest.MockedFunction<typeof useDecks>;
const useUserMock = useUser as jest.MockedFunction<typeof useUser>;

type Props = {
  decks?: Deck[];
  user?: User;
};

const LP = ({
  decks = [
    { id: 1, name: '旋風BF' },
    { id: 2, name: '代行天使' },
  ],
  user = { emailVerified: true } as User,
}: Props) => {
  useDecksMock.mockReturnValue(decks);
  useUserMock.mockReturnValue(user);
  return (
    <MemoryRouter>
      <OriginalLP />
    </MemoryRouter>
  );
};

const user = userEvent.setup();
const side1p = () => within(screen.getByTestId('side-1p'));
const side2p = () => within(screen.getByTestId('side-2p'));

describe('初期状態', () => {
  it('初期状態ではデッキ切れ、undo/redoボタンは非活性化状態である', () => {
    render(<LP />);

    expect(screen.getByRole('button', { name: 'デッキ切れ' })).toBeDisabled();
    expect(screen.getByText('戻る')).toBeDisabled();
    expect(screen.getByText('進む')).toBeDisabled();
  });
  it('初期状態の選択中デッキはデッキ一覧の先頭である', () => {
    render(<LP />);

    expect(side1p().getByRole('combobox')).toHaveDisplayValue('旋風BF');
    expect(side2p().getByRole('combobox')).toHaveDisplayValue('旋風BF');
  });
  it('初期状態のLPは8000である', () => {
    render(<LP />);

    expect(side1p().getByText('8000')).toBeInTheDocument();
    expect(side2p().getByText('8000')).toBeInTheDocument();
  });
  it('初期状態のログは空である', async () => {
    render(<LP />);

    await user.click(screen.getByText('ログ'));

    expect(screen.queryByTestId('modal-log')).not.toBeInTheDocument();
  });
  it('初期状態ではお互い後攻である', () => {
    render(<LP />);

    expect(side1p().getByText('後攻')).toBeInTheDocument();
    expect(side2p().getByText('後攻')).toBeInTheDocument();
  });
  it('初期状態ではライフ計算ボタンは非活性化状態である', () => {
    render(<LP />);

    side1p()
      .getAllByRole('button')
      .forEach((button) => {
        expect(button).toBeDisabled();
      });
    side2p()
      .getAllByRole('button')
      .forEach((button) => {
        expect(button).toBeDisabled();
      });
  });
});

describe('先攻後攻選択', () => {
  it('初期状態で1Pの先行後攻スイッチをクリックすると1Pは先攻となり2Pは後攻のまま', async () => {
    render(<LP />);

    expect(side1p().getByText('後攻')).toBeInTheDocument();
    expect(side2p().getByText('後攻')).toBeInTheDocument();

    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    expect(side1p().getByText('先攻')).toBeInTheDocument();
    expect(side2p().getByText('後攻')).toBeInTheDocument();
  });
  it('初期状態で2Pの先行後攻スイッチをクリックすると2Pは先攻となり1Pは後攻のまま', async () => {
    render(<LP />);

    expect(side1p().getByText('後攻')).toBeInTheDocument();
    expect(side2p().getByText('後攻')).toBeInTheDocument();

    await user.click(side2p().getByRole('checkbox', { name: 'switch' }));

    expect(side1p().getByText('後攻')).toBeInTheDocument();
    expect(side2p().getByText('先攻')).toBeInTheDocument();
  });
  it('1Pが先攻の状態で1Pの先攻後攻スイッチをクリックすると1Pは後攻になる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    expect(side1p().getByText('先攻')).toBeInTheDocument();

    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    expect(side1p().getByText('後攻')).toBeInTheDocument();
  });
  it('初期状態で1Pの先攻後攻スイッチをクリックするとライフ計算ボタンは活性化状態になる', async () => {
    render(<LP />);

    side1p()
      .getAllByRole('button')
      .forEach((button) => expect(button).toBeDisabled());

    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    side1p()
      .getAllByRole('button')
      .forEach((button) => expect(button).toBeEnabled());
  });
});

describe('LP計算', () => {
  describe('クイックLP減算', () => {
    it('お互いのLPが8000の状態で1PのLPを-1000すると1PのLPが7000になる。2PのLPは8000のまま', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();

      await user.click(side1p().getByText('-1000'));

      expect(side1p().getByText('7000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();
    });
    it('お互いのLPが8000の状態で2PのLPを-2000すると1PのLPは8000のままだが2PのLPは6000になる', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();

      await user.click(side2p().getByText('-2000'));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('6000')).toBeInTheDocument();
    });
    it('1PのLPが2000の状態で1PのLPを-3000すると1PのLPは0になる（マイナスにはならない）', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side1p().getByText('-3000'));
      await user.click(side1p().getByText('-3000'));

      expect(side1p().getByText('2000')).toBeInTheDocument();

      await user.click(side1p().getByText('-3000'));

      expect(side1p().getByText('0')).toBeInTheDocument();
    });
  });
  describe('LP加算', () => {
    it('お互いがnormalモードで1Pの+キーを押すと1P側はテンキー配置になる。2Pはそのまま', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('-100')).toBeInTheDocument();
      expect(side1p().queryByText('7')).not.toBeInTheDocument();
      expect(side2p().getByText('-100')).toBeInTheDocument();
      expect(side2p().queryByText('7')).not.toBeInTheDocument();

      await user.click(side1p().getByText('＋'));

      expect(side1p().queryByText('-100')).not.toBeInTheDocument();
      expect(side1p().getByText('7')).toBeInTheDocument();
      expect(side2p().getByText('-100')).toBeInTheDocument();
      expect(side2p().queryByText('7')).not.toBeInTheDocument();
    });
    it('LPが8000の状態で+1234を入力するとLP欄に8000+1234が表示される', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();

      await user.click(side1p().getByText('＋'));
      await user.click(side1p().getByText('1'));
      await user.click(side1p().getByText('2'));
      await user.click(side1p().getByText('3'));
      await user.click(side1p().getByText('4'));

      expect(side1p().getByText('8000+1234')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();
    });
    it('お互いのLPが8000の状態で1PのLPを+1234すると1PのLPは9234になる。2Pは8000のまま', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();

      await user.click(side1p().getByText('＋'));
      await user.click(side1p().getByText('1'));
      await user.click(side1p().getByText('2'));
      await user.click(side1p().getByText('3'));
      await user.click(side1p().getByText('4'));
      await user.click(side1p().getByText('='));

      expect(side1p().getByText('9234')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();
    });
    it('LP加算後はnormalモードに戻る', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side1p().getByText('＋'));

      expect(side1p().queryByText('-100')).not.toBeInTheDocument();
      expect(side1p().getByText('7')).toBeInTheDocument();

      await user.click(side1p().getByText('1'));
      await user.click(side1p().getByText('='));

      expect(side1p().getByText('-100')).toBeInTheDocument();
      expect(side1p().queryByText('7')).not.toBeInTheDocument();
    });
    it('お互いのLPが8000の状態で2PのLPを+9000すると1PのLPは8000のままだが2PのLPは17000になる', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();

      await user.click(side2p().getByText('＋'));
      await user.click(side2p().getByText('9'));
      await user.click(side2p().getByText('0'));
      await user.click(side2p().getByText('00'));
      await user.click(side2p().getByText('='));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('17000')).toBeInTheDocument();
    });

    it('LPが8000の状態で+100000すると1PのLPは108000になる（LPに上限はない）', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();

      await user.click(side1p().getByText('＋'));
      await user.click(side1p().getByText('1'));
      await user.click(side1p().getByText('00'));
      await user.click(side1p().getByText('00'));
      await user.click(side1p().getByText('0'));
      await user.click(side1p().getByText('='));

      expect(side1p().getByText('108000')).toBeInTheDocument();
    });
  });
  describe('LP減算', () => {
    it('お互いがnormalモードで1Pの-キーを押すと1P側はテンキー配置になる。2Pはそのまま', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('-100')).toBeInTheDocument();
      expect(side1p().queryByText('7')).not.toBeInTheDocument();
      expect(side2p().getByText('-100')).toBeInTheDocument();
      expect(side2p().queryByText('7')).not.toBeInTheDocument();

      await user.click(screen.getAllByText('−')[0]);

      expect(side1p().queryByText('-100')).not.toBeInTheDocument();
      expect(side1p().getByText('7')).toBeInTheDocument();
      expect(side2p().getByText('-100')).toBeInTheDocument();
      expect(side2p().queryByText('7')).not.toBeInTheDocument();
    });
    it('LPが8000の状態で-1234を入力するとLP欄に8000-1234が表示される', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();

      await user.click(side1p().getByText('−'));
      await user.click(side1p().getByText('1'));
      await user.click(side1p().getByText('2'));
      await user.click(side1p().getByText('3'));
      await user.click(side1p().getByText('4'));

      expect(side1p().getByText('8000-1234')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();
    });
    it('お互いのLPが8000の状態で1PのLPを-1234すると1PのLPは6766になる。2Pは8000のまま', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();

      await user.click(side1p().getByText('−'));
      await user.click(side1p().getByText('1'));
      await user.click(side1p().getByText('2'));
      await user.click(side1p().getByText('3'));
      await user.click(side1p().getByText('4'));
      await user.click(side1p().getByText('='));

      expect(side1p().getByText('6766')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();
    });
    it('LP減算後はnormalモードに戻る', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side1p().getByText('−'));

      expect(side1p().queryByText('-100')).not.toBeInTheDocument();
      expect(side1p().getByText('7')).toBeInTheDocument();

      await user.click(side1p().getByText('1'));
      await user.click(side1p().getByText('='));

      expect(side1p().getByText('-100')).toBeInTheDocument();
      expect(side1p().queryByText('7')).not.toBeInTheDocument();
    });
    it('お互いのLPが8000の状態で2PのLPを-1すると1PのLPは8000のままだが2PのLPは7999になる', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();

      await user.click(side2p().getByText('−'));
      await user.click(side2p().getByText('1'));
      await user.click(side2p().getByText('='));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('7999')).toBeInTheDocument();
    });
    it('LPが1233の状態でLPを-1234するとLPは0になる（マイナスにはならない）', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side1p().getByText('−'));
      await user.click(screen.getByText('6'));
      await user.click(screen.getByText('7'));
      await user.click(screen.getByText('6'));
      await user.click(screen.getByText('7'));
      await user.click(side1p().getByText('='));

      expect(side1p().getByText('1233')).toBeInTheDocument();

      await user.click(side1p().getByText('−'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('3'));
      await user.click(screen.getByText('4'));
      await user.click(screen.getByText('='));

      expect(side1p().getByText('0')).toBeInTheDocument();
    });
  });
  describe('加減算モードのキャンセル', () => {
    it('加算モードでキャンセルするとnormalモードになる', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side1p().getByText('＋'));

      expect(side1p().queryByText('-100')).not.toBeInTheDocument();
      expect(side1p().getByText('7')).toBeInTheDocument();

      await user.click(side1p().getByText('Ｃ'));

      expect(side1p().getByText('-100')).toBeInTheDocument();
      expect(side1p().queryByText('7')).not.toBeInTheDocument();
    });
    it('減算モードでLP入力中にキャンセルするとnormalモードになり入力していたLPもクリアされる', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side2p().getByText('−'));
      await user.click(side2p().getByText('1'));

      expect(side2p().getByText('8000-1')).toBeInTheDocument();
      expect(side2p().queryByText('-100')).not.toBeInTheDocument();
      expect(side2p().getByText('7')).toBeInTheDocument();

      await user.click(side2p().getByText('Ｃ'));

      expect(side2p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('-100')).toBeInTheDocument();
      expect(side2p().queryByText('7')).not.toBeInTheDocument();
    });
    it('1Pが加算モード、2Pが減算モードの状態で2P側をキャンセルすると1Pは加算モードのままだが2Pはnormalモードになる', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side1p().getByText('＋'));
      await user.click(side1p().getByText('1'));
      await user.click(side2p().getByText('−'));
      await user.click(side2p().getByText('2'));

      expect(side1p().getByText('8000+1')).toBeInTheDocument();
      expect(side1p().queryByText('-100')).not.toBeInTheDocument();
      expect(side1p().getByText('7')).toBeInTheDocument();
      expect(side2p().getByText('8000-2')).toBeInTheDocument();
      expect(side2p().queryByText('-100')).not.toBeInTheDocument();
      expect(side2p().getByText('7')).toBeInTheDocument();

      await user.click(side2p().getByText('Ｃ'));

      expect(side1p().getByText('8000+1')).toBeInTheDocument();
      expect(side1p().queryByText('-100')).not.toBeInTheDocument();
      expect(side1p().getByText('7')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('-100')).toBeInTheDocument();
      expect(side2p().queryByText('7')).not.toBeInTheDocument();
    });
    it('加算モードでLP入力中にキャンセルし加算モードに戻ると入力したLPはクリアされる', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side1p().getByText('＋'));
      await user.click(side1p().getByText('1'));

      expect(side1p().getByText('8000+1')).toBeInTheDocument();

      await user.click(side1p().getByText('Ｃ'));
      await user.click(side1p().getByText('＋'));

      expect(side1p().getByText('8000')).toBeInTheDocument();
    });
  });
  describe('LP半分', () => {
    it('お互いのLPが8000の状態で1PのLPを半分にすると1PのLPは4000になる。2PのLPは8000のまま', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();

      await user.click(side1p().getByText('÷2'));

      expect(side1p().getByText('4000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();
    });
    it('お互いのLPが8000の状態で2PのLPを半分にすると1PのLPは8000のままだが2PのLPは4000になる', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('8000')).toBeInTheDocument();

      await user.click(side2p().getByText('÷2'));

      expect(side1p().getByText('8000')).toBeInTheDocument();
      expect(side2p().getByText('4000')).toBeInTheDocument();
    });
    it('LPが奇数の状態でLPを半分にするとLPは切り上げられる', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side1p().getByText('−'));
      await user.click(side1p().getByText('1'));
      await user.click(side1p().getByText('='));

      expect(side1p().getByText('7999')).toBeInTheDocument();

      await user.click(side1p().getByText('÷2'));

      expect(side1p().getByText('4000')).toBeInTheDocument();
    });
    it('LPが1の状態でLPを半分にしてもLPは1のまま', async () => {
      render(<LP />);
      await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
      await user.click(side1p().getByText('−'));
      await user.click(side1p().getByText('7'));
      await user.click(side1p().getByText('9'));
      await user.click(side1p().getByText('9'));
      await user.click(side1p().getByText('9'));
      await user.click(side1p().getByText('='));

      expect(side1p().getByText('1')).toBeInTheDocument();

      await user.click(side1p().getByText('÷2'));

      expect(side1p().getByText('1')).toBeInTheDocument();
    });
  });
});

describe('ログ', () => {
  it('初期状態で1PのLPを減算すると1Pの減算ログが追加される', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.selectOptions(side2p().getByRole('combobox'), '代行天使');
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.queryByTestId('modal-log')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Close'));
    await user.click(side1p().getByText('-1000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByTestId('modal-log')).toBeInTheDocument();
    expect(screen.getByTestId('modal-log')).toHaveTextContent('旋風BF (1P)');
    expect(screen.getByTestId('modal-log')).toHaveTextContent(
      '8000 → 7000 (-1000)'
    );
  });
  it('初期状態で2PのLPを加算すると2Pの加算ログが追加される', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.selectOptions(side2p().getByRole('combobox'), '代行天使');
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.queryByTestId('modal-log')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Close'));
    await user.click(side2p().getByText('＋'));
    await user.click(side2p().getByText('1'));
    await user.click(side2p().getByText('='));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.getByTestId('modal-log')).toBeInTheDocument();
    expect(screen.getByTestId('modal-log')).toHaveTextContent('代行天使 (2P)');
    expect(screen.getByTestId('modal-log')).toHaveTextContent(
      '8000 → 8001 (+1)'
    );
  });
  it('初期状態で1PのLPを減算した後に2PのLPを加算すると2P加算、1P減算の順でログが表示される', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.selectOptions(side2p().getByRole('combobox'), '代行天使');
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.queryByTestId('modal-log')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Close'));
    await user.click(side1p().getByText('-1000'));
    await user.click(side2p().getByText('＋'));
    await user.click(side2p().getByText('1'));
    await user.click(side2p().getByText('='));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '代行天使 (2P)'
    );
    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '8000 → 8001 (+1)'
    );
    expect(screen.getAllByTestId('modal-log')[1]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[1]).toHaveTextContent(
      '8000 → 7000 (-1000)'
    );
  });
  it('LPを半減するとLPの半分に対応する減算としてログに記録される', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.queryByTestId('modal-log')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Close'));
    await user.click(side1p().getByText('÷2'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.getByTestId('modal-log')).toHaveTextContent('旋風BF (1P)');
    expect(screen.getByTestId('modal-log')).toHaveTextContent(
      '8000 → 4000 (-4000)'
    );
  });
  it('LPを10回減算した後にさらにもう一度LPを減算すると最初の減算ログは表示されない（直近10件の減算ログのみ表示される）', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getAllByText('-100')[0]);
    await user.click(side1p().getAllByText('-200')[0]);
    await user.click(side1p().getAllByText('-300')[0]);
    await user.click(side1p().getAllByText('-400')[0]);
    await user.click(side1p().getAllByText('-500')[0]);
    await user.click(side1p().getAllByText('-600')[0]);
    await user.click(side1p().getAllByText('-700')[0]);
    await user.click(side1p().getAllByText('-800')[0]);
    await user.click(side1p().getAllByText('-900')[0]);
    await user.click(side1p().getAllByText('-1000')[0]);
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.getAllByTestId('modal-log')).toHaveLength(10);
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '8000 → 7900 (-100)'
    );

    await user.click(screen.getByLabelText('Close'));
    await user.click(side1p().getByText('-2000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.getAllByTestId('modal-log')).toHaveLength(10);
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '7900 → 7700 (-200)'
    );
  });
  it('1PのLPを減算した後に1Pのデッキを変更すると変更後のデッキで減算ログが表示される', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.getByTestId('modal-log')).toHaveTextContent('旋風BF (1P)');
    expect(screen.getByTestId('modal-log')).toHaveTextContent(
      '8000 → 7000 (-1000)'
    );

    await user.click(screen.getByLabelText('Close'));
    await user.selectOptions(side1p().getByRole('combobox'), '代行天使');
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.getByTestId('modal-log')).toHaveTextContent('代行天使 (1P)');
    expect(screen.getByTestId('modal-log')).toHaveTextContent(
      '8000 → 7000 (-1000)'
    );
  });
  it('1PのLPを減算した後に2PのLPを減算すると2PのLP減算ログが色塗りされて表示される', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.queryByTestId('modal-log')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Close'));
    await user.click(side1p().getByText('-1000'));
    await user.click(side2p().getByText('-2000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')[0]).toHaveClass(
      'list-group-item-dark'
    );
    expect(screen.getAllByTestId('modal-log')[1]).not.toHaveClass(
      'list-group-item-dark'
    );
  });
});

describe('リセット', () => {
  it('1PのLPが7000, 2PのLPが6000の状態でリセットすると両者のLPは8000になる', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(side2p().getByText('-2000'));
    expect(side1p().getByText('7000')).toBeInTheDocument();
    expect(side2p().getByText('6000')).toBeInTheDocument();

    await user.click(screen.getByText('リセット'));
    await user.click(screen.getByText('はい'));

    expect(side1p().getByText('8000')).toBeInTheDocument();
    expect(side2p().getByText('8000')).toBeInTheDocument();
  });
  it('1PのLPが7000, 2PのLPが6000の状態でリセットをキャンセルすると1PのLPは7000, 2PのLPは6000のまま', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(side2p().getByText('-2000'));

    expect(side1p().getByText('7000')).toBeInTheDocument();
    expect(side2p().getByText('6000')).toBeInTheDocument();

    await user.click(screen.getByText('リセット'));
    await user.click(screen.getByText('いいえ'));

    expect(side1p().getByText('7000')).toBeInTheDocument();
    expect(side2p().getByText('6000')).toBeInTheDocument();
  });
  it('1Pのデッキを旋風BF（初期状態）から代行天使に変更した状態でリセットしても1Pのデッキは旋風BFのまま', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.selectOptions(side1p().getByRole('combobox'), '代行天使');
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    expect(side1p().getByRole('combobox')).toHaveDisplayValue('代行天使');

    await user.click(screen.getByText('リセット'));
    await user.click(screen.getByText('はい'));

    expect(side1p().getByRole('combobox')).toHaveDisplayValue('代行天使');
  });
  it('LP減算ログが記録されている状態でリセットするとログは空になる', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.getByTestId('modal-log')).toHaveTextContent('旋風BF (1P)');
    expect(screen.getByTestId('modal-log')).toHaveTextContent(
      '8000 → 7000 (-1000)'
    );

    await user.click(screen.getByLabelText('Close'));
    await user.click(screen.getByText('リセット'));
    await user.click(screen.getByText('はい'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.queryByTestId('modal-log')).not.toBeInTheDocument();
  });
  it('LP減算ログが記録されている状態でリセットをキャンセルするとLP減算ログは残ったまま', async () => {
    render(
      <LP
        decks={[
          { id: 1, name: '旋風BF' },
          { id: 2, name: '代行天使' },
        ]}
      />
    );
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByText('ライフポイント変動ログ')).toBeInTheDocument();
    expect(screen.getByTestId('modal-log')).toHaveTextContent('旋風BF (1P)');
    expect(screen.getByTestId('modal-log')).toHaveTextContent(
      '8000 → 7000 (-1000)'
    );

    await user.click(screen.getByLabelText('Close'));
    await user.click(screen.getByText('リセット'));
    await user.click(screen.getByText('いいえ'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByTestId('modal-log')).toHaveTextContent('旋風BF (1P)');
    expect(screen.getByTestId('modal-log')).toHaveTextContent(
      '8000 → 7000 (-1000)'
    );
  });
});

describe('デッキ切れ', () => {
  it('先攻未選択の場合、デッキ切れをチェックをしてもデッキ切れボタンは非活性', async () => {
    render(<LP />);

    expect(screen.getByRole('button', { name: 'デッキ切れ' })).toBeDisabled();

    await user.click(side1p().getByRole('checkbox', { name: 'lo' }));

    expect(screen.getByRole('button', { name: 'デッキ切れ' })).toBeDisabled();
  });
  it('先攻選択した状態で1Pのデッキ切れをチェックするとデッキ切れボタンは活性化', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    expect(screen.getByRole('button', { name: 'デッキ切れ' })).toBeDisabled();

    await user.click(side1p().getByRole('checkbox', { name: 'lo' }));

    expect(screen.getByRole('button', { name: 'デッキ切れ' })).toBeEnabled();
  });
  it('先攻選択した状態で2Pのデッキ切れをチェックするとデッキ切れボタンは活性化', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    expect(screen.getByRole('button', { name: 'デッキ切れ' })).toBeDisabled();

    await user.click(side2p().getByRole('checkbox', { name: 'lo' }));

    expect(screen.getByRole('button', { name: 'デッキ切れ' })).toBeEnabled();
  });
  it('先攻選択した状態で1Pと2Pのデッキ切れをチェックするとデッキ切れボタンは活性化', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    expect(screen.getByRole('button', { name: 'デッキ切れ' })).toBeDisabled();

    await user.click(side1p().getByRole('checkbox', { name: 'lo' }));
    await user.click(side2p().getByRole('checkbox', { name: 'lo' }));

    expect(screen.getByRole('button', { name: 'デッキ切れ' })).toBeEnabled();
  });
  it('マッチ1戦目でデッキ切れボタンをクリックするとデュエル終了モーダルが表示がされる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByRole('checkbox', { name: 'lo' }));

    expect(screen.queryByText('デュエル終了')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'デッキ切れ' }));

    expect(screen.getByText('デュエル終了')).toBeInTheDocument();
  });
  it('マッチ最終戦でデッキ切れボタンをクリックすると保存確認モーダルが表示がされる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByRole('checkbox', { name: 'lo' }));
    await user.click(screen.getByRole('button', { name: 'デッキ切れ' }));
    await user.click(screen.getByText('はい'));
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByRole('checkbox', { name: 'lo' }));

    expect(screen.queryByText('保存確認')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'デッキ切れ' }));

    expect(screen.getByText('保存確認')).toBeInTheDocument();
  });
});

describe('戻る', () => {
  it('初期状態から1PのLPを-1000した後に戻るを押すと1PのLPは8000に戻る', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));

    expect(side1p().getByText('7000')).toBeInTheDocument();

    await user.click(screen.getByText('戻る'));

    expect(side1p().getByText('8000')).toBeInTheDocument();
  });
  it('初期状態から1PのLPを-1000した後に戻るを押すと戻るボタンは非活性になる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));

    expect(screen.getByText('戻る')).toBeEnabled();

    await user.click(screen.getByText('戻る'));

    expect(screen.getByText('戻る')).toBeDisabled();
  });
  it('初期状態から1PのLPを-1000しさらに2PのLPを-2000した後に戻るを押すと1PのLPは7000のままだが2PのLPは8000に戻る', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(side2p().getByText('-2000'));

    expect(side1p().getByText('7000')).toBeInTheDocument();
    expect(side2p().getByText('6000')).toBeInTheDocument();

    await user.click(screen.getByText('戻る'));

    expect(side1p().getByText('7000')).toBeInTheDocument();
    expect(side2p().getByText('8000')).toBeInTheDocument();
  });
  it('初期状態から1PのLPを-1000しさらに2PのLPを-2000した後に戻るを2回押すと1Pと2PのLPは8000に戻る', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(side2p().getByText('-2000'));

    expect(side1p().getByText('7000')).toBeInTheDocument();
    expect(side2p().getByText('6000')).toBeInTheDocument();

    await user.click(screen.getByText('戻る'));
    await user.click(screen.getByText('戻る'));

    expect(side1p().getByText('8000')).toBeInTheDocument();
    expect(side2p().getByText('8000')).toBeInTheDocument();
  });
  it('初期状態からLPを減算した後に戻るを押すとログは残ったままだが色塗りはされていない', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByTestId('modal-log')).toHaveClass('list-group-item-dark');

    await user.click(screen.getByLabelText('Close'));
    await user.click(screen.getByText('戻る'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByTestId('modal-log')).not.toHaveClass(
      'list-group-item-dark'
    );
  });
  it('初期状態からLPを2回減算した後に戻るを押すとログは2つ表示されたままだが1回目の減算ログが色塗りされる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(side2p().getByText('-2000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')).toHaveLength(2);
    expect(screen.getAllByTestId('modal-log')[0]).toHaveClass(
      'list-group-item-dark'
    );
    expect(screen.getAllByTestId('modal-log')[1]).not.toHaveClass(
      'list-group-item-dark'
    );

    await user.click(screen.getByLabelText('Close'));
    await user.click(screen.getByText('戻る'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')).toHaveLength(2);
    expect(screen.getAllByTestId('modal-log')[0]).not.toHaveClass(
      'list-group-item-dark'
    );
    expect(screen.getAllByTestId('modal-log')[1]).toHaveClass(
      'list-group-item-dark'
    );
  });
  it('LPを11回減算した後に戻るを押すと直近10件の減算ログのみ表示され最新の一つ前の減算ログが色塗りされる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-100'));
    await user.click(side1p().getByText('-200'));
    await user.click(side1p().getByText('-300'));
    await user.click(side1p().getByText('-400'));
    await user.click(side1p().getByText('-500'));
    await user.click(side1p().getByText('-600'));
    await user.click(side1p().getByText('-700'));
    await user.click(side1p().getByText('-800'));
    await user.click(side1p().getByText('-900'));
    await user.click(side1p().getByText('-1000'));
    await user.click(side1p().getByText('-2000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')).toHaveLength(10);
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '7900 → 7700 (-200)'
    );
    expect(screen.getAllByTestId('modal-log')[0]).toHaveClass(
      'list-group-item-dark'
    );
    expect(screen.getAllByTestId('modal-log')[1]).not.toHaveClass(
      'list-group-item-dark'
    );

    await user.click(screen.getByLabelText('Close'));
    await user.click(screen.getByText('戻る'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')).toHaveLength(10);
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '7900 → 7700 (-200)'
    );
    expect(screen.getAllByTestId('modal-log')[0]).not.toHaveClass(
      'list-group-item-dark'
    );
    expect(screen.getAllByTestId('modal-log')[1]).toHaveClass(
      'list-group-item-dark'
    );
  });
  it('LPを11回減算した後に戻るを9回押すと最新のLP減算ログを除いた10件が表示される', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-100'));
    await user.click(side1p().getByText('-200'));
    await user.click(side1p().getByText('-300'));
    await user.click(side1p().getByText('-400'));
    await user.click(side1p().getByText('-500'));
    await user.click(side1p().getByText('-600'));
    await user.click(side1p().getByText('-700'));
    await user.click(side1p().getByText('-800'));
    await user.click(side1p().getByText('-900'));
    await user.click(side1p().getByText('-1000'));
    await user.click(side1p().getByText('-2000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')).toHaveLength(10);
    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '2500 → 500 (-2000)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '7900 → 7700 (-200)'
    );
    expect(screen.getAllByTestId('modal-log')[0]).toHaveClass(
      'list-group-item-dark'
    );

    await user.click(screen.getByLabelText('Close'));
    [...Array(9)].forEach(async () => {
      await user.click(screen.getByText('戻る'));
    });
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')).toHaveLength(10);
    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '3500 → 2500 (-1000)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '8000 → 7900 (-100)'
    );
    expect(screen.getAllByTestId('modal-log')[8]).toHaveClass(
      'list-group-item-dark'
    );
  });
  it('LPを15回減算した後に5回戻るを押すと最新から数えて2回目〜11回目のLP減算ログが表示される', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-100'));
    await user.click(side1p().getByText('-100'));
    await user.click(side1p().getByText('-100'));
    await user.click(side1p().getByText('-100'));
    await user.click(side1p().getByText('-100'));
    await user.click(side1p().getByText('-200'));
    await user.click(side1p().getByText('-300'));
    await user.click(side1p().getByText('-400'));
    await user.click(side1p().getByText('-500'));
    await user.click(side1p().getByText('-600'));
    await user.click(side1p().getByText('-700'));
    await user.click(side1p().getByText('-800'));
    await user.click(side1p().getByText('-900'));
    await user.click(side1p().getByText('-1000'));
    await user.click(side1p().getByText('-2000'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '2100 → 100 (-2000)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '7500 → 7300 (-200)'
    );
    expect(screen.getAllByTestId('modal-log')[0]).toHaveClass(
      'list-group-item-dark'
    );

    await user.click(screen.getByLabelText('Close'));
    [...Array(5)].forEach(async () => {
      await user.click(screen.getByText('戻る'));
    });
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')).toHaveLength(10);
    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[0]).toHaveTextContent(
      '3100 → 2100 (-1000)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '旋風BF (1P)'
    );
    expect(screen.getAllByTestId('modal-log')[9]).toHaveTextContent(
      '7600 → 7500 (-100)'
    );
    expect(screen.getAllByTestId('modal-log')[4]).toHaveClass(
      'list-group-item-dark'
    );
  });
});

describe('進む', () => {
  it('初期状態から1PのLPを-1000し戻るを押した後に進むを押すと1PのLPは7000に戻る', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(screen.getByText('戻る'));

    expect(side1p().getByText('8000')).toBeInTheDocument();

    await user.click(screen.getByText('進む'));

    expect(side1p().getByText('7000')).toBeInTheDocument();
  });
  it('初期状態から1PのLPを-1000しても進むボタンは非活性のまま', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    expect(screen.getByText('進む')).toBeDisabled();

    await user.click(side1p().getByText('-1000'));

    expect(screen.getByText('進む')).toBeDisabled();
  });
  it('初期状態から1PのLPを-1000し戻るボタンを押した後に進むボタンを押すと進むボタンは非活性になる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(screen.getByText('戻る'));

    expect(screen.getByText('進む')).toBeEnabled();

    await user.click(screen.getByText('進む'));

    expect(screen.getByText('進む')).toBeDisabled();
  });
  it('初期状態から1PのLPを-1000, 2PのLPを-2000し戻るを2回押した後に進むを押すと1PのLPは7000で2PのLPは8000になる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(side2p().getByText('-2000'));
    await user.click(screen.getByText('戻る'));
    await user.click(screen.getByText('戻る'));

    expect(side1p().getByText('8000')).toBeInTheDocument();
    expect(side2p().getByText('8000')).toBeInTheDocument();

    await user.click(screen.getByText('進む'));

    expect(side1p().getByText('7000')).toBeInTheDocument();
    expect(side2p().getByText('8000')).toBeInTheDocument();
  });
  it('初期状態からLPを減算し戻るを押した後に進むを押すとLP減算ログは色塗りはされる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(screen.getByText('戻る'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByTestId('modal-log')).not.toHaveClass(
      'list-group-item-dark'
    );

    await user.click(screen.getByLabelText('Close'));
    await user.click(screen.getByText('進む'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getByTestId('modal-log')).toHaveClass('list-group-item-dark');
  });
  it('初期状態からLPを2回減算し戻るを2回押した後に進むを押すとログは2つ表示されたままだが1回目の減算ログが色塗りされる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));
    await user.click(side2p().getByText('-2000'));
    await user.click(screen.getByText('戻る'));
    await user.click(screen.getByText('戻る'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')).toHaveLength(2);
    expect(screen.getAllByTestId('modal-log')[0]).not.toHaveClass(
      'list-group-item-dark'
    );
    expect(screen.getAllByTestId('modal-log')[1]).not.toHaveClass(
      'list-group-item-dark'
    );

    await user.click(screen.getByLabelText('Close'));
    await user.click(screen.getByText('進む'));
    await user.click(screen.getByText('ログ'));

    expect(screen.getAllByTestId('modal-log')).toHaveLength(2);
    expect(screen.getAllByTestId('modal-log')[0]).not.toHaveClass(
      'list-group-item-dark'
    );
    expect(screen.getAllByTestId('modal-log')[1]).toHaveClass(
      'list-group-item-dark'
    );
  });
});

describe('コイン', () => {
  it('コインを押すとコイントス結果モーダルが表示される', async () => {
    render(<LP />);

    expect(screen.queryByText('コイントス結果')).not.toBeInTheDocument();

    await user.click(screen.getByText('コイン'));

    expect(screen.getByText('コイントス結果')).toBeInTheDocument();
    expect(screen.getByText(/((オモテ)|(ウラ))が出ました/)).toBeInTheDocument();
  });
  it('コイントス結果モーダルでXボタンを押すとモーダルは閉じる', async () => {
    render(<LP />);
    await user.click(screen.getByText('コイン'));

    expect(screen.getByText('コイントス結果')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close'));

    expect(screen.queryByText('コイントス結果')).not.toBeInTheDocument();
  });
});

describe('サイコロ', () => {
  it('サイコロを押すとサイコロ結果モーダルが表示される', async () => {
    render(<LP />);

    expect(screen.queryByText('サイコロ結果')).not.toBeInTheDocument();

    await user.click(screen.getByText('サイコロ'));

    expect(screen.getByText('サイコロ結果')).toBeInTheDocument();
    expect(screen.getByText(/(1|2|3|4|5|6)が出ました/)).toBeInTheDocument();
  });
  it('サイコロ結果モーダルでXボタンを押すとモーダルは閉じる', async () => {
    render(<LP />);
    await user.click(screen.getByText('サイコロ'));

    expect(screen.getByText('サイコロ結果')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close'));

    expect(screen.queryByText('サイコロ結果')).not.toBeInTheDocument();
  });
});

describe('ナビゲーションバー', () => {
  it('初期状態では戦績ページへのリンクがアクティブ', async () => {
    render(<LP />);

    expect(screen.getByText('戦績')).not.toHaveClass('disabled');
  });
  it('初期状態から1PのLPを-1000すると戦績ページへのリンクは非アクティブになる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));

    expect(screen.getByText('戦績')).not.toHaveClass('disabled');

    await user.click(side1p().getByText('-1000'));

    expect(screen.getByText('戦績')).toHaveClass('disabled');
  });
  it('初期状態から1PのLPを-1000した後に戻るボタンを押しても戦績ページへのリンクは非アクティブのまま', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));

    expect(screen.getByText('戦績')).toHaveClass('disabled');

    await user.click(screen.getByText('戻る'));

    expect(screen.getByText('戦績')).toHaveClass('disabled');
  });
  it('マッチ1戦目が終わった直後の戦績ページへのリンクは非アクティブ', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));

    expect(screen.getByText('戦績')).toHaveClass('disabled');

    await user.click(side1p().getByText('-3000'));
    await user.click(screen.getByText('はい'));

    expect(screen.getByText('戦績')).toHaveClass('disabled');
  });
  it('初期状態から1PのLPを-1000した後にリセットすると戦績ページへのリンクはアクティブになる', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-1000'));

    expect(screen.getByText('戦績')).toHaveClass('disabled');

    await user.click(screen.getByText('リセット'));
    await user.click(screen.getByText('はい'));

    expect(screen.getByText('戦績')).not.toHaveClass('disabled');
  });
});

describe('次デュエル確認', () => {
  it('マッチ1戦目で1PのLPが0になると次デュエル確認モーダルが表示される', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));

    expect(screen.queryByText('デュエル終了')).not.toBeInTheDocument();
    expect(
      screen.queryByText('次のデュエルを開始してよいですか？')
    ).not.toBeInTheDocument();

    await user.click(side1p().getByText('-3000'));

    expect(screen.getByText('デュエル終了')).toBeInTheDocument();
    expect(
      screen.getByText('次のデュエルを開始してよいですか？')
    ).toBeInTheDocument();
  });

  it('1戦目は2Pが勝利したマッチの2戦目で2PのLPが0になると次デュエル確認モーダルが表示される', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(screen.getByText('はい'));
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side2p().getByText('-3000'));
    await user.click(side2p().getByText('-3000'));

    expect(screen.queryByText('デュエル終了')).not.toBeInTheDocument();

    await user.click(side2p().getByText('-3000'));

    expect(screen.getByText('デュエル終了')).toBeInTheDocument();
  });

  it('マッチ1戦目で1PのLPを0にし次デュエル確認モーダルを閉じた後に戻るを押し再び1PのLPを0にすると次デュエル確認モーダルが表示される', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(screen.getByText('いいえ'));
    await user.click(screen.getByText('戻る'));

    expect(side1p().getByText('2000')).toBeInTheDocument();
    expect(screen.queryByText('デュエル終了')).not.toBeInTheDocument();

    await user.click(side1p().getByText('-3000'));

    expect(screen.getByText('デュエル終了')).toBeInTheDocument();
  });
});

describe('保存確認', () => {
  it('1Pが連敗すると保存確認モーダルが表示される', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(screen.getByText('はい'));
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));

    expect(screen.queryByText('保存確認')).not.toBeInTheDocument();
    expect(
      screen.queryByText('ゲーム結果を保存してよいですか？')
    ).not.toBeInTheDocument();

    await user.click(side1p().getByText('-3000'));

    expect(screen.getByText('保存確認')).toBeInTheDocument();
    expect(
      screen.getByText('ゲーム結果を保存してよいですか？')
    ).toBeInTheDocument();
  });
  it('2Pが連敗すると保存確認モーダルが表示される', async () => {
    render(<LP />);
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side2p().getByText('-3000'));
    await user.click(side2p().getByText('-3000'));
    await user.click(side2p().getByText('-3000'));
    await user.click(screen.getByText('はい'));
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side2p().getByText('-3000'));
    await user.click(side2p().getByText('-3000'));

    expect(screen.queryByText('保存確認')).not.toBeInTheDocument();
    expect(
      screen.queryByText('ゲーム結果を保存してよいですか？')
    ).not.toBeInTheDocument();

    await user.click(side2p().getByText('-3000'));

    expect(screen.getByText('保存確認')).toBeInTheDocument();
    expect(
      screen.getByText('ゲーム結果を保存してよいですか？')
    ).toBeInTheDocument();
  });
  it('3回引き分けでも保存確認モーダルが表示される', async () => {
    render(<LP />);
    // 1戦目
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(screen.getByText('いいえ'));
    await user.click(side2p().getByText('-3000'));
    await user.click(side2p().getByText('-3000'));
    await user.click(side2p().getByText('-3000'));
    await user.click(screen.getByText('はい'));
    // 2戦目
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(screen.getByText('いいえ'));
    await user.click(side2p().getByText('-3000'));
    await user.click(side2p().getByText('-3000'));
    await user.click(side2p().getByText('-3000'));
    await user.click(screen.getByText('はい'));
    // 3戦目
    await user.click(side1p().getByRole('checkbox', { name: 'switch' }));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(side1p().getByText('-3000'));
    await user.click(screen.getByText('いいえ'));
    await user.click(side2p().getByText('-3000'));
    await user.click(side2p().getByText('-3000'));

    expect(screen.queryByText('保存確認')).not.toBeInTheDocument();
    expect(
      screen.queryByText('ゲーム結果を保存してよいですか？')
    ).not.toBeInTheDocument();

    await user.click(side2p().getByText('-3000'));

    expect(screen.getByText('保存確認')).toBeInTheDocument();
    expect(
      screen.getByText('ゲーム結果を保存してよいですか？')
    ).toBeInTheDocument();
  });
});
