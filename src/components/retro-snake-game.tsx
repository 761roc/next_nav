"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createInitialSnakeState,
  getTickInterval,
  restartSnakeGame,
  setDirection,
  stepSnakeGame,
  togglePause,
} from "@/lib/snake-game.mjs";

type Direction = "up" | "down" | "left" | "right";
type GameMode = "ready" | "running" | "paused" | "gameover";
type CellType = "empty" | "snake" | "head" | "food";

type Point = { x: number; y: number };

type SnakeState = {
  mode: GameMode;
  gridSize: number;
  snake: Point[];
  direction: Direction;
  pendingDirection: Direction;
  food: Point;
  score: number;
  tickCount: number;
};

type UiText = {
  backHref: string;
  backHome: string;
  title: string;
  subtitle: string;
  start: string;
  restart: string;
  controls: string;
  hint: string;
  score: string;
  best: string;
  state: string;
  pause: string;
  resume: string;
  up: string;
  down: string;
  left: string;
  right: string;
  stateMenu: string;
  stateRunning: string;
  statePaused: string;
  stateGameOver: string;
};

const STORAGE_KEY = "toolnext.snake.best";

export function RetroSnakeGame({ text }: { text: UiText }) {
  const accumulatorRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const stateRef = useRef<SnakeState>(createInitialSnakeState() as SnakeState);
  const [best, setBest] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0");
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  });
  const bestRef = useRef(best);
  const [game, setGame] = useState<SnakeState>(() => createInitialSnakeState() as SnakeState);

  const commitGame = useCallback((nextGame: SnakeState) => {
    stateRef.current = nextGame;
    setGame(nextGame);
  }, []);

  const syncBest = useCallback((score: number) => {
    if (typeof window === "undefined" || score <= bestRef.current) {
      return;
    }

    bestRef.current = score;
    setBest(score);
    window.localStorage.setItem(STORAGE_KEY, String(score));
  }, []);

  const statusLabel = useMemo(() => {
    if (game.mode === "ready") return text.stateMenu;
    if (game.mode === "running") return text.stateRunning;
    if (game.mode === "paused") return text.statePaused;
    return text.stateGameOver;
  }, [game.mode, text]);

  const restartGame = useCallback(
    (direction?: Direction) => {
      accumulatorRef.current = 0;
      lastFrameRef.current = null;
      commitGame(restartSnakeGame(direction ? { direction } : undefined) as SnakeState);
    },
    [commitGame],
  );

  const stepByMs = useCallback(
    (deltaMs: number) => {
      accumulatorRef.current += deltaMs;

      let current = stateRef.current;
      while (current.mode === "running") {
        const interval = getTickInterval(current.score);
        if (accumulatorRef.current < interval) break;

        accumulatorRef.current -= interval;
        current = stepSnakeGame(current) as SnakeState;
        commitGame(current);
        syncBest(current.score);
      }
    },
    [commitGame, syncBest],
  );

  const handleDirection = useCallback(
    (direction: Direction) => {
      if (stateRef.current.mode === "ready" || stateRef.current.mode === "gameover") {
        restartGame(direction);
        return;
      }

      commitGame(setDirection(stateRef.current, direction) as SnakeState);
    },
    [commitGame, restartGame],
  );

  const handlePause = useCallback(() => {
    if (stateRef.current.mode === "ready") {
      restartGame();
      return;
    }

    const next = togglePause(stateRef.current) as SnakeState;
    if (next.mode === "running") {
      lastFrameRef.current = null;
    }
    commitGame(next);
  }, [commitGame, restartGame]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " ", "enter", "p"].includes(key)) {
        event.preventDefault();
      }

      const directionMap: Record<string, Direction> = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
      };

      if (key in directionMap) {
        handleDirection(directionMap[key]);
        return;
      }

      if (key === " " || key === "enter" || key === "p") {
        handlePause();
      }
    };

    window.addEventListener("keydown", keyHandler);

    const animate = (time: number) => {
      if (lastFrameRef.current == null) {
        lastFrameRef.current = time;
      }

      const delta = time - lastFrameRef.current;
      lastFrameRef.current = time;

      if (stateRef.current.mode === "running") {
        stepByMs(Math.min(120, delta));
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    window.render_game_to_text = () => {
      const current = stateRef.current;
      return JSON.stringify({
        mode: current.mode,
        coordinateSystem: "origin: top-left, x increases right, y increases downward, units: grid cells",
        gridSize: current.gridSize,
        player: {
          head: current.snake[0],
          direction: current.direction,
          pendingDirection: current.pendingDirection,
          length: current.snake.length,
        },
        snake: current.snake,
        food: current.food,
        score: current.score,
        best: bestRef.current,
        speedMsPerStep: getTickInterval(current.score),
        tickCounter: current.tickCount,
      });
    };

    window.advanceTime = (ms: number) => {
      const boundedMs = Math.max(0, Number(ms) || 0);
      stepByMs(boundedMs);
      return window.render_game_to_text?.();
    };

    return () => {
      window.removeEventListener("keydown", keyHandler);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, [handleDirection, handlePause, stepByMs]);

  const cells = useMemo(() => {
    const filled = new Map<string, CellType>();
    game.snake.forEach((segment, index) => {
      filled.set(`${segment.x}:${segment.y}`, index === 0 ? "head" : "snake");
    });
    filled.set(`${game.food.x}:${game.food.y}`, "food");

    return Array.from({ length: game.gridSize * game.gridSize }, (_, index) => {
      const x = index % game.gridSize;
      const y = Math.floor(index / game.gridSize);
      return {
        key: `${x}:${y}`,
        type: filled.get(`${x}:${y}`) ?? "empty",
      };
    });
  }, [game]);

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

      <div className="game-stage" role="application" aria-label={text.title}>
        <div
          className="snake-board"
          style={{ gridTemplateColumns: `repeat(${game.gridSize}, minmax(0, 1fr))` }}
        >
          {cells.map((cell) => (
            <div
              key={cell.key}
              className={`snake-cell snake-cell-${cell.type}`}
              data-cell-type={cell.type}
            />
          ))}
        </div>
        {game.mode !== "running" ? (
          <div className="snake-overlay">
            <p className="snake-overlay-state">{statusLabel}</p>
            <p className="snake-overlay-hint">{text.hint}</p>
          </div>
        ) : null}
      </div>

      <div className="game-toolbar">
        <button className="game-button" type="button" onClick={() => restartGame()}>
          {game.mode === "ready" ? text.start : text.restart}
        </button>
        <button
          className="game-button game-button-alt"
          type="button"
          onClick={handlePause}
          disabled={game.mode === "gameover"}
        >
          {game.mode === "paused" ? text.resume : text.pause}
        </button>
        <dl className="game-stats" aria-label="game-stats">
          <div>
            <dt>{text.score}</dt>
            <dd>{game.score}</dd>
          </div>
          <div>
            <dt>{text.best}</dt>
            <dd>{best}</dd>
          </div>
          <div>
            <dt>{text.state}</dt>
            <dd>{statusLabel}</dd>
          </div>
        </dl>
      </div>

      <div className="game-pad" aria-label={text.controls}>
        <div className="game-pad-row">
          <button
            className="game-pad-button"
            type="button"
            aria-label={text.up}
            onClick={() => handleDirection("up")}
          >
            ↑
          </button>
        </div>
        <div className="game-pad-row">
          <button
            className="game-pad-button"
            type="button"
            aria-label={text.left}
            onClick={() => handleDirection("left")}
          >
            ←
          </button>
          <button
            className="game-pad-button"
            type="button"
            aria-label={text.down}
            onClick={() => handleDirection("down")}
          >
            ↓
          </button>
          <button
            className="game-pad-button"
            type="button"
            aria-label={text.right}
            onClick={() => handleDirection("right")}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => string | undefined;
  }
}
