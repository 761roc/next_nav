import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialSnakeState,
  restartSnakeGame,
  setDirection,
  spawnFood,
  stepSnakeGame,
} from "./snake-game.mjs";

test("moves the snake one cell in the queued direction", () => {
  const state = restartSnakeGame({ gridSize: 8, direction: "right" });
  const next = stepSnakeGame(state, () => 0);

  assert.deepEqual(next.snake[0], { x: 5, y: 4 });
  assert.equal(next.snake.length, 3);
  assert.equal(next.tickCount, 1);
});

test("grows and increments score after eating food", () => {
  const state = {
    ...restartSnakeGame({ gridSize: 8, direction: "right" }),
    food: { x: 5, y: 4 },
  };

  const next = stepSnakeGame(state, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.notDeepEqual(next.food, { x: 5, y: 4 });
});

test("detects wall collisions", () => {
  const state = {
    ...restartSnakeGame({ gridSize: 4, direction: "right" }),
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ],
    food: { x: 0, y: 0 },
  };

  const next = stepSnakeGame(state, () => 0);

  assert.equal(next.mode, "gameover");
});

test("detects self collisions but allows moving into the old tail cell", () => {
  const selfCollision = {
    mode: "running",
    gridSize: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    direction: "up",
    pendingDirection: "left",
    food: { x: 5, y: 5 },
    score: 0,
    tickCount: 0,
  };

  assert.equal(stepSnakeGame(selfCollision, () => 0).mode, "gameover");

  const tailMove = {
    mode: "running",
    gridSize: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ],
    direction: "up",
    pendingDirection: "left",
    food: { x: 5, y: 5 },
    score: 0,
    tickCount: 0,
  };

  const next = stepSnakeGame(tailMove, () => 0);
  assert.equal(next.mode, "running");
  assert.deepEqual(next.snake[0], { x: 1, y: 2 });
});

test("food placement skips occupied cells", () => {
  const food = spawnFood(
    3,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
    ],
    () => 0,
  );

  assert.deepEqual(food, { x: 1, y: 1 });
});

test("direction changes reject immediate reversals", () => {
  const state = createInitialSnakeState({ gridSize: 8, direction: "right" });
  const blocked = setDirection(state, "left");
  const allowed = setDirection(state, "up");

  assert.equal(blocked.pendingDirection, "right");
  assert.equal(allowed.pendingDirection, "up");
});
