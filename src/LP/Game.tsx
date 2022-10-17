import { DateTime } from "luxon";
import { useState } from "react";
import { Button, Modal, ListGroup } from "react-bootstrap";

import { Deck, Duel, findWinner, Result } from "lib/result";

export type Mode = "normal" | "+" | "-";

export type LPLog = {
  playerID: number;
  from: number;
  to: number;
};

export type LPHistory = {
  logs: LPLog[];
  head: number;
};
export type LPHistoryCtl = ReturnType<typeof useLPHistory>["ctl"];

export type Player = {
  id: number;
  deck: Deck;
  lp: number;
  isFirst: boolean;
  lo: boolean;
  mode: Mode;
  buf: number;
};

export type PlayerCtl = ReturnType<typeof useGame>["ctl1"];

const initHistory = { logs: [], head: -1 };

const useLPHistory = () => {
  const [lpHistory, setHistory] = useState<LPHistory>(initHistory);
  const addLog = (i: number, from: number, to: number) => {
    setHistory({
      logs: [
        ...lpHistory.logs.slice(0, lpHistory.head + 1),
        {
          playerID: i,
          from,
          to,
        },
      ],
      head: lpHistory.head + 1,
    });
  };
  const undo = () => {
    const res = lpHistory.logs[lpHistory.head];
    setHistory({
      logs: lpHistory.logs,
      head: lpHistory.head - 1,
    });
    return res;
  };
  const redo = () => {
    const res = lpHistory.logs[lpHistory.head + 1];
    setHistory({
      logs: lpHistory.logs,
      head: lpHistory.head + 1,
    });
    return res;
  };
  const reset = () => {
    setHistory(initHistory);
  };
  return {
    lpHistory: lpHistory,
    ctl: {
      addLog,
      undo,
      redo,
      reset,
    },
  };
};

const usePlayer = (id: number, decks: Deck[]) => {
  const [player, setPlayer] = useState<Player>({
    id,
    deck: decks[0],
    lp: 8000,
    isFirst: false,
    lo: false,
    mode: "normal" as Mode,
    buf: 0,
  });

  const setDeck = (deck: Deck) => {
    setPlayer({ ...player, deck });
  };
  const addLP = (lp: number): [number, number] => {
    const from = player.lp;
    const to = Math.max(0, player.lp + lp);
    setPlayer({ ...player, lp: to });
    return [from, to];
  };
  const halfLP = (): [number, number] => {
    const from = player.lp;
    const to = Math.ceil(player.lp / 2);
    setPlayer({ ...player, lp: to });
    return [from, to];
  };
  const undoLP = (log: LPLog) => {
    if (log.playerID === player.id) {
      setPlayer({ ...player, lp: log.from });
    }
  };
  const redoLP = (log: LPLog) => {
    if (log.playerID === player.id) {
      setPlayer({ ...player, lp: log.to });
    }
  };
  const reset = () => {
    setPlayer({
      ...player,
      lp: 8000,
      isFirst: false,
      lo: false,
      mode: "normal" as Mode,
      buf: 0,
    });
  };
  const changeMode = (mode: Mode) => {
    setPlayer({ ...player, buf: mode === "normal" ? 0 : player.buf, mode });
  };
  const pushKey = (key: string): [number, number] => {
    if (key === "=") {
      const sign = player.mode === "+" ? 1 : -1;
      const from = player.lp;
      const to = Math.max(0, player.lp + sign * player.buf);
      setPlayer({
        ...player,
        lp: to,
        mode: "normal",
        buf: 0,
      });
      return [from, to];
    } else {
      setPlayer({ ...player, buf: Number(`${player.buf}${key}`) });
      return [player.lp, player.lp];
    }
  };
  const toggleFirst = () => setPlayer({ ...player, isFirst: !player.isFirst });
  const toggleLO = () => setPlayer({ ...player, lo: !player.lo });

  return {
    player,
    ctl: {
      setDeck,
      addLP,
      halfLP,
      undoLP,
      redoLP,
      reset,
      changeMode,
      pushKey,
      toggleFirst,
      toggleLO,
    },
  };
};

const useNextGameModal = (commit: () => void) => {
  const [showNextGameModal, setShowNextGameModal] = useState(false);
  const closeNextGameModal = () => setShowNextGameModal(false);
  const NextGameModal = () => (
    <Modal show={showNextGameModal} onHide={closeNextGameModal}>
      <Modal.Header>デュエル終了</Modal.Header>
      <Modal.Body>次のデュエルを開始してよいですか？</Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            closeNextGameModal();
            commit();
          }}
        >
          はい
        </Button>
        <Button variant="secondary" onClick={closeNextGameModal}>
          いいえ
        </Button>
      </Modal.Footer>
    </Modal>
  );
  return { NextGameModal, showNextGameModal: () => setShowNextGameModal(true) };
};

const toStringWithSign = (x: number) => {
  if (x > 0) {
    return "+" + x.toString();
  } else {
    return x.toString();
  }
};

const useSaveModal = (save: () => void) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const closeSaveModal = () => setShowSaveModal(false);
  const SaveModal = () => (
    <Modal show={showSaveModal} onHide={closeSaveModal}>
      <Modal.Header>保存確認</Modal.Header>
      <Modal.Body>ゲーム結果を保存してよいですか？</Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            save();
            closeSaveModal();
          }}
        >
          はい
        </Button>
        <Button variant="secondary" onClick={closeSaveModal}>
          いいえ
        </Button>
      </Modal.Footer>
    </Modal>
  );
  return {
    SaveModal,
    showSaveModal: () => setShowSaveModal(true),
  };
};

const useHistoryModal = (lpHistory: LPHistory, decks: [Deck, Deck]) => {
  const [showModal, setShowModal] = useState(false);
  const close = () => setShowModal(false);
  const LPHistoryModal = () => {
    const head = lpHistory.head;
    const logs = lpHistory.logs.map(({ playerID, from, to }, i) => {
      return (
        <ListGroup.Item
          variant={i === head ? "dark" : ""}
          key={i}
          data-testid="modal-log"
        >
          <div className="modal-log">
            <div className="modal-player-name">
              {decks[playerID - 1].name} ({playerID}P)
            </div>
            <div className="modal-log-lp">
              {from} → {to} ({toStringWithSign(to - from)})
            </div>
          </div>
        </ListGroup.Item>
      );
    });
    const visibleLogs = (() => {
      const len = lpHistory.logs.length;
      // HEADより前のログの数
      const front = head;
      // HEADより後のログの数
      const rear = len - head - 1;

      if (front <= 5) {
        // 前が少ないので前から10個返すだけ
        return logs.slice(0, 10);
      }
      if (rear <= 4) {
        // 後ろが少ないので、後ろから10個返すだけ
        return logs.slice(Math.max(0, len - 10));
      }
      // 前も後ろも十分にログがある場合はHEADを中心に10個のログを返す
      return logs.slice(head - 5, head + 5);
    })().reverse();
    return (
      <Modal show={showModal} onHide={close}>
        <Modal.Header closeButton>ライフポイント変動ログ</Modal.Header>
        <Modal.Body>
          <ListGroup>{visibleLogs}</ListGroup>
        </Modal.Body>
      </Modal>
    );
  };
  const showLPHistoryModal = () => setShowModal(true);
  return { LPHistoryModal, showLPHistoryModal };
};

export const useGame = (decks: Deck[], save: (result: Result) => void) => {
  const { lpHistory, ctl: historyCtl } = useLPHistory();
  const { player: player1, ctl: player1Ctl } = usePlayer(1, decks);
  const { player: player2, ctl: player2Ctl } = usePlayer(2, decks);
  const [result, setResult] = useState<Result>({
    decks: { 1: player1.deck.id, 2: player2.deck.id },
    duels: [],
    format: "Match",
    datetime: DateTime.now().toFormat("yyyy-MM-dd HH:mm"),
  });

  const reset = () => {
    historyCtl.reset();
    player1Ctl.reset();
    player2Ctl.reset();
    setResult({
      decks: { 1: player1.deck.id, 2: player2.deck.id },
      duels: [],
      format: "Match",
      datetime: DateTime.now().toFormat("yyyy-MM-dd HH:mm"),
    });
  };
  const commitGame = () => {
    setResult({
      ...result,
      duels: [
        ...result.duels,
        {
          1: { lp: player1.lp, isFirst: player1.isFirst, lo: player1.lo },
          2: { lp: player2.lp, isFirst: player2.isFirst, lo: player2.lo },
        },
      ],
    });
    player1Ctl.reset();
    player2Ctl.reset();
    historyCtl.reset();
  };
  const saveGame = () => {
    const newResult: Result = {
      ...result,
      duels: [
        ...result.duels,
        {
          1: { lp: player1.lp, isFirst: player1.isFirst, lo: player1.lo },
          2: { lp: player2.lp, isFirst: player2.isFirst, lo: player2.lo },
        },
      ],
    };
    setResult(newResult);
    save(newResult);
  };

  const { NextGameModal, showNextGameModal } = useNextGameModal(commitGame);
  const { SaveModal, showSaveModal } = useSaveModal(saveGame);
  const changeLP =
    <T,>(i: number, f: (...args: T[]) => [from: number, to: number]) =>
    (...args: T[]) => {
      const [from, to] = f(...args);
      const duel: Duel =
        i === 1
          ? { 1: { ...player1, lp: to }, 2: { ...player2, lp: player2.lp } }
          : { 1: { ...player1, lp: player1.lp }, 2: { ...player2, lp: to } };
      if (from !== to) {
        historyCtl.addLog(i, from, to);
        if (to <= 0) {
          const newResult: Result = {
            ...result,
            duels: [...result.duels, duel],
          };
          if (findWinner(newResult) === null) {
            showNextGameModal();
          } else {
            showSaveModal();
          }
        }
      }
    };
  const lo = () => {
    const duel = {
      1: player1,
      2: player2,
    };
    const newResult: Result = {
      ...result,
      duels: [...result.duels, duel],
    };
    if (findWinner(newResult) === null) {
      showNextGameModal();
    } else {
      showSaveModal();
    }
  };
  const { LPHistoryModal, showLPHistoryModal } = useHistoryModal(lpHistory, [
    player1.deck,
    player2.deck,
  ]);

  const isPlaying = result.duels.length > 0 || lpHistory.logs.length > 0;

  return {
    result,
    player1,
    ctl1: {
      ...player1Ctl,
      setDeck: (deck: Deck) => {
        player1Ctl.setDeck(deck);
        setResult({ ...result, decks: { 1: deck.id, 2: player2.deck.id } });
      },
      addLP: changeLP(1, player1Ctl.addLP),
      halfLP: changeLP(1, player1Ctl.halfLP),
      pushKey: changeLP(1, player1Ctl.pushKey),
    },
    player2,
    ctl2: {
      ...player2Ctl,
      setDeck: (deck: Deck) => {
        player2Ctl.setDeck(deck);
        setResult({ ...result, decks: { 1: player1.deck.id, 2: deck.id } });
      },
      addLP: changeLP(2, player2Ctl.addLP),
      halfLP: changeLP(2, player2Ctl.halfLP),
      pushKey: changeLP(2, player2Ctl.pushKey),
    },
    lpHistory,
    undo: () => {
      const log = historyCtl.undo();
      player1Ctl.undoLP(log);
      player2Ctl.undoLP(log);
    },
    redo: () => {
      const log = historyCtl.redo();
      player1Ctl.redoLP(log);
      player2Ctl.redoLP(log);
    },
    disabled: player1.isFirst === player2.isFirst,
    reset,
    lo,
    NextGameModal,
    SaveModal,
    LPHistoryModal,
    showLPHistoryModal,
    isPlaying,
  };
};
