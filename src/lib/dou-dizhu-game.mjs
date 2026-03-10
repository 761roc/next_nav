export const PLAYER_IDS = ["player", "left", "right"];
export const AI_DELAY_MS = 700;

const SUIT_ORDER = {
  joker: 0,
  spade: 1,
  heart: 2,
  club: 3,
  diamond: 4,
};

const SUIT_SYMBOL = {
  spade: "♠",
  heart: "♥",
  club: "♣",
  diamond: "♦",
  joker: "",
};

const RANK_LABEL = {
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
  15: "2",
  16: "SJ",
  17: "BJ",
};

const COMBO_PRIORITY = {
  single: 1,
  pair: 2,
  triple: 3,
  "triple-single": 4,
  "triple-pair": 5,
  straight: 6,
  bomb: 7,
  rocket: 8,
};

export function createDeck() {
  const deck = [];
  const suits = ["spade", "heart", "club", "diamond"];
  const ranks = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  let sequence = 0;

  for (const rank of ranks) {
    for (const suit of suits) {
      deck.push(createCard(rank, suit, sequence));
      sequence += 1;
    }
  }

  deck.push(createCard(16, "joker", sequence));
  deck.push(createCard(17, "joker", sequence + 1));

  return deck;
}

export function createInitialRound(rng = Math.random) {
  const deck = shuffleDeck(createDeck(), rng);
  const hands = {
    player: sortCards(deck.slice(0, 17)),
    left: sortCards(deck.slice(17, 34)),
    right: sortCards(deck.slice(34, 51)),
  };
  const bottomCards = sortCards(deck.slice(51));

  return {
    mode: "bidding",
    currentTurn: "player",
    currentTrick: null,
    lastNonPassPlayer: null,
    consecutivePasses: 0,
    hands,
    bottomCards,
    selectedCardIds: [],
    winner: null,
    round: 1,
    pendingAiMs: null,
    feedback: "",
    lastActions: createEmptyActions(),
    bids: { player: null, left: null, right: null },
    highestBid: 0,
    landlord: null,
    phase: "call",
  };
}

export function restartRound(state, rng = Math.random) {
  const next = createInitialRound(rng);
  return {
    ...next,
    round: state?.round ? state.round + 1 : 1,
  };
}

export function callBid(state, playerId, bid) {
  if (state.mode !== "bidding" || state.currentTurn !== playerId) {
    return state;
  }

  if (![0, 1, 2, 3].includes(bid)) {
    return withFeedback(state, "invalid-bid");
  }

  const nextBids = { ...state.bids, [playerId]: bid };
  const highestBid = Math.max(state.highestBid, bid);
  const highestPlayer = bid >= state.highestBid && bid > 0 ? playerId : state.landlord;
  const nextState = {
    ...state,
    bids: nextBids,
    highestBid,
    landlord: highestPlayer,
    currentTurn: getNextPlayer(playerId),
    feedback: "",
    lastActions: {
      ...(state.lastActions ?? createEmptyActions()),
      [playerId]: {
        type: "bid",
        cards: [],
        combo: null,
        value: bid,
      },
    },
  };

  const everyoneActed = PLAYER_IDS.every((id) => nextBids[id] !== null);
  if (bid === 3 || everyoneActed) {
    return finalizeBidding(nextState, state);
  }

  return scheduleAi(nextState);
}

export function toggleCardSelection(state, cardId) {
  if (state.mode !== "playing" || state.currentTurn !== "player") {
    return state;
  }

  const selected = new Set(state.selectedCardIds);
  if (selected.has(cardId)) {
    selected.delete(cardId);
  } else {
    selected.add(cardId);
  }

  return {
    ...state,
    selectedCardIds: sortSelectedIds(state.hands.player, [...selected]),
    feedback: "",
  };
}

export function clearSelection(state) {
  return {
    ...state,
    selectedCardIds: [],
    feedback: "",
  };
}

export function playSelectedCards(state) {
  return playCards(state, "player", state.selectedCardIds);
}

export function playCards(state, playerId, cardIds) {
  if (state.mode !== "playing" || state.currentTurn !== playerId) {
    return state;
  }

  const hand = state.hands[playerId];
  const chosenCards = hand.filter((card) => cardIds.includes(card.id));
  if (chosenCards.length !== cardIds.length || chosenCards.length === 0) {
    return withFeedback(state, "invalid-play");
  }

  const combo = identifyCombo(chosenCards);
  if (!combo) {
    return withFeedback(state, "invalid-combo");
  }

  const mustBeat = state.currentTrick != null && state.currentTrick.playerId !== playerId;
  if (mustBeat && !canBeatCombo(combo, state.currentTrick.combo)) {
    return withFeedback(state, "must-beat");
  }

  const nextHands = {
    ...state.hands,
    [playerId]: sortCards(hand.filter((card) => !cardIds.includes(card.id))),
  };

  const nextState = {
    ...state,
    hands: nextHands,
    currentTrick: {
      playerId,
      combo,
      cards: sortCards(chosenCards),
    },
    lastNonPassPlayer: playerId,
    consecutivePasses: 0,
    selectedCardIds: playerId === "player" ? [] : state.selectedCardIds,
    currentTurn: getNextPlayer(playerId),
    feedback: "",
    lastActions: {
      ...(state.lastActions ?? createEmptyActions()),
      [playerId]: {
        type: "play",
        cards: sortCards(chosenCards),
        combo,
        value: null,
      },
    },
  };

  if (nextHands[playerId].length === 0) {
    return {
      ...nextState,
      mode: "finished",
      winner: playerId,
      pendingAiMs: null,
    };
  }

  return scheduleAi(nextState);
}

export function passTurn(state, playerId) {
  if (state.mode !== "playing" || state.currentTurn !== playerId) {
    return state;
  }

  if (!state.currentTrick || state.currentTrick.playerId === playerId) {
    return withFeedback(state, "cannot-pass");
  }

  let nextState = {
    ...state,
    currentTurn: getNextPlayer(playerId),
    consecutivePasses: state.consecutivePasses + 1,
    selectedCardIds: playerId === "player" ? [] : state.selectedCardIds,
    feedback: "",
    lastActions: {
      ...(state.lastActions ?? createEmptyActions()),
      [playerId]: {
        type: "pass",
        cards: [],
        combo: null,
        value: null,
      },
    },
  };

  if (nextState.consecutivePasses >= 2) {
    nextState = {
      ...nextState,
      currentTurn: state.lastNonPassPlayer,
      currentTrick: null,
      consecutivePasses: 0,
    };
  }

  return scheduleAi(nextState);
}

export function advanceGame(state, deltaMs) {
  if (state.mode === "finished") {
    return state;
  }

  let remaining = Math.max(0, Number(deltaMs) || 0);
  let current = state;

  while (remaining > 0 && current.currentTurn !== "player" && current.pendingAiMs != null) {
    const pending = current.pendingAiMs ?? AI_DELAY_MS;
    if (remaining < pending) {
      return { ...current, pendingAiMs: pending - remaining };
    }

    remaining -= pending;
    current =
      current.mode === "bidding"
        ? runAiBid({ ...current, pendingAiMs: 0 })
        : runAiTurn({ ...current, pendingAiMs: 0 });
  }

  return current;
}

export function identifyCombo(cards) {
  if (!cards || cards.length === 0) return null;

  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  const ranks = sorted.map((card) => card.rank);
  const groups = getRankGroups(sorted);
  const counts = groups.map((group) => group.cards.length).sort((a, b) => b - a);

  if (sorted.length === 1) return comboPayload("single", ranks[0], sorted.length);
  if (sorted.length === 2 && ranks[0] === 16 && ranks[1] === 17) return comboPayload("rocket", 17, 2);
  if (sorted.length === 2 && groups.length === 1) return comboPayload("pair", ranks[0], 2);
  if (sorted.length === 3 && groups.length === 1) return comboPayload("triple", ranks[0], 3);
  if (sorted.length === 4 && groups.length === 1) return comboPayload("bomb", ranks[0], 4);

  if (sorted.length === 4 && counts.join(",") === "3,1") {
    const triple = groups.find((group) => group.cards.length === 3);
    return comboPayload("triple-single", triple.rank, 4);
  }

  if (sorted.length === 5 && counts.join(",") === "3,2") {
    const triple = groups.find((group) => group.cards.length === 3);
    return comboPayload("triple-pair", triple.rank, 5);
  }

  const isStraight =
    sorted.length >= 5 &&
    groups.length === sorted.length &&
    ranks.every((rank) => rank < 15) &&
    ranks.every((rank, index) => index === 0 || rank === ranks[index - 1] + 1);

  if (isStraight) {
    return comboPayload("straight", ranks[ranks.length - 1], sorted.length);
  }

  return null;
}

export function canBeatCombo(candidate, target) {
  if (!target) return true;
  if (!candidate) return false;
  if (candidate.type === "rocket") return true;
  if (target.type === "rocket") return false;
  if (candidate.type === "bomb" && target.type !== "bomb") return true;
  if (candidate.type !== target.type) return false;
  if (candidate.length !== target.length) return false;
  return candidate.rank > target.rank;
}

export function chooseAiAction(state, playerId = state.currentTurn) {
  const candidates = listPlayableCombos(state.hands[playerId]);
  const target = state.currentTrick && state.currentTrick.playerId !== playerId ? state.currentTrick.combo : null;

  if (!target) {
    return {
      type: "play",
      cardIds: pickLeadCombo(candidates).cards.map((card) => card.id),
    };
  }

  const valid = candidates.filter((entry) => canBeatCombo(entry.combo, target));
  if (valid.length === 0) return { type: "pass", cardIds: [] };

  return {
    type: "play",
    cardIds: sortAiResponses(valid, target)[0].cards.map((card) => card.id),
  };
}

export function chooseAiBid(state, playerId = state.currentTurn) {
  const hand = state.hands[playerId];
  const strength = evaluateHandForBid(hand);
  if (state.highestBid >= 3) return 0;
  if (strength >= 11 && state.highestBid < 3) return 3;
  if (strength >= 8 && state.highestBid < 2) return 2;
  if (strength >= 5 && state.highestBid < 1) return 1;
  return 0;
}

export function listPlayableCombos(hand) {
  const sorted = sortCards(hand);
  const groups = getRankGroups(sorted);
  const singles = sorted.map((card) => ({
    combo: comboPayload("single", card.rank, 1),
    cards: [card],
  }));
  const pairs = groups.filter((group) => group.cards.length >= 2).map((group) => ({
    combo: comboPayload("pair", group.rank, 2),
    cards: group.cards.slice(0, 2),
  }));
  const triples = groups.filter((group) => group.cards.length >= 3).map((group) => ({
    combo: comboPayload("triple", group.rank, 3),
    cards: group.cards.slice(0, 3),
  }));
  const bombs = groups.filter((group) => group.cards.length === 4).map((group) => ({
    combo: comboPayload("bomb", group.rank, 4),
    cards: group.cards.slice(0, 4),
  }));

  const rockets =
    hand.some((card) => card.rank === 16) && hand.some((card) => card.rank === 17)
      ? [{ combo: comboPayload("rocket", 17, 2), cards: sortCards(hand.filter((card) => card.rank >= 16)) }]
      : [];

  const tripleSingles = [];
  const triplePairs = [];
  for (const triple of triples) {
    for (const single of singles) {
      if (single.cards[0].rank === triple.combo.rank) continue;
      tripleSingles.push({
        combo: comboPayload("triple-single", triple.combo.rank, 4),
        cards: sortCards([...triple.cards, ...single.cards]),
      });
    }

    for (const pair of pairs) {
      if (pair.combo.rank === triple.combo.rank) continue;
      triplePairs.push({
        combo: comboPayload("triple-pair", triple.combo.rank, 5),
        cards: sortCards([...triple.cards, ...pair.cards]),
      });
    }
  }

  const straights = getStraightCombos(sorted);
  const unique = new Map();
  for (const entry of [...singles, ...pairs, ...triples, ...tripleSingles, ...triplePairs, ...straights, ...bombs, ...rockets]) {
    const key = `${entry.combo.type}:${entry.combo.rank}:${entry.combo.length}:${entry.cards.map((card) => card.id).join(",")}`;
    if (!unique.has(key)) unique.set(key, entry);
  }

  return [...unique.values()];
}

export function sortCards(cards) {
  return [...cards].sort((a, b) => {
    if (b.rank !== a.rank) return b.rank - a.rank;
    return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
  });
}

export function formatCard(card) {
  return `${RANK_LABEL[card.rank]}${SUIT_SYMBOL[card.suit]}`;
}

function createCard(rank, suit, sequence) {
  return {
    id: `${rank}-${suit}-${sequence}`,
    rank,
    suit,
    label: `${RANK_LABEL[rank]}${SUIT_SYMBOL[suit]}`,
    accent: suit === "heart" || suit === "diamond" || rank === 17 ? "red" : "dark",
  };
}

function shuffleDeck(cards, rng = Math.random) {
  const deck = [...cards];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor((Number(rng()) || 0) * (index + 1));
    const temp = deck[index];
    deck[index] = deck[swapIndex];
    deck[swapIndex] = temp;
  }
  return deck;
}

function comboPayload(type, rank, length) {
  return { type, rank, length };
}

function getRankGroups(cards) {
  const groups = new Map();
  for (const card of cards) {
    if (!groups.has(card.rank)) groups.set(card.rank, []);
    groups.get(card.rank).push(card);
  }

  return [...groups.entries()]
    .map(([rank, groupedCards]) => ({ rank, cards: sortCards(groupedCards) }))
    .sort((a, b) => a.rank - b.rank);
}

function getStraightCombos(hand) {
  const unique = getRankGroups(hand).filter((group) => group.rank < 15).map((group) => group.cards[0]);
  const combos = [];
  let start = 0;

  while (start < unique.length) {
    let end = start + 1;
    while (end < unique.length && unique[end].rank === unique[end - 1].rank + 1) {
      end += 1;
    }

    const run = unique.slice(start, end);
    if (run.length >= 5) {
      for (let length = 5; length <= run.length; length += 1) {
        for (let offset = 0; offset <= run.length - length; offset += 1) {
          const cards = run.slice(offset, offset + length);
          combos.push({
            combo: comboPayload("straight", cards[cards.length - 1].rank, length),
            cards: sortCards(cards),
          });
        }
      }
    }

    start = end;
  }

  return combos;
}

function sortSelectedIds(hand, selectedIds) {
  const order = new Map(hand.map((card, index) => [card.id, index]));
  return [...selectedIds].sort((left, right) => order.get(left) - order.get(right));
}

function withFeedback(state, feedback) {
  return { ...state, feedback };
}

function scheduleAi(state) {
  if (state.mode === "finished" || state.currentTurn === "player") {
    return { ...state, pendingAiMs: null };
  }

  return { ...state, pendingAiMs: AI_DELAY_MS };
}

function runAiTurn(state) {
  const move = chooseAiAction(state, state.currentTurn);
  return move.type === "pass" ? passTurn(state, state.currentTurn) : playCards(state, state.currentTurn, move.cardIds);
}

function runAiBid(state) {
  const bid = chooseAiBid(state, state.currentTurn);
  return callBid(state, state.currentTurn, bid);
}

function finalizeBidding(state, previousState) {
  if (!state.landlord || state.highestBid === 0) {
    return scheduleAi(restartRound(previousState ?? state));
  }

  const hands = {
    ...state.hands,
    [state.landlord]: sortCards([...state.hands[state.landlord], ...state.bottomCards]),
  };

  return scheduleAi({
    ...state,
    mode: "playing",
    phase: "play",
    hands,
    currentTurn: state.landlord,
    lastNonPassPlayer: state.landlord,
    selectedCardIds: [],
    feedback: "",
  });
}

function pickLeadCombo(candidates) {
  return [...candidates].sort((left, right) => {
    if (COMBO_PRIORITY[left.combo.type] !== COMBO_PRIORITY[right.combo.type]) {
      return COMBO_PRIORITY[left.combo.type] - COMBO_PRIORITY[right.combo.type];
    }
    if (left.combo.rank !== right.combo.rank) return left.combo.rank - right.combo.rank;
    return left.combo.length - right.combo.length;
  })[0];
}

function sortAiResponses(candidates, target) {
  return [...candidates].sort((left, right) => {
    const leftBombPenalty = left.combo.type === "bomb" && target.type !== "bomb" ? 10_000 : 0;
    const rightBombPenalty = right.combo.type === "bomb" && target.type !== "bomb" ? 10_000 : 0;
    const leftScore = leftBombPenalty + COMBO_PRIORITY[left.combo.type] * 1000 + left.combo.rank * 10 + left.combo.length;
    const rightScore = rightBombPenalty + COMBO_PRIORITY[right.combo.type] * 1000 + right.combo.rank * 10 + right.combo.length;
    return leftScore - rightScore;
  });
}

function evaluateHandForBid(hand) {
  return hand.reduce((score, card) => {
    if (card.rank >= 16) return score + 4;
    if (card.rank === 15) return score + 2;
    if (card.rank >= 13) return score + 1;
    return score;
  }, 0) + getRankGroups(hand).filter((group) => group.cards.length >= 2).length;
}

function getNextPlayer(playerId) {
  const currentIndex = PLAYER_IDS.indexOf(playerId);
  return PLAYER_IDS[(currentIndex + 1) % PLAYER_IDS.length];
}

function createEmptyActions() {
  return {
    player: { type: "wait", cards: [], combo: null, value: null },
    left: { type: "wait", cards: [], combo: null, value: null },
    right: { type: "wait", cards: [], combo: null, value: null },
  };
}
