export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const BASE_TICK_MS = 160;
export const MIN_TICK_MS = 85;
export const SPEED_STEP_MS = 5;

export const OPPOSITE_DIRECTION = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function getTickInterval(score) {
  return Math.max(MIN_TICK_MS, BASE_TICK_MS - score * SPEED_STEP_MS);
}

export function createInitialSnakeState(options = {}) {
  const gridSize = options.gridSize ?? GRID_SIZE;
  const direction = options.direction ?? INITIAL_DIRECTION;
  const center = Math.floor(gridSize / 2);
  const snake =
    direction === "right"
      ? [
          { x: center, y: center },
          { x: center - 1, y: center },
          { x: center - 2, y: center },
        ]
      : direction === "left"
        ? [
            { x: center, y: center },
            { x: center + 1, y: center },
            { x: center + 2, y: center },
          ]
        : direction === "down"
          ? [
              { x: center, y: center },
              { x: center, y: center - 1 },
              { x: center, y: center - 2 },
            ]
          : [
              { x: center, y: center },
              { x: center, y: center + 1 },
              { x: center, y: center + 2 },
            ];

  const rng = options.rng ?? Math.random;

  return {
    mode: "ready",
    gridSize,
    snake,
    direction,
    pendingDirection: direction,
    food: spawnFood(gridSize, snake, rng),
    score: 0,
    tickCount: 0,
  };
}

export function restartSnakeGame(options = {}) {
  return {
    ...createInitialSnakeState(options),
    mode: "running",
  };
}

export function setDirection(state, nextDirection) {
  if (!nextDirection || !(nextDirection in DIRECTION_VECTORS)) {
    return state;
  }

  const blockedByCurrent = OPPOSITE_DIRECTION[state.direction] === nextDirection;
  const blockedByPending = OPPOSITE_DIRECTION[state.pendingDirection] === nextDirection;
  if (blockedByCurrent || blockedByPending) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

export function togglePause(state) {
  if (state.mode === "running") {
    return { ...state, mode: "paused" };
  }

  if (state.mode === "paused") {
    return { ...state, mode: "running" };
  }

  return state;
}

export function stepSnakeGame(state, rng = Math.random) {
  if (state.mode !== "running") {
    return state;
  }

  const direction = state.pendingDirection;
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  const ateFood = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
  );
  const hitsWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize;

  if (hitsSelf || hitsWall) {
    return {
      ...state,
      mode: "gameover",
      direction,
      pendingDirection: direction,
    };
  }

  const grownSnake = [nextHead, ...state.snake];
  const nextSnake = ateFood ? grownSnake : grownSnake.slice(0, -1);

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: ateFood ? spawnFood(state.gridSize, nextSnake, rng) : state.food,
    score: ateFood ? state.score + 1 : state.score,
    tickCount: state.tickCount + 1,
  };
}

export function spawnFood(gridSize, snake, rng = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return snake[0] ?? { x: 0, y: 0 };
  }

  const normalized = Number(rng());
  const safeValue = Number.isFinite(normalized) ? normalized : 0;
  const index = Math.min(openCells.length - 1, Math.floor(safeValue * openCells.length));
  return openCells[index];
}
