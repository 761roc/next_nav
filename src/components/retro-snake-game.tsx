"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";
type GameMode = "menu" | "running" | "paused" | "gameover";

type GameState = {
  mode: GameMode;
  gridSize: number;
  snake: Point[];
  dir: Direction;
  pendingDir: Direction;
  food: Point;
  score: number;
  speedMs: number;
  tickCounter: number;
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
  stateMenu: string;
  stateRunning: string;
  statePaused: string;
  stateGameOver: string;
};

const CANVAS_SIZE = 960;
const GRID_SIZE = 20;
const BASE_SPEED_MS = 135;
const MIN_SPEED_MS = 70;
const SPEED_STEP_MS = 4;
const STORAGE_KEY = "toolnext.snake.best";

const OPPOSITE_DIR: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function RetroSnakeGame({ text }: { text: UiText }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const accumulatorRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const [best, setBest] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0");
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  });
  const bestRef = useRef(best);
  const [mode, setMode] = useState<GameMode>("menu");
  const [score, setScore] = useState(0);
  const [canvasDisplaySize, setCanvasDisplaySize] = useState(0);

  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateCanvasSize = () => {
      const next = Math.floor(Math.min(stage.clientWidth, stage.clientHeight));
      setCanvasDisplaySize(next > 0 ? next : 0);
    };

    updateCanvasSize();

    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(stage);
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  const statusLabel = useMemo(() => {
    if (mode === "menu") return text.stateMenu;
    if (mode === "running") return text.stateRunning;
    if (mode === "paused") return text.statePaused;
    return text.stateGameOver;
  }, [mode, text]);

  const syncUiFromState = useCallback(() => {
    const game = stateRef.current;
    setMode(game.mode);
    setScore(game.score);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = stateRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cell = CANVAS_SIZE / game.gridSize;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const bgGradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    bgGradient.addColorStop(0, "#0b1220");
    bgGradient.addColorStop(1, "#10253d");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.strokeStyle = "rgba(125, 211, 252, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= game.gridSize; i += 1) {
      const axis = i * cell;
      ctx.beginPath();
      ctx.moveTo(axis, 0);
      ctx.lineTo(axis, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, axis);
      ctx.lineTo(CANVAS_SIZE, axis);
      ctx.stroke();
    }

    ctx.fillStyle = "#f97316";
    ctx.shadowColor = "rgba(249, 115, 22, 0.62)";
    ctx.shadowBlur = 10;
    ctx.fillRect(game.food.x * cell + 3, game.food.y * cell + 3, cell - 6, cell - 6);

    ctx.shadowBlur = 0;
    game.snake.forEach((node, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? "#22c55e" : "#38bdf8";
      ctx.fillRect(node.x * cell + 3, node.y * cell + 3, cell - 6, cell - 6);
    });

    if (game.mode !== "running") {
      ctx.fillStyle = "rgba(2, 6, 23, 0.62)";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "700 26px var(--font-heading)";
      ctx.textAlign = "center";
      ctx.fillText(statusLabel, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 10);
      ctx.font = "600 16px var(--font-body)";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(text.hint, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 24);
    }
  }, [statusLabel, text.hint]);

  const persistBest = useCallback((nextScore: number) => {
    setBest((prev) => {
      const next = Math.max(prev, nextScore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  const restartGame = useCallback(() => {
    stateRef.current = createInitialState();
    stateRef.current.mode = "running";
    accumulatorRef.current = 0;
    lastFrameRef.current = null;
    syncUiFromState();
    draw();
  }, [draw, syncUiFromState]);

  const togglePause = useCallback(() => {
    const game = stateRef.current;
    if (game.mode === "running") {
      game.mode = "paused";
    } else if (game.mode === "paused") {
      game.mode = "running";
      lastFrameRef.current = null;
    }
    syncUiFromState();
    draw();
  }, [draw, syncUiFromState]);

  const stepTick = useCallback(() => {
    const game = stateRef.current;
    if (game.mode !== "running") return;

    const head = game.snake[0];
    const direction = game.pendingDir;
    game.dir = direction;

    const next: Point = { x: head.x, y: head.y };
    if (direction === "up") next.y -= 1;
    if (direction === "down") next.y += 1;
    if (direction === "left") next.x -= 1;
    if (direction === "right") next.x += 1;

    if (
      next.x < 0 ||
      next.y < 0 ||
      next.x >= game.gridSize ||
      next.y >= game.gridSize ||
      game.snake.some((node) => node.x === next.x && node.y === next.y)
    ) {
      game.mode = "gameover";
      persistBest(game.score);
      syncUiFromState();
      draw();
      return;
    }

    const ateFood = next.x === game.food.x && next.y === game.food.y;
    game.snake = [next, ...game.snake];

    if (ateFood) {
      game.score += 1;
      game.speedMs = Math.max(MIN_SPEED_MS, BASE_SPEED_MS - game.score * SPEED_STEP_MS);
      game.food = spawnFood(game.gridSize, game.snake);
      persistBest(game.score);
    } else {
      game.snake.pop();
    }

    game.tickCounter += 1;
    syncUiFromState();
    draw();
  }, [draw, persistBest, syncUiFromState]);

  const stepByMs = useCallback(
    (deltaMs: number) => {
      const game = stateRef.current;
      if (game.mode !== "running") {
        draw();
        return;
      }

      accumulatorRef.current += deltaMs;
      const maxTicks = 12;
      let ticks = 0;
      while (accumulatorRef.current >= game.speedMs && ticks < maxTicks) {
        accumulatorRef.current -= game.speedMs;
        stepTick();
        ticks += 1;
      }
      draw();
    },
    [draw, stepTick],
  );

  useEffect(() => {
    draw();

    const keyHandler = (event: KeyboardEvent) => {
      const game = stateRef.current;
      const key = event.key.toLowerCase();

      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " ", "p", "f"].includes(key)) {
        event.preventDefault();
      }

      const dirMap: Record<string, Direction> = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
      };

      if (key in dirMap) {
        const nextDir = dirMap[key];
        if (OPPOSITE_DIR[game.dir] !== nextDir) {
          game.pendingDir = nextDir;
        }
      }

      if (key === " ") {
        if (game.mode === "menu" || game.mode === "gameover") {
          restartGame();
          return;
        }
        togglePause();
      }

      if (key === "p") {
        togglePause();
      }

      if (key === "f") {
        const root = canvasRef.current?.parentElement;
        if (!root) return;
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          void root.requestFullscreen();
        }
      }

      if (key === "escape" && document.fullscreenElement) {
        void document.exitFullscreen();
      }

      draw();
    };

    window.addEventListener("keydown", keyHandler);

    const animate = (time: number) => {
      if (lastFrameRef.current == null) {
        lastFrameRef.current = time;
      }
      const delta = time - lastFrameRef.current;
      lastFrameRef.current = time;
      stepByMs(Math.min(120, delta));
      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    window.render_game_to_text = () => {
      const game = stateRef.current;
      return JSON.stringify({
        mode: game.mode,
        coordinateSystem: "origin: top-left, x increases right, y increases downward, units: grid cells",
        gridSize: game.gridSize,
        player: {
          head: game.snake[0],
          direction: game.dir,
          pendingDirection: game.pendingDir,
          length: game.snake.length,
        },
        snake: game.snake,
        food: game.food,
        score: game.score,
        best: bestRef.current,
        speedMsPerStep: game.speedMs,
        tickCounter: game.tickCounter,
      });
    };

    window.advanceTime = (ms: number) => {
      const boundedMs = Math.max(0, Number(ms) || 0);
      stepByMs(boundedMs);
      return window.render_game_to_text();
    };

    return () => {
      window.removeEventListener("keydown", keyHandler);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, [draw, restartGame, stepByMs, togglePause]);

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

      <div ref={stageRef} className="game-stage" role="application" aria-label={text.title}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="game-canvas"
          style={
            canvasDisplaySize
              ? { width: `${canvasDisplaySize}px`, height: `${canvasDisplaySize}px` }
              : undefined
          }
        />
      </div>

      <div className="game-toolbar">
        <button className="game-button" type="button" onClick={restartGame}>
          {mode === "gameover" ? text.restart : text.start}
        </button>
        <button className="game-button game-button-alt" type="button" onClick={togglePause}>
          {mode === "paused" ? text.stateRunning : text.statePaused}
        </button>
        <dl className="game-stats" aria-label="game-stats">
          <div>
            <dt>{text.score}</dt>
            <dd>{score}</dd>
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
    </section>
  );
}

function createInitialState(): GameState {
  return {
    mode: "menu",
    gridSize: GRID_SIZE,
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    dir: "right",
    pendingDir: "right",
    food: { x: 14, y: 10 },
    score: 0,
    speedMs: BASE_SPEED_MS,
    tickCounter: 0,
  };
}

function spawnFood(gridSize: number, snake: Point[]): Point {
  const occupied = new Set(snake.map((node) => `${node.x},${node.y}`));
  const freeCells: Point[] = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return { x: 0, y: 0 };
  }

  return freeCells[Math.floor(Math.random() * freeCells.length)];
}

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => string | undefined;
  }
}
