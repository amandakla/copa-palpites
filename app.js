const groups = [
  ["México", "África do Sul", "Coreia do Sul", "República Tcheca"],
  ["Canadá", "Bósnia", "Catar", "Suíça"],
  ["Brasil", "Marrocos", "Haiti", "Escócia"],
  ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
  ["Alemanha", "Curaçao", "Costa do Marfim", "Equador"],
  ["Holanda", "Japão", "Suécia", "Tunísia"],
  ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
  ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
  ["França", "Senegal", "Repescagem Intercontinental 2", "Noruega"],
  ["Argentina", "Argélia", "Áustria", "Jordânia"],
  ["Portugal", "RD Congo", "Uzbequistão", "Colômbia"],
  ["Inglaterra", "Croácia", "Gana", "Panamá"]
];

const STORAGE_KEY = "copa-palpites-v3";
const USERS_KEY = "copa-palpites-users-v1";
const PERIODS_KEY = "copa-palpites-periods-v1";
const SESSION_KEY = "copa-palpites-session-v1";

const defaultUsers = [
  { id: "amanda", username: "amanda" },
  { id: "bruno", username: "bruno" },
  { id: "carol", username: "carol" },
  { id: "diego", username: "diego" }
];

const flags = {
  "Alemanha": "🇩🇪",
  "África do Sul": "🇿🇦",
  "Arábia Saudita": "🇸🇦",
  "Argélia": "🇩🇿",
  "Argentina": "🇦🇷",
  "Austrália": "🇦🇺",
  "Áustria": "🇦🇹",
  "Bélgica": "🇧🇪",
  "Bósnia": "🇧🇦",
  "Brasil": "🇧🇷",
  "Cabo Verde": "🇨🇻",
  "Canadá": "🇨🇦",
  "Catar": "🇶🇦",
  "Colômbia": "🇨🇴",
  "Coreia do Sul": "🇰🇷",
  "Costa do Marfim": "🇨🇮",
  "Croácia": "🇭🇷",
  "Curaçao": "🇨🇼",
  "Egito": "🇪🇬",
  "Equador": "🇪🇨",
  "Escócia": "🏴",
  "Espanha": "🇪🇸",
  "Estados Unidos": "🇺🇸",
  "França": "🇫🇷",
  "Gana": "🇬🇭",
  "Haiti": "🇭🇹",
  "Holanda": "🇳🇱",
  "Inglaterra": "🏴",
  "Irã": "🇮🇷",
  "Japão": "🇯🇵",
  "Jordânia": "🇯🇴",
  "Marrocos": "🇲🇦",
  "México": "🇲🇽",
  "Noruega": "🇳🇴",
  "Nova Zelândia": "🇳🇿",
  "Panamá": "🇵🇦",
  "Paraguai": "🇵🇾",
  "Portugal": "🇵🇹",
  "RD Congo": "🇨🇩",
  "Repescagem Intercontinental 2": "🌐",
  "República Tcheca": "🇨🇿",
  "Senegal": "🇸🇳",
  "Suécia": "🇸🇪",
  "Suíça": "🇨🇭",
  "Tunísia": "🇹🇳",
  "Turquia": "🇹🇷",
  "Uruguai": "🇺🇾",
  "Uzbequistão": "🇺🇿"
};

const teamNotes = {
  "República Tcheca": "repescagem",
  "Bósnia": "repescagem",
  "Turquia": "repescagem",
  "Suécia": "repescagem",
  "Repescagem Intercontinental 2": "Bolívia ou Iraque"
};

const rounds = [
  { key: "r32", title: "16 avos", size: 16 },
  { key: "r16", title: "Oitavas", size: 8 },
  { key: "qf", title: "Quartas", size: 4 },
  { key: "sf", title: "Semifinais", size: 2 },
  { key: "final", title: "Final", size: 1 }
];

const state = {
  activeId: null,
  activePeriodId: null,
  currentUserId: null,
  users: [],
  periods: [],
  predictions: [],
  picks: createEmptyPicks(),
  bracketWinners: {}
};

const els = {
  appShell: document.querySelector("#appShell"),
  authScreen: document.querySelector("#authScreen"),
  authForm: document.querySelector("#authForm"),
  authUsername: document.querySelector("#authUsername"),
  authFeedback: document.querySelector("#authFeedback"),
  logoutBtn: document.querySelector("#logoutBtn"),
  accountAvatar: document.querySelector("#accountAvatar"),
  accountUsername: document.querySelector("#accountUsername"),
  groupsGrid: document.querySelector("#groupsGrid"),
  bracket: document.querySelector("#bracket"),
  periodHero: document.querySelector("#periodHero"),
  periodList: document.querySelector("#periodList"),
  feedList: document.querySelector("#feedList"),
  activePeriodBar: document.querySelector("#activePeriodBar"),
  adminPeriodList: document.querySelector("#adminPeriodList"),
  periodForm: document.querySelector("#periodForm"),
  periodTitle: document.querySelector("#periodTitle"),
  periodStart: document.querySelector("#periodStart"),
  periodEnd: document.querySelector("#periodEnd"),
  periodFeedback: document.querySelector("#periodFeedback"),
  savePredictionBtn: document.querySelector("#savePredictionBtn"),
  saveFeedback: document.querySelector("#saveFeedback"),
  autoFillBtn: document.querySelector("#autoFillBtn"),
  resetBracketBtn: document.querySelector("#resetBracketBtn"),
  editNotice: document.querySelector("#editNotice"),
  predictionList: document.querySelector("#predictionList"),
  qualifiedCount: document.querySelector("#qualifiedCount"),
  completedMatches: document.querySelector("#completedMatches"),
  championName: document.querySelector("#championName")
};

function createEmptyPicks() {
  return groups.map(() => ({ first: null, second: null, third: null }));
}

function groupLabel(index) {
  return String.fromCharCode(65 + index);
}

function init() {
  loadUsers();
  loadSession();
  loadPeriods();
  selectDefaultPeriod();
  loadPredictions();
  setPeriodFormDefaults();
  bindStaticEvents();
  renderAuthState();
  if (!state.currentUserId) return;
  renderHome();
  renderAdminPeriods();
  renderActivePeriodBar();
  renderGroups();
  renderBracket();
  renderPredictions();
  updateStatus();
  updatePermissionState();
}

function setPeriodFormDefaults() {
  const now = new Date();
  const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  els.periodStart.value = toDatetimeLocal(now);
  els.periodEnd.value = toDatetimeLocal(end);
}

function bindStaticEvents() {
  els.authForm.addEventListener("submit", handleAuthSubmit);
  els.logoutBtn.addEventListener("click", logout);

  document.querySelectorAll(".main-tab").forEach((tab) => {
    tab.addEventListener("click", () => setScreen(tab.dataset.screen));
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });

  els.autoFillBtn.addEventListener("click", () => {
    if (isReadOnlyMode() || !canCreateInActivePeriod()) return;
    state.picks = groups.map((teams) => ({
      first: teams[0],
      second: teams[1],
      third: teams[2]
    }));
    state.bracketWinners = {};
    renderGroups();
    renderBracket();
    clearSaveFeedback();
    updateStatus();
  });

  els.resetBracketBtn.addEventListener("click", () => {
    if (isReadOnlyMode() || !canCreateInActivePeriod()) return;
    state.bracketWinners = {};
    renderBracket();
    updateStatus();
  });

  document.querySelector("#newPredictionBtn").addEventListener("click", () => {
    if (!canCreateInActivePeriod()) {
      showSaveFeedback("Não há período aberto para criar novo palpite.");
      setScreen("home");
      return;
    }
    state.activeId = null;
    state.activePeriodId = getOpenPeriod()?.id || state.activePeriodId;
    state.picks = createEmptyPicks();
    state.bracketWinners = {};
    renderGroups();
    renderBracket();
    renderPredictions();
    clearSaveFeedback();
    updateStatus();
    updatePermissionState();
    setScreen("prediction");
  });

  els.savePredictionBtn.addEventListener("click", saveCurrentPrediction);
  els.periodForm.addEventListener("submit", createPeriod);
}

function setScreen(screen) {
  document.querySelectorAll(".main-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.screen === screen);
  });
  document.querySelectorAll(".screen").forEach((section) => {
    section.classList.toggle("active", section.id === `${screen}Screen`);
  });
}

function setView(view) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}View`);
  });
}

function renderGroups() {
  const template = document.querySelector("#groupTemplate");
  els.groupsGrid.innerHTML = "";

  groups.forEach((teams, groupIndex) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".group-title").textContent = `Grupo ${groupLabel(groupIndex)}`;
    const guide = document.createElement("div");
    guide.className = "rank-guide";
    guide.innerHTML = "<span>Seleção</span><span>1º</span><span>2º</span><span>3º</span>";
    node.querySelector(".group-card").insertBefore(guide, node.querySelector(".team-list"));
    const list = node.querySelector(".team-list");

    teams.forEach((team) => {
      const row = document.createElement("div");
      row.className = "team-row";

      const name = document.createElement("div");
      name.className = "team-name";
      name.innerHTML = `
        <span class="flag" aria-hidden="true">${flags[team] || "🏳️"}</span>
        <span class="team-copy">
          <span class="team-text">${team}</span>
          ${teamNotes[team] ? `<small>${teamNotes[team]}</small>` : ""}
        </span>
      `;
      row.appendChild(name);

      [
        ["first", "1"],
        ["second", "2"],
        ["third", "3"]
      ].forEach(([rank, label]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `rank-button rank-${label}`;
        button.textContent = label;
        button.disabled = !canEditActivePrediction();
        button.setAttribute("aria-label", `${team} em ${label}º no Grupo ${groupLabel(groupIndex)}`);

        if (state.picks[groupIndex][rank] === team) {
          button.classList.add("selected");
        }

        button.addEventListener("click", () => selectRank(groupIndex, team, rank));
        row.appendChild(button);
      });

      list.appendChild(row);
    });

    els.groupsGrid.appendChild(node);
  });
}

function selectRank(groupIndex, team, rank) {
  if (isReadOnlyMode() || !canCreateInActivePeriod()) return;
  clearSaveFeedback();
  const groupPick = state.picks[groupIndex];
  const currentRank = Object.keys(groupPick).find((key) => groupPick[key] === team);

  if (groupPick[rank] === team) {
    groupPick[rank] = null;
  } else {
    if (currentRank) groupPick[currentRank] = null;
    groupPick[rank] = team;
  }

  state.bracketWinners = {};
  renderGroups();
  renderBracket();
  updateStatus();
}

function getQualifiedSeeds() {
  const firsts = [];
  const seconds = [];
  const thirds = [];

  state.picks.forEach((pick, index) => {
    const label = groupLabel(index);
    if (pick.first) firsts.push({ team: pick.first, seed: `${label}1` });
    if (pick.second) seconds.push({ team: pick.second, seed: `${label}2` });
    if (pick.third) thirds.push({ team: pick.third, seed: `${label}3` });
  });

  return [...firsts, ...seconds, ...thirds.slice(0, 8)];
}

function buildInitialMatches() {
  const seeds = getQualifiedSeeds();
  const slots = [
    [0, 31], [15, 16], [7, 24], [8, 23],
    [3, 28], [12, 19], [4, 27], [11, 20],
    [1, 30], [14, 17], [6, 25], [9, 22],
    [2, 29], [13, 18], [5, 26], [10, 21]
  ];

  return slots.map(([a, b], index) => ({
    id: `r32-${index}`,
    teams: [seeds[a] || null, seeds[b] || null]
  }));
}

function getRoundMatches(roundKey) {
  if (roundKey === "r32") return buildInitialMatches();

  const previousKey = rounds[rounds.findIndex((round) => round.key === roundKey) - 1].key;
  const previousSize = rounds.find((round) => round.key === previousKey).size;

  return Array.from({ length: previousSize / 2 }, (_, index) => {
    const left = state.bracketWinners[`${previousKey}-${index * 2}`] || null;
    const right = state.bracketWinners[`${previousKey}-${index * 2 + 1}`] || null;
    return {
      id: `${roundKey}-${index}`,
      teams: [left, right]
    };
  });
}

function renderBracket() {
  els.bracket.innerHTML = "";

  const layout = getBracketLayout();
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("bracket-lines");
  svg.setAttribute("viewBox", "0 0 1828 1030");
  svg.setAttribute("aria-hidden", "true");

  layout.links.forEach((link) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", connectorPath(layout.nodes[link.from], layout.nodes[link.to], link.side));
    svg.appendChild(path);
  });

  els.bracket.appendChild(svg);

  layout.order.forEach((nodeId) => {
    const node = layout.nodes[nodeId];
    const match = getRoundMatches(node.roundKey)[node.matchIndex];
    const wrapper = document.createElement("div");
    wrapper.className = `bracket-node ${node.side} ${node.roundKey === "final" ? "final-node" : ""}`;
    wrapper.style.left = `${node.x}px`;
    wrapper.style.top = `${node.y}px`;

    const label = document.createElement("span");
    label.className = "round-label";
    if (!node.showLabel) label.classList.add("placeholder");
    label.textContent = node.showLabel ? node.title : ".";
    wrapper.appendChild(label);
    wrapper.appendChild(renderMatchCard(match, node.roundKey, node.matchIndex));
    els.bracket.appendChild(wrapper);
  });

  els.bracket.appendChild(renderChampionCard(layout.champion));
}

function renderMatchCard(match, roundKey, matchIndex) {
  const card = document.createElement("div");
  card.className = "match";

  match.teams.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "team-pick";
    button.disabled = !entry || !canEditActivePrediction();

    const main = document.createElement("span");
    main.className = "team-main";
    main.innerHTML = entry
      ? `<span class="flag" aria-hidden="true">${flags[entry.team] || "🏳️"}</span><span>${entry.team}</span>`
      : `<span>A definir</span>`;

    const seed = document.createElement("span");
    seed.className = "seed";
    seed.textContent = entry ? entry.seed : "";

    button.appendChild(main);
    button.appendChild(seed);

    if (entry && state.bracketWinners[match.id]?.team === entry.team) {
      button.classList.add("winner");
    }

    button.addEventListener("click", () => selectWinner(match.id, roundKey, matchIndex, entry));
    card.appendChild(button);
  });

  return card;
}

function renderChampionCard() {
  const champion = state.bracketWinners["final-0"];
  const championCard = document.createElement("div");
  championCard.className = "champion-card";
  championCard.style.left = "804px";
  championCard.style.top = "594px";
  championCard.innerHTML = `<span>Campeão</span><strong>${champion ? `${flags[champion.team] || ""} ${champion.team}` : "-"}</strong>`;
  return championCard;
}

function getBracketLayout() {
  const nodes = {};
  const order = [];
  const links = [];
  const nodeWidth = 180;
  const finalWidth = 220;
  const cardHeight = 92;
  const firstY = 10;
  const rowGap = 116;
  const leftX = { r32: 0, r16: 192, qf: 384, sf: 584, final: 804 };
  const rightX = { sf: 1064, qf: 1264, r16: 1456, r32: 1648 };
  const titles = {
    r32: "16 avos",
    r16: "Oitavas",
    qf: "Quartas",
    sf: "Semifinal",
    final: "Final"
  };

  const yForR32 = (index) => firstY + index * rowGap;
  const midY = (a, b) => ((a + cardHeight / 2) + (b + cardHeight / 2)) / 2 - cardHeight / 2;
  const labelNodes = new Set(["r32-0", "r16-0", "qf-0", "sf-0", "final-0", "sf-1", "qf-2", "r16-4", "r32-8"]);
  const addNode = (id, roundKey, matchIndex, x, y, side) => {
    nodes[id] = {
      id,
      roundKey,
      matchIndex,
      x,
      y,
      side,
      title: titles[roundKey],
      width: roundKey === "final" ? finalWidth : nodeWidth,
      showLabel: labelNodes.has(id)
    };
    order.push(id);
  };

  for (let i = 0; i < 8; i += 1) addNode(`r32-${i}`, "r32", i, leftX.r32, yForR32(i), "left");
  for (let i = 0; i < 4; i += 1) addNode(`r16-${i}`, "r16", i, leftX.r16, midY(nodes[`r32-${i * 2}`].y, nodes[`r32-${i * 2 + 1}`].y), "left");
  for (let i = 0; i < 2; i += 1) addNode(`qf-${i}`, "qf", i, leftX.qf, midY(nodes[`r16-${i * 2}`].y, nodes[`r16-${i * 2 + 1}`].y), "left");
  addNode("sf-0", "sf", 0, leftX.sf, midY(nodes["qf-0"].y, nodes["qf-1"].y), "left");

  addNode("final-0", "final", 0, leftX.final, 424, "center");

  for (let i = 8; i < 16; i += 1) addNode(`r32-${i}`, "r32", i, rightX.r32, yForR32(i - 8), "right");
  for (let i = 4; i < 8; i += 1) addNode(`r16-${i}`, "r16", i, rightX.r16, midY(nodes[`r32-${i * 2}`].y, nodes[`r32-${i * 2 + 1}`].y), "right");
  for (let i = 2; i < 4; i += 1) addNode(`qf-${i}`, "qf", i, rightX.qf, midY(nodes[`r16-${i * 2}`].y, nodes[`r16-${i * 2 + 1}`].y), "right");
  addNode("sf-1", "sf", 1, rightX.sf, midY(nodes["qf-2"].y, nodes["qf-3"].y), "right");

  for (let i = 0; i < 16; i += 1) links.push({ from: `r32-${i}`, to: `r16-${Math.floor(i / 2)}`, side: i < 8 ? "left" : "right" });
  for (let i = 0; i < 8; i += 1) links.push({ from: `r16-${i}`, to: `qf-${Math.floor(i / 2)}`, side: i < 4 ? "left" : "right" });
  for (let i = 0; i < 4; i += 1) links.push({ from: `qf-${i}`, to: `sf-${Math.floor(i / 2)}`, side: i < 2 ? "left" : "right" });
  links.push({ from: "sf-0", to: "final-0", side: "left" });
  links.push({ from: "sf-1", to: "final-0", side: "right" });

  return { nodes, order, links };
}

function connectorPath(from, to, side) {
  const fromX = side === "left" ? from.x + from.width : from.x;
  const toX = side === "left" ? to.x : to.x + to.width;
  const fromY = from.y + 82;
  const toY = to.y + 82;
  const midX = side === "left"
    ? fromX + Math.max(20, (toX - fromX) / 2)
    : fromX - Math.max(20, (fromX - toX) / 2);

  return `M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}`;
}

function selectWinner(matchId, roundKey, matchIndex, entry) {
  if (isReadOnlyMode() || !canCreateInActivePeriod()) return;
  if (!entry) return;
  clearSaveFeedback();

  state.bracketWinners[matchId] = entry;
  clearForwardRounds(roundKey, matchIndex);
  renderBracket();
  updateStatus();
}

function clearForwardRounds(roundKey, matchIndex) {
  const roundIndex = rounds.findIndex((round) => round.key === roundKey);
  let nextIndex = Math.floor(matchIndex / 2);

  for (let i = roundIndex + 1; i < rounds.length; i += 1) {
    const key = rounds[i].key;
    Object.keys(state.bracketWinners).forEach((winnerKey) => {
      const [winnerRound, winnerMatch] = winnerKey.split("-");
      if (winnerRound === key && Number(winnerMatch) >= nextIndex) {
        delete state.bracketWinners[winnerKey];
      }
    });
    nextIndex = Math.floor(nextIndex / 2);
  }
}

function saveCurrentPrediction() {
  if (isReadOnlyMode()) return;

  if (!canCreateInActivePeriod()) {
    showSaveFeedback("Este período está fechado. Não dá para criar ou editar palpites agora.");
    return;
  }

  const completionIssue = getCompletionIssue();
  if (completionIssue) {
    showSaveFeedback(completionIssue);
    return;
  }

  const now = new Date();
  const user = getCurrentUser();
  const sequence = getNextPredictionNumber(user.id);
  const number = state.activeId ? getActivePredictionNumber() : sequence;
  const data = {
    id: state.activeId || createId(),
    userId: user.id,
    username: user.username,
    periodId: state.activePeriodId,
    number,
    name: `@${user.username} #${number}`,
    savedAt: now.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    savedAtISO: now.toISOString(),
    picks: structuredClone(state.picks),
    bracketWinners: structuredClone(state.bracketWinners)
  };

  const existingIndex = state.predictions.findIndex((item) => item.id === data.id);
  if (existingIndex >= 0) {
    state.predictions[existingIndex] = data;
  } else {
    state.predictions.unshift(data);
  }

  state.activeId = data.id;
  persistPredictions();
  renderHome();
  renderActivePeriodBar();
  renderPredictions();
  updatePermissionState();
  showSaveFeedback("Palpite completo salvo.", false);
}

function renderPredictions() {
  els.predictionList.innerHTML = "";

  const visiblePredictions = state.activePeriodId
    ? state.predictions.filter((prediction) => getPredictionPeriodId(prediction) === state.activePeriodId)
    : state.predictions;

  if (!visiblePredictions.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum palpite salvo neste período.";
    els.predictionList.appendChild(empty);
    return;
  }

  visiblePredictions.forEach((prediction) => {
    const row = document.createElement("div");
    row.className = `prediction-item ${prediction.id === state.activeId ? "active" : ""}`;

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "prediction-load";
    const owner = getPredictionUsername(prediction);
    loadButton.innerHTML = `
      <strong>${escapeHtml(prediction.name)}</strong>
      <small>${escapeHtml(getPeriodTitle(getPredictionPeriodId(prediction)))} · ${escapeHtml(prediction.savedAt)} · @${escapeHtml(owner)}</small>
    `;
    loadButton.addEventListener("click", () => loadPrediction(prediction.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-prediction";
    deleteButton.disabled = !canEditPrediction(prediction);
    deleteButton.hidden = !canEditPrediction(prediction);
    deleteButton.title = "Excluir palpite";
    deleteButton.setAttribute("aria-label", `Excluir ${prediction.name}`);
    deleteButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12"/><path d="M9 7V5h6v2"/><path d="M9 10v8"/><path d="M15 10v8"/><path d="M7 7l1 14h8l1-14"/></svg>`;
    deleteButton.addEventListener("click", () => deletePrediction(prediction.id));

    row.appendChild(loadButton);
    row.appendChild(deleteButton);
    els.predictionList.appendChild(row);
  });
}

function loadPrediction(id) {
  const prediction = state.predictions.find((item) => item.id === id);
  if (!prediction) return;

  state.activeId = prediction.id;
  state.activePeriodId = getPredictionPeriodId(prediction);
  state.picks = structuredClone(prediction.picks);
  state.bracketWinners = structuredClone(prediction.bracketWinners);

  renderGroups();
  renderBracket();
  renderHome();
  renderActivePeriodBar();
  renderPredictions();
  updateStatus();
  updatePermissionState();
  clearSaveFeedback();
}

function deletePrediction(id) {
  const prediction = state.predictions.find((item) => item.id === id);
  if (!prediction || !canEditPrediction(prediction)) return;

  state.predictions = state.predictions.filter((item) => item.id !== id);
  if (state.activeId === id) state.activeId = null;
  persistPredictions();
  renderHome();
  renderActivePeriodBar();
  renderPredictions();
  updatePermissionState();
}

function loadPredictions() {
  try {
    state.predictions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    state.predictions = [];
  }

  if (!state.predictions.length) {
    state.predictions = createMockPredictions();
    persistPredictions();
  }

  state.predictions = state.predictions.map((prediction) => ({
    ...prediction,
    periodId: getPredictionPeriodId(prediction)
  }));
}

function persistPredictions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.predictions));
}

function loadPeriods() {
  try {
    state.periods = JSON.parse(localStorage.getItem(PERIODS_KEY) || "[]");
  } catch {
    state.periods = [];
  }

  if (!state.periods.length) {
    state.periods = createMockPeriods();
    persistPeriods();
  }
}

function persistPeriods() {
  localStorage.setItem(PERIODS_KEY, JSON.stringify(state.periods));
}

function createMockPeriods() {
  const now = new Date();
  return [
    {
      id: "fase-grupos",
      title: "Palpites da fase de grupos",
      startsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "oitavas",
      title: "Palpites das oitavas",
      startsAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "teste-encerrado",
      title: "Rodada teste encerrada",
      startsAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function selectDefaultPeriod() {
  state.activePeriodId = getOpenPeriod()?.id || state.periods[0]?.id || null;
}

function getOpenPeriod() {
  return state.periods.find((period) => getPeriodStatus(period) === "open") || null;
}

function getActivePeriod() {
  return state.periods.find((period) => period.id === state.activePeriodId) || null;
}

function getPeriodStatus(period) {
  if (!period) return "closed";
  const now = Date.now();
  const start = new Date(period.startsAt).getTime();
  const end = new Date(period.endsAt).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "closed";
  return "open";
}

function getPeriodLabel(period) {
  const status = getPeriodStatus(period);
  if (status === "open") return "aberto";
  if (status === "upcoming") return "futuro";
  return "encerrado";
}

function getPeriodTitle(periodId) {
  return state.periods.find((period) => period.id === periodId)?.title || "Período";
}

function getPredictionPeriodId(prediction) {
  return prediction.periodId || state.periods[0]?.id || "fase-grupos";
}

function canCreateInActivePeriod() {
  const period = getActivePeriod();
  return Boolean(period && getPeriodStatus(period) === "open");
}

function renderHome() {
  renderPeriodHero();
  renderPeriodList();
  renderFeed();
}

function renderPeriodHero() {
  const openPeriod = getOpenPeriod();

  if (!openPeriod) {
    const nextPeriod = state.periods.find((period) => getPeriodStatus(period) === "upcoming");
    els.periodHero.innerHTML = `
      <span class="period-badge closed">fechado</span>
      <h2>Nenhum período aberto agora</h2>
      <p>${nextPeriod ? `Próxima janela: ${escapeHtml(nextPeriod.title)} abre em ${formatDateTime(nextPeriod.startsAt)}.` : "O admin ainda não abriu uma nova janela de palpites."}</p>
    `;
    return;
  }

  els.periodHero.innerHTML = `
    <span class="period-badge open">aberto</span>
    <h2>${escapeHtml(openPeriod.title)}</h2>
    <p>Criação liberada até ${formatDateTime(openPeriod.endsAt)}.</p>
    <button class="primary-action" type="button" data-open-period="${escapeHtml(openPeriod.id)}">Criar palpite neste período</button>
  `;

  const button = els.periodHero.querySelector("[data-open-period]");
  button.addEventListener("click", () => {
    state.activePeriodId = openPeriod.id;
    state.activeId = null;
    state.picks = createEmptyPicks();
    state.bracketWinners = {};
    renderActivePeriodBar();
    renderGroups();
    renderBracket();
    renderPredictions();
    updateStatus();
    updatePermissionState();
    setScreen("prediction");
  });
}

function renderPeriodList() {
  els.periodList.innerHTML = state.periods.map((period) => {
    const status = getPeriodStatus(period);
    const count = state.predictions.filter((prediction) => getPredictionPeriodId(prediction) === period.id).length;
    return `
      <button class="period-item ${period.id === state.activePeriodId ? "active" : ""}" type="button" data-period-id="${escapeHtml(period.id)}">
        <span class="period-badge ${status}">${getPeriodLabel(period)}</span>
        <strong>${escapeHtml(period.title)}</strong>
        <small>${formatDateTime(period.startsAt)} até ${formatDateTime(period.endsAt)} · ${count} palpite(s)</small>
      </button>
    `;
  }).join("");

  els.periodList.querySelectorAll("[data-period-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePeriodId = button.dataset.periodId;
      state.activeId = null;
      state.picks = createEmptyPicks();
      state.bracketWinners = {};
      renderHome();
      renderActivePeriodBar();
      renderGroups();
      renderBracket();
      renderPredictions();
      updateStatus();
      updatePermissionState();
      setScreen("prediction");
    });
  });
}

function renderFeed() {
  const items = [...state.predictions]
    .sort((a, b) => new Date(b.savedAtISO || 0) - new Date(a.savedAtISO || 0))
    .slice(0, 12);

  if (!items.length) {
    els.feedList.innerHTML = `<p class="empty-state">Nenhum palpite completo salvo ainda.</p>`;
    return;
  }

  els.feedList.innerHTML = items.map((prediction) => {
    const champion = prediction.bracketWinners?.["final-0"]?.team || "-";
    return `
      <button class="feed-item" type="button" data-prediction-id="${escapeHtml(prediction.id)}">
        <span class="avatar">${getPredictionUsername(prediction).slice(0, 1).toUpperCase()}</span>
        <span>
          <strong>${escapeHtml(prediction.name)}</strong>
          <small>${escapeHtml(getPeriodTitle(getPredictionPeriodId(prediction)))} · campeão: ${escapeHtml(champion)} · ${escapeHtml(prediction.savedAt)}</small>
        </span>
      </button>
    `;
  }).join("");

  els.feedList.querySelectorAll("[data-prediction-id]").forEach((button) => {
    button.addEventListener("click", () => {
      loadPrediction(button.dataset.predictionId);
      setScreen("prediction");
    });
  });
}

function renderActivePeriodBar() {
  const period = getActivePeriod();
  if (!period) {
    els.activePeriodBar.innerHTML = `<span class="period-badge closed">sem período</span><strong>Nenhum período selecionado</strong>`;
    return;
  }

  const status = getPeriodStatus(period);
  els.activePeriodBar.innerHTML = `
    <span class="period-badge ${status}">${getPeriodLabel(period)}</span>
    <strong>${escapeHtml(period.title)}</strong>
    <small>${formatDateTime(period.startsAt)} até ${formatDateTime(period.endsAt)}</small>
  `;
}

function renderAdminPeriods() {
  els.adminPeriodList.innerHTML = state.periods.map((period) => `
    <article class="admin-period-item">
      <span class="period-badge ${getPeriodStatus(period)}">${getPeriodLabel(period)}</span>
      <strong>${escapeHtml(period.title)}</strong>
      <small>${formatDateTime(period.startsAt)} até ${formatDateTime(period.endsAt)}</small>
    </article>
  `).join("");
}

function createPeriod(event) {
  event.preventDefault();
  const title = els.periodTitle.value.trim();
  const startsAt = els.periodStart.value;
  const endsAt = els.periodEnd.value;

  if (!title || !startsAt || !endsAt) {
    showPeriodFeedback("Preencha nome, abertura e fechamento.", true);
    return;
  }

  if (new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
    showPeriodFeedback("O fechamento precisa ser depois da abertura.", true);
    return;
  }

  state.periods.unshift({
    id: createSlug(title),
    title,
    startsAt: new Date(startsAt).toISOString(),
    endsAt: new Date(endsAt).toISOString()
  });
  persistPeriods();
  selectDefaultPeriod();
  renderHome();
  renderAdminPeriods();
  renderActivePeriodBar();
  renderPredictions();
  updatePermissionState();
  showPeriodFeedback("Período criado.", false);
}

function showPeriodFeedback(message, isError) {
  els.periodFeedback.textContent = message;
  els.periodFeedback.classList.toggle("error", isError);
}

function createSlug(value) {
  return `${normalizeUsername(value).replaceAll(".", "-").replaceAll("_", "-")}-${Date.now().toString(36)}`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function toDatetimeLocal(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function loadUsers() {
  try {
    state.users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    state.users = [];
  }

  if (!state.users.length) {
    state.users = structuredClone(defaultUsers);
    persistUsers();
  }
}

function persistUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
}

function loadSession() {
  const savedUserId = localStorage.getItem(SESSION_KEY);
  state.currentUserId = state.users.some((user) => user.id === savedUserId) ? savedUserId : null;
}

function persistSession() {
  if (state.currentUserId) {
    localStorage.setItem(SESSION_KEY, state.currentUserId);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function renderAuthState() {
  const isLoggedIn = Boolean(state.currentUserId);
  els.authScreen.classList.toggle("is-hidden", isLoggedIn);
  els.appShell.classList.toggle("is-hidden", !isLoggedIn);

  if (!isLoggedIn) {
    els.authUsername.focus();
    return;
  }

  const user = getCurrentUser();
  els.accountUsername.textContent = `@${user.username}`;
  els.accountAvatar.textContent = user.username.slice(0, 1).toUpperCase();
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const username = normalizeUsername(els.authUsername.value);
  els.authFeedback.className = "feedback";

  if (username.length < 3) {
    showAuthFeedback("Use um username com pelo menos 3 caracteres.", true);
    return;
  }

  let user = state.users.find((item) => item.username === username);

  if (!user) {
    user = { id: username, username };
    state.users.push(user);
    persistUsers();
  }

  state.currentUserId = user.id;
  persistSession();
  els.authUsername.value = "";
  els.authFeedback.textContent = "";
  renderAuthState();
  renderHome();
  renderAdminPeriods();
  renderActivePeriodBar();
  renderGroups();
  renderBracket();
  renderPredictions();
  updateStatus();
  updatePermissionState();
  setScreen("home");
}

function logout() {
  state.currentUserId = null;
  state.activeId = null;
  state.picks = createEmptyPicks();
  state.bracketWinners = {};
  persistSession();
  clearSaveFeedback();
  renderAuthState();
}

function normalizeUsername(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._]/g, "");
}

function showAuthFeedback(message, isError) {
  els.authFeedback.textContent = message;
  els.authFeedback.classList.toggle("error", isError);
}

function getCurrentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || state.users[0];
}

function getNextPredictionNumber(userId) {
  const numbers = state.predictions
    .filter((prediction) => prediction.userId === userId && getPredictionPeriodId(prediction) === state.activePeriodId)
    .map((prediction) => Number(prediction.number || 0));
  return Math.max(0, ...numbers) + 1;
}

function getActivePredictionNumber() {
  const active = state.predictions.find((prediction) => prediction.id === state.activeId);
  if (active?.number) return active.number;
  return getNextPredictionNumber(getCurrentUser().id);
}

function getActivePrediction() {
  return state.predictions.find((prediction) => prediction.id === state.activeId) || null;
}

function getPredictionUsername(prediction) {
  if (prediction.username) return prediction.username;
  const user = state.users.find((item) => item.id === prediction.userId);
  return user?.username || prediction.userName || "usuario";
}

function canEditPrediction(prediction) {
  return Boolean(
    prediction &&
    prediction.userId === getCurrentUser().id &&
    getPeriodStatus(state.periods.find((period) => period.id === getPredictionPeriodId(prediction))) === "open"
  );
}

function isReadOnlyMode() {
  const active = getActivePrediction();
  return Boolean(active && !canEditPrediction(active));
}

function canEditActivePrediction() {
  const active = getActivePrediction();
  if (active) return canEditPrediction(active);
  return canCreateInActivePeriod();
}

function getCompletionIssue() {
  const missingGroups = state.picks.filter((pick) => !pick.first || !pick.second || !pick.third).length;
  if (missingGroups) {
    return `Complete 1º, 2º e 3º em todos os grupos. Faltam ${missingGroups} grupo(s).`;
  }

  const missingQualified = 32 - getQualifiedSeeds().length;
  if (missingQualified > 0) {
    return `A fase de grupos ainda não gerou 32 classificados. Faltam ${missingQualified}.`;
  }

  const requiredMatchIds = rounds.flatMap((round) => (
    Array.from({ length: round.size }, (_, index) => `${round.key}-${index}`)
  ));
  const missingMatches = requiredMatchIds.filter((id) => !state.bracketWinners[id]).length;

  if (missingMatches) {
    return `Escolha todos os vencedores do mata-mata. Faltam ${missingMatches} jogo(s).`;
  }

  if (!state.bracketWinners["final-0"]) {
    return "Escolha o campeão para salvar.";
  }

  return "";
}

function showSaveFeedback(message, isError = true) {
  els.saveFeedback.textContent = message;
  els.saveFeedback.classList.toggle("error", isError);
}

function clearSaveFeedback() {
  els.saveFeedback.textContent = "";
  els.saveFeedback.classList.add("error");
}

function updatePermissionState() {
  const readOnly = isReadOnlyMode();
  const periodOpen = canCreateInActivePeriod();
  els.savePredictionBtn.disabled = readOnly || !periodOpen;
  els.autoFillBtn.disabled = readOnly || !periodOpen;
  els.resetBracketBtn.disabled = readOnly || !periodOpen;

  const active = getActivePrediction();
  if (readOnly && active) {
    els.editNotice.textContent = `Visualizando @${getPredictionUsername(active)}. Você pode ver, mas não editar nem excluir.`;
  } else if (!periodOpen) {
    els.editNotice.textContent = "Nenhum período aberto no momento. Palpites ficam disponíveis apenas para visualização.";
  } else {
    els.editNotice.textContent = `Palpites salvos como @${getCurrentUser().username} + número do palpite.`;
  }
}

function createMockPredictions() {
  const mockDates = [
    new Date("2026-06-04T09:15:00"),
    new Date("2026-06-04T10:42:00"),
    new Date("2026-06-04T11:08:00")
  ];

  return [
    buildMockPrediction(state.users[0], 1, mockDates[0]),
    buildMockPrediction(state.users[1], 1, mockDates[1]),
    buildMockPrediction(state.users[2], 1, mockDates[2])
  ];
}

function buildMockPrediction(user, number, date) {
  const picks = groups.map((teams) => ({
    first: teams[0],
    second: teams[1],
    third: teams[2]
  }));

  return {
    id: createId(),
    userId: user.id,
    username: user.username,
    periodId: state.periods[0]?.id || "fase-grupos",
    number,
    name: `@${user.username} #${number}`,
    savedAt: date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    savedAtISO: date.toISOString(),
    picks,
    bracketWinners: {}
  };
}

function createId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `prediction-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateStatus() {
  const qualified = getQualifiedSeeds();
  const completed = Object.keys(state.bracketWinners).length;
  const champion = state.bracketWinners["final-0"];

  els.qualifiedCount.textContent = `${qualified.length}/32`;
  els.completedMatches.textContent = completed;
  els.championName.textContent = champion ? champion.team : "-";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
