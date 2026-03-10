"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  advanceGame,
  callBid,
  clearSelection,
  createInitialRound,
  formatCard,
  passTurn,
  playSelectedCards,
  restartRound,
  toggleCardSelection,
} from "@/lib/dou-dizhu-game.mjs";

type PlayerId = "player" | "left" | "right";
type PhaseMode = "bidding" | "playing" | "finished";

type Card = {
  id: string;
  rank: number;
  suit: string;
  label: string;
  accent: string;
};

type Combo = {
  type: string;
  rank: number;
  length: number;
};

type Trick = {
  playerId: PlayerId;
  combo: Combo;
  cards: Card[];
};

type ActionState = {
  type: "wait" | "bid" | "play" | "pass";
  cards: Card[];
  combo: Combo | null;
  value: number | null;
};

type GameState = {
  mode: PhaseMode;
  currentTurn: PlayerId;
  currentTrick: Trick | null;
  lastNonPassPlayer: PlayerId | null;
  consecutivePasses: number;
  hands: Record<PlayerId, Card[]>;
  bottomCards: Card[];
  selectedCardIds: string[];
  winner: PlayerId | null;
  round: number;
  pendingAiMs: number | null;
  feedback: string;
  lastActions: Record<PlayerId, ActionState>;
  bids: Record<PlayerId, number | null>;
  highestBid: number;
  landlord: PlayerId | null;
  phase: "call" | "play";
};

type UiText = {
  backHref: string;
  backHome: string;
  title: string;
  subtitle: string;
  controls: string;
  state: string;
  newRound: string;
  play: string;
  pass: string;
  clear: string;
  landlord: string;
  farmer: string;
  you: string;
  leftBot: string;
  rightBot: string;
  bottomCards: string;
  round: string;
  turn: string;
  selected: string;
  status: string;
  table: string;
  tableOpen: string;
  thinking: string;
  invalidCombo: string;
  mustBeat: string;
  cannotPass: string;
  winnerPlayer: string;
  winnerLeft: string;
  winnerRight: string;
  cardsLeft: string;
  statePlaying: string;
  stateFinished: string;
  hint: string;
  publicArea: string;
  recentAction: string;
  actionPass: string;
  actionWaiting: string;
  soundOn: string;
  soundOff: string;
  callLandlord: string;
  bidPass: string;
  bidOne: string;
  bidTwo: string;
  bidThree: string;
  stateBidding: string;
  bidLabel: string;
};

const FEEDBACK_KEY = {
  "invalid-combo": "invalidCombo",
  "invalid-play": "invalidCombo",
  "must-beat": "mustBeat",
  "cannot-pass": "cannotPass",
} as const;

const BID_VALUES = [0, 1, 2, 3];

export function DouDizhuGame({ text }: { text: UiText }) {
  const stateRef = useRef<GameState>(createInitialRound() as GameState);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const [game, setGame] = useState<GameState>(() => createInitialRound() as GameState);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const commitGame = useCallback((nextGame: GameState) => {
    stateRef.current = nextGame;
    setGame(nextGame);
  }, []);

  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (audioContextRef.current) return audioContextRef.current;
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    audioContextRef.current = new AudioCtor();
    return audioContextRef.current;
  }, []);

  const playUiSound = useCallback(
    (kind: "select" | "play" | "pass" | "win" | "bid") => {
      if (!soundEnabled) return;
      const context = ensureAudioContext();
      if (!context) return;
      if (context.state === "suspended") void context.resume();

      const now = context.currentTime;
      const notes =
        kind === "select"
          ? [659.25]
          : kind === "pass"
            ? [329.63]
            : kind === "bid"
              ? [523.25, 659.25]
              : kind === "win"
                ? [523.25, 659.25, 783.99, 1046.5]
                : [392, 523.25, 659.25];

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(kind === "select" ? 0.02 : 0.035, now + index * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + index * 0.08);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + index * 0.06);
        oscillator.stop(now + 0.32 + index * 0.08);
      });
    },
    [ensureAudioContext, soundEnabled],
  );

  const startMusicLoop = useCallback(() => {
    if (!soundEnabled || musicTimerRef.current != null) return;
    const context = ensureAudioContext();
    if (!context) return;
    if (context.state === "suspended") {
      void context.resume();
    }

    const phrase = () => {
      const startAt = context.currentTime + 0.04;
      const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 783.99, 880];
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.018, startAt + index * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + index * 0.22 + 0.26);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startAt + index * 0.22);
        oscillator.stop(startAt + index * 0.22 + 0.3);
      });
    };

    phrase();
    musicTimerRef.current = window.setInterval(phrase, 1900);
  }, [ensureAudioContext, soundEnabled]);

  const stopMusicLoop = useCallback(() => {
    if (musicTimerRef.current != null) {
      window.clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  }, []);

  const applyState = useCallback(
    (nextGame: GameState, sound?: "select" | "play" | "pass" | "win" | "bid") => {
      startMusicLoop();
      if (sound) playUiSound(sound);
      commitGame(nextGame);
    },
    [commitGame, playUiSound, startMusicLoop],
  );

  const playerNames: Record<PlayerId, string> = {
    player: text.you,
    left: text.leftBot,
    right: text.rightBot,
  };
  const orderedPlayers: PlayerId[] = ["left", "player", "right"];

  const feedbackText =
    game.feedback && FEEDBACK_KEY[game.feedback as keyof typeof FEEDBACK_KEY]
      ? text[FEEDBACK_KEY[game.feedback as keyof typeof FEEDBACK_KEY]]
      : text.hint;

  const stateLabel =
    game.mode === "bidding"
      ? text.stateBidding
      : game.mode === "finished"
        ? text.stateFinished
        : text.statePlaying;

  const winnerText = game.winner
    ? game.winner === "player"
      ? text.winnerPlayer
      : game.winner === "left"
        ? text.winnerLeft
        : text.winnerRight
    : stateLabel;

  const selectedCards = useMemo(
    () => game.hands.player.filter((card) => game.selectedCardIds.includes(card.id)),
    [game.hands.player, game.selectedCardIds],
  );

  const canPlay = game.mode === "playing" && game.currentTurn === "player" && game.selectedCardIds.length > 0;
  const canPass = game.mode === "playing" && game.currentTurn === "player" && !!game.currentTrick;
  const canBid = game.mode === "bidding" && game.currentTurn === "player";

  const actionBubble = (playerId: PlayerId) => {
    const action = game.lastActions[playerId];
    if (action.type === "bid") {
      return action.value === 0 ? text.bidPass : `${text.bidLabel} ${action.value}`;
    }
    if (action.type === "pass") return text.actionPass;
    if (action.type === "play") return action.cards.map((card) => card.label).join(" ");
    return text.actionWaiting;
  };

  const seatPreview = (playerId: PlayerId) => {
    const action = game.lastActions[playerId];
    if (action.type !== "play") return null;
    return action.cards;
  };

  useEffect(() => {
    if (!soundEnabled) {
      stopMusicLoop();
      return;
    }

    return () => stopMusicLoop();
  }, [soundEnabled, stopMusicLoop]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (game.currentTurn !== "player") return;

      if (game.mode === "bidding") {
        const bidMap: Record<string, number> = { "0": 0, "1": 1, "2": 2, "3": 3 };
        if (event.key in bidMap) {
          event.preventDefault();
          applyState(callBid(stateRef.current, "player", bidMap[event.key]) as GameState, "bid");
        }
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const next = playSelectedCards(stateRef.current) as GameState;
        applyState(next, next.feedback ? undefined : next.mode === "finished" ? "win" : "play");
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        applyState(clearSelection(stateRef.current) as GameState);
      }

      if (event.key === " ") {
        event.preventDefault();
        applyState(passTurn(stateRef.current, "player") as GameState, "pass");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyState, game.currentTurn, game.mode]);

  useEffect(() => {
    const animate = (time: number) => {
      if (stateRef.current.pendingAiMs == null) {
        lastFrameRef.current = null;
        rafRef.current = window.requestAnimationFrame(animate);
        return;
      }

      if (lastFrameRef.current == null) lastFrameRef.current = time;

      const delta = time - lastFrameRef.current;
      lastFrameRef.current = time;
      const previous = stateRef.current;
      const next = advanceGame(previous, Math.min(120, delta)) as GameState;

      if (next !== previous) {
        const actor = previous.currentTurn;
        const aiWon = next.mode === "finished" && previous.mode !== "finished";
        const actionType = next.lastActions[actor]?.type;
        const sound = aiWon ? "win" : actionType === "bid" ? "bid" : actionType === "pass" ? "pass" : actionType === "play" ? "play" : undefined;
        applyState(next, sound);
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    window.render_game_to_text = () =>
      JSON.stringify({
        mode: stateRef.current.mode,
        turn: stateRef.current.currentTurn,
        landlord: stateRef.current.landlord,
        bids: stateRef.current.bids,
        winner: stateRef.current.winner,
        selectedCardIds: stateRef.current.selectedCardIds,
        hands: {
          player: stateRef.current.hands.player.map((card) => formatCard(card)),
          leftCount: stateRef.current.hands.left.length,
          rightCount: stateRef.current.hands.right.length,
        },
        currentTrick: stateRef.current.currentTrick
          ? {
              playerId: stateRef.current.currentTrick.playerId,
              combo: stateRef.current.currentTrick.combo,
              cards: stateRef.current.currentTrick.cards.map((card) => formatCard(card)),
            }
          : null,
        lastActions: Object.fromEntries(
          Object.entries(stateRef.current.lastActions).map(([playerId, action]) => [
            playerId,
            {
              type: action.type,
              value: action.value,
              cards: action.cards.map((card) => formatCard(card)),
            },
          ]),
        ),
        bottomCards: stateRef.current.bottomCards.map((card) => formatCard(card)),
        coordinateSystem: "left bot top-left, right bot top-right, shared play area centered, player hand bottom",
      });

    window.advanceTime = (ms: number) => {
      const next = advanceGame(stateRef.current, ms) as GameState;
      commitGame(next);
      return window.render_game_to_text?.();
    };

    return () => {
      stopMusicLoop();
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, [applyState, commitGame, stopMusicLoop]);

  return (
    <section className="game-shell glass-card" aria-label={text.title}>
      <div className="game-head">
        <Link href={text.backHref} className="about-link game-back-link">
          {text.backHome}
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M7 12h10M13 8l4 4-4 4" />
          </svg>
        </Link>
        <div className="game-info">
          <h1 className="game-title">{text.title}</h1>
          <p className="game-subtitle">{text.subtitle}</p>
          <p className="game-controls">{text.controls}</p>
        </div>
      </div>

      <div className="game-stage dou-table dou-table-real" role="application" aria-label={text.title}>
        <div className="dou-table-noise" aria-hidden="true" />

        {(["left", "right"] as PlayerId[]).map((playerId, index) => (
          <section
            key={playerId}
            className={`dou-seat dou-seat-top ${index === 0 ? "dou-seat-left" : "dou-seat-right"}`}
            aria-label={playerNames[playerId]}
          >
            <div className="dou-avatar">{playerNames[playerId].slice(0, 1)}</div>
            <header className="dou-seat-head">
              <div>
                <p className="dou-seat-name">{playerNames[playerId]}</p>
                <p className="dou-seat-role">{game.landlord === playerId ? text.landlord : text.farmer}</p>
              </div>
              <span className="dou-seat-count">{game.hands[playerId].length} {text.cardsLeft}</span>
            </header>
            <div className="dou-opponent-fan" aria-hidden="true">
              {game.hands[playerId].slice(0, Math.min(10, game.hands[playerId].length)).map((card) => (
                <span key={card.id} className="dou-card-back" />
              ))}
            </div>
            {seatPreview(playerId) ? (
              <div className={`dou-seat-play-preview ${playerId === "left" ? "dou-seat-play-preview-left" : "dou-seat-play-preview-right"}`}>
                {seatPreview(playerId)?.map((card) => (
                  <article key={card.id} className={`dou-card dou-card-preview ${card.accent === "red" ? "dou-card-red" : ""}`}>
                    <span>{card.label}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dou-action-bubble">{actionBubble(playerId)}</div>
            )}
          </section>
        ))}

        <section className="dou-center" aria-label={text.publicArea}>
          <div className="dou-status-strip">
            <div className="dou-badge-stack">
              <span className="dou-badge">{game.landlord ? `${text.landlord} · ${playerNames[game.landlord]}` : text.callLandlord}</span>
              <span className="dou-badge dou-badge-soft">{text.round} {game.round}</span>
              <span className="dou-badge dou-badge-soft">{text.bidLabel} {game.highestBid}</span>
            </div>
            <div className="dou-badge-stack">
              <span className="dou-badge dou-badge-turn">{text.turn} {playerNames[game.currentTurn]}</span>
              <span className="dou-badge dou-badge-soft">{text.status} {stateLabel}</span>
              <button
                type="button"
                className="dou-sound-toggle"
                onClick={() => {
                  setSoundEnabled((current) => {
                    const next = !current;
                    if (next) {
                      window.setTimeout(() => startMusicLoop(), 0);
                    } else {
                      stopMusicLoop();
                    }
                    return next;
                  });
                }}
                aria-pressed={soundEnabled}
              >
                {soundEnabled ? text.soundOn : text.soundOff}
              </button>
            </div>
          </div>

          <div className="dou-public-area dou-public-area-real">
            <div className="dou-trick-card dou-trick-card-large">
              <p className="dou-panel-label">{text.publicArea}</p>
              <div className="dou-trick-cards">
                {game.currentTrick ? (
                  game.currentTrick.cards.map((card) => (
                    <article key={card.id} className={`dou-card dou-card-table ${card.accent === "red" ? "dou-card-red" : ""}`}>
                      <span>{card.label}</span>
                    </article>
                  ))
                ) : (
                  <div className="dou-call-stage">
                    {orderedPlayers.map((playerId) => (
                      <div key={playerId} className="dou-call-chip">
                        <span>{playerNames[playerId]}</span>
                        <strong>{game.bids[playerId] == null ? "..." : game.bids[playerId] === 0 ? text.bidPass : `${text.bidLabel}${game.bids[playerId]}`}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dou-bottom-panel">
            <div className="dou-bottom-cards">
              <p className="dou-panel-label">{text.bottomCards}</p>
              <div className="dou-bottom-card-row">
                {game.bottomCards.map((card) => (
                  <span key={card.id} className={`dou-bottom-card ${card.accent === "red" ? "dou-bottom-card-red" : ""}`}>
                    {game.landlord ? card.label : "?"}
                  </span>
                ))}
              </div>
            </div>
            <div className="dou-feedback" role="status" aria-live="polite">
              <p className="dou-panel-label">{text.status}</p>
              <p className="dou-feedback-text">
                {game.pendingAiMs != null && game.currentTurn !== "player"
                  ? text.thinking
                  : game.mode === "finished"
                    ? winnerText
                    : feedbackText}
              </p>
            </div>
          </div>
        </section>

        <section className="dou-seat dou-seat-bottom" aria-label={text.you}>
          <div className="dou-avatar dou-avatar-player">你</div>
          <header className="dou-seat-head">
            <div>
              <p className="dou-seat-name">{text.you}</p>
              <p className="dou-seat-role">{game.landlord === "player" ? text.landlord : text.farmer}</p>
            </div>
            <span className="dou-seat-count">{selectedCards.length} {text.selected}</span>
          </header>

          <div className="dou-hand">
            {game.hands.player.map((card) => {
              const selected = game.selectedCardIds.includes(card.id);
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`dou-card dou-card-hand ${selected ? "dou-card-selected" : ""} ${card.accent === "red" ? "dou-card-red" : ""}`}
                  onClick={() => applyState(toggleCardSelection(stateRef.current, card.id) as GameState, "select")}
                  aria-pressed={selected}
                  aria-label={formatCard(card)}
                  disabled={game.mode !== "playing" || game.currentTurn !== "player"}
                >
                  <span>{card.label}</span>
                </button>
              );
            })}
          </div>
          {seatPreview("player") ? (
            <div className="dou-seat-play-preview dou-seat-play-preview-player">
              {seatPreview("player")?.map((card) => (
                <article key={card.id} className={`dou-card dou-card-preview ${card.accent === "red" ? "dou-card-red" : ""}`}>
                  <span>{card.label}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="dou-action-bubble dou-action-bubble-player">{actionBubble("player")}</div>
          )}
        </section>
      </div>

      {game.mode === "bidding" ? (
        <div className="game-toolbar dou-toolbar dou-bid-toolbar">
          {BID_VALUES.map((bid) => (
            <button
              key={bid}
              className="game-button game-button-alt"
              type="button"
              disabled={!canBid || bid <= game.highestBid}
              onClick={() => applyState(callBid(stateRef.current, "player", bid) as GameState, "bid")}
            >
              {bid === 0 ? text.bidPass : bid === 1 ? text.bidOne : bid === 2 ? text.bidTwo : text.bidThree}
            </button>
          ))}
        </div>
      ) : (
        <div className="game-toolbar dou-toolbar">
          <button className="game-button" type="button" onClick={() => applyState(restartRound(stateRef.current) as GameState)}>
            {text.newRound}
          </button>
          <button
            className="game-button game-button-alt"
            type="button"
            onClick={() => {
              const next = playSelectedCards(stateRef.current) as GameState;
              applyState(next, next.feedback ? undefined : next.mode === "finished" ? "win" : "play");
            }}
            disabled={!canPlay}
          >
            {text.play}
          </button>
          <button
            className="game-button game-button-alt"
            type="button"
            onClick={() => applyState(passTurn(stateRef.current, "player") as GameState, "pass")}
            disabled={!canPass}
          >
            {text.pass}
          </button>
          <button
            className="game-button game-button-alt"
            type="button"
            onClick={() => applyState(clearSelection(stateRef.current) as GameState)}
            disabled={game.selectedCardIds.length === 0}
          >
            {text.clear}
          </button>
        </div>
      )}
    </section>
  );
}

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => string | undefined;
  }
}
