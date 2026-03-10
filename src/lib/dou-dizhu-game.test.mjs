import test from "node:test";
import assert from "node:assert/strict";

import {
  advanceGame,
  callBid,
  canBeatCombo,
  chooseAiAction,
  chooseAiBid,
  createDeck,
  createInitialRound,
  identifyCombo,
  passTurn,
  playCards,
  restartRound,
  toggleCardSelection,
} from "./dou-dizhu-game.mjs";

function card(rank, suit, index = 0) {
  return {
    id: `${rank}-${suit}-${index}`,
    rank,
    suit,
    label: `${rank}-${suit}`,
    accent: suit === "heart" || suit === "diamond" ? "red" : "dark",
  };
}

function emptyActions() {
  return {
    player: { type: "wait", cards: [], combo: null, value: null },
    left: { type: "wait", cards: [], combo: null, value: null },
    right: { type: "wait", cards: [], combo: null, value: null },
  };
}

test("deck contains 54 unique cards", () => {
  const deck = createDeck();
  assert.equal(deck.length, 54);
  assert.equal(new Set(deck.map((item) => item.id)).size, 54);
});

test("initial round starts in bidding mode with hidden bottom cards", () => {
  const round = createInitialRound(() => 0.3);
  assert.equal(round.mode, "bidding");
  assert.equal(round.hands.player.length, 17);
  assert.equal(round.bottomCards.length, 3);
  assert.equal(round.landlord, null);
});

test("calling bid assigns landlord and grants bottom cards", () => {
  const start = {
    ...createInitialRound(() => 0.1),
    hands: {
      player: [card(17, "joker"), card(16, "joker"), card(15, "spade")],
      left: [card(3, "spade")],
      right: [card(4, "spade")],
    },
    bottomCards: [card(14, "heart"), card(13, "club"), card(12, "diamond")],
  };

  const afterPlayer = callBid(start, "player", 2);
  const afterLeft = callBid({ ...afterPlayer, currentTurn: "left" }, "left", 0);
  const afterRight = callBid({ ...afterLeft, currentTurn: "right" }, "right", 0);

  assert.equal(afterRight.mode, "playing");
  assert.equal(afterRight.landlord, "player");
  assert.equal(afterRight.hands.player.length, 6);
  assert.equal(afterRight.currentTurn, "player");
});

test("identifies core Dou Dizhu combos", () => {
  assert.deepEqual(identifyCombo([card(9, "spade")]), { type: "single", rank: 9, length: 1 });
  assert.deepEqual(identifyCombo([card(6, "spade"), card(6, "heart")]), { type: "pair", rank: 6, length: 2 });
  assert.deepEqual(
    identifyCombo([card(10, "spade"), card(10, "heart"), card(10, "club"), card(4, "spade")]),
    { type: "triple-single", rank: 10, length: 4 },
  );
  assert.deepEqual(
    identifyCombo([card(7, "spade"), card(8, "heart"), card(9, "club"), card(10, "diamond"), card(11, "spade")]),
    { type: "straight", rank: 11, length: 5 },
  );
  assert.deepEqual(identifyCombo([card(16, "joker"), card(17, "joker")]), { type: "rocket", rank: 17, length: 2 });
});

test("combo comparison enforces same-shape rules except bombs and rocket", () => {
  assert.equal(canBeatCombo({ type: "pair", rank: 10, length: 2 }, { type: "pair", rank: 9, length: 2 }), true);
  assert.equal(canBeatCombo({ type: "pair", rank: 10, length: 2 }, { type: "single", rank: 14, length: 1 }), false);
  assert.equal(canBeatCombo({ type: "bomb", rank: 5, length: 4 }, { type: "straight", rank: 11, length: 5 }), true);
  assert.equal(canBeatCombo({ type: "rocket", rank: 17, length: 2 }, { type: "bomb", rank: 15, length: 4 }), true);
});

test("player play updates trick and rejects weaker follow-up", () => {
  const start = {
    mode: "playing",
    phase: "play",
    currentTurn: "player",
    currentTrick: null,
    landlord: "player",
    lastNonPassPlayer: "player",
    consecutivePasses: 0,
    hands: {
      player: [card(4, "spade"), card(4, "heart"), card(7, "spade")],
      left: [card(5, "spade")],
      right: [card(9, "spade")],
    },
    bottomCards: [],
    selectedCardIds: [],
    winner: null,
    round: 1,
    pendingAiMs: null,
    feedback: "",
    lastActions: emptyActions(),
    bids: { player: 2, left: 0, right: 0 },
    highestBid: 2,
    landlord: "player",
  };

  const played = playCards(start, "player", ["4-spade-0", "4-heart-0"]);
  assert.equal(played.currentTrick.combo.type, "pair");
  assert.equal(played.currentTurn, "left");

  const weaker = playCards(
    {
      ...played,
      currentTurn: "left",
      hands: {
        ...played.hands,
        left: [card(3, "spade"), card(3, "heart")],
      },
    },
    "left",
    ["3-spade-0", "3-heart-0"],
  );
  assert.equal(weaker.feedback, "must-beat");
});

test("two passes clear the table and return lead to last trick winner", () => {
  const state = {
    mode: "playing",
    phase: "play",
    currentTurn: "left",
    currentTrick: {
      playerId: "player",
      combo: { type: "single", rank: 10, length: 1 },
      cards: [card(10, "spade")],
    },
    lastNonPassPlayer: "player",
    consecutivePasses: 0,
    hands: {
      player: [card(6, "spade")],
      left: [card(4, "spade")],
      right: [card(8, "spade")],
    },
    bottomCards: [],
    selectedCardIds: [],
    winner: null,
    round: 1,
    pendingAiMs: 700,
    feedback: "",
    lastActions: emptyActions(),
    bids: { player: 2, left: 0, right: 0 },
    highestBid: 2,
    landlord: "player",
  };

  const afterLeftPass = passTurn(state, "left");
  const afterRightPass = passTurn({ ...afterLeftPass, currentTurn: "right", pendingAiMs: null }, "right");

  assert.equal(afterRightPass.currentTurn, "player");
  assert.equal(afterRightPass.currentTrick, null);
  assert.equal(afterRightPass.consecutivePasses, 0);
});

test("ai chooses bids and responses", () => {
  const bidState = {
    ...createInitialRound(() => 0.1),
    currentTurn: "left",
    hands: {
      player: [card(3, "spade")],
      left: [card(17, "joker"), card(16, "joker"), card(15, "spade"), card(14, "heart")],
      right: [card(3, "heart")],
    },
  };
  assert.equal(chooseAiBid(bidState, "left"), 3);

  const playState = {
    mode: "playing",
    phase: "play",
    currentTurn: "left",
    currentTrick: {
      playerId: "player",
      combo: { type: "single", rank: 9, length: 1 },
      cards: [card(9, "spade")],
    },
    lastNonPassPlayer: "player",
    consecutivePasses: 0,
    hands: {
      player: [card(9, "spade")],
      left: [card(10, "spade"), card(3, "heart")],
      right: [card(4, "spade")],
    },
    bottomCards: [],
    selectedCardIds: [],
    winner: null,
    round: 1,
    pendingAiMs: 10,
    feedback: "",
    lastActions: emptyActions(),
    bids: { player: 2, left: 0, right: 0 },
    highestBid: 2,
    landlord: "player",
  };

  assert.deepEqual(chooseAiAction(playState, "left"), { type: "play", cardIds: ["10-spade-0"] });
});

test("advanceGame resolves queued ai bid", () => {
  const state = {
    ...createInitialRound(() => 0.1),
    currentTurn: "left",
    pendingAiMs: 10,
    hands: {
      player: [card(3, "spade")],
      left: [card(17, "joker"), card(16, "joker"), card(15, "spade"), card(14, "heart")],
      right: [card(4, "spade")],
    },
  };

  const next = advanceGame(state, 20);
  assert.equal(next.bids.left, 3);
  assert.equal(next.mode, "playing");
  assert.equal(next.landlord, "left");
});

test("restartRound resets selection and deals a new bidding state", () => {
  const seeded = (() => {
    let current = 0;
    return () => {
      current = (current + 0.17) % 1;
      return current;
    };
  })();

  const round = restartRound({ round: 4, selectedCardIds: ["x"] }, seeded);
  const selected = toggleCardSelection({ ...round, mode: "playing", currentTurn: "player" }, round.hands.player[0].id);

  assert.equal(round.round, 5);
  assert.equal(round.mode, "bidding");
  assert.equal(round.hands.player.length, 17);
  assert.equal(round.bottomCards.length, 3);
  assert.equal(selected.selectedCardIds.length, 1);
});
