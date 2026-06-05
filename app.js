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

const supabaseConfig = window.COPA_SUPABASE || {};
const hasSupabaseConfig = Boolean(
  window.supabase &&
  supabaseConfig.url &&
  supabaseConfig.anonKey &&
  !supabaseConfig.url.startsWith("COLE_AQUI") &&
  !supabaseConfig.anonKey.startsWith("COLE_AQUI")
);
const db = hasSupabaseConfig
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

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
  currentUser: null,
  currentProfile: null,
  authMode: "login",
  highlightMissingGroups: false,
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
  authEmailLabel: document.querySelector("#authEmailLabel"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  authPasswordConfirm: document.querySelector("#authPasswordConfirm"),
  authSubmitBtn: document.querySelector("#authSubmitBtn"),
  authFeedback: document.querySelector("#authFeedback"),
  logoutBtn: document.querySelector("#logoutBtn"),
  accountAvatar: document.querySelector("#accountAvatar"),
  accountUsername: document.querySelector("#accountUsername"),
  accountRole: document.querySelector("#accountRole"),
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

async function init() {
  setPeriodFormDefaults();
  bindStaticEvents();
  setAuthMode("login");

  if (!db) {
    renderAuthState();
    showAuthFeedback("Configure o Supabase em supabase-config.js para entrar.", true);
    return;
  }

  await loadSession();
  renderAuthState();
  if (!state.currentUserId) return;
  await refreshAppData();
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
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
  });

  document.querySelectorAll(".main-tab").forEach((tab) => {
    tab.addEventListener("click", () => setScreen(tab.dataset.screen));
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
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
  if (screen === "admin" && !isAdmin()) {
    screen = "home";
  }

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

function setAuthMode(mode) {
  state.authMode = mode === "signup" ? "signup" : "login";
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === state.authMode);
  });
  document.querySelectorAll(".signup-only").forEach((node) => {
    node.classList.toggle("is-hidden", state.authMode !== "signup");
  });
  els.authSubmitBtn.textContent = state.authMode === "signup" ? "Criar conta" : "Entrar";
  els.authPassword.autocomplete = state.authMode === "signup" ? "new-password" : "current-password";
  els.authEmailLabel.textContent = state.authMode === "signup" ? "Email" : "Email ou username";
  els.authEmail.placeholder = state.authMode === "signup" ? "voce@email.com" : "voce@email.com ou @username";
  els.authPasswordConfirm.value = "";
  els.authFeedback.textContent = "";
}

function getCurrentScreen() {
  return document.querySelector(".main-tab.active")?.dataset.screen || "home";
}

function isAdmin() {
  return state.currentProfile?.role === "admin";
}

function renderGroups() {
  const template = document.querySelector("#groupTemplate");
  els.groupsGrid.innerHTML = "";

  groups.forEach((teams, groupIndex) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".group-card");
    const missingRanks = getMissingGroupRanks(groupIndex);
    card.classList.toggle("incomplete", state.highlightMissingGroups && Boolean(missingRanks.length));
    node.querySelector(".group-title").textContent = `Grupo ${groupLabel(groupIndex)}`;
    if (state.highlightMissingGroups && missingRanks.length) {
      const warning = document.createElement("span");
      warning.className = "group-warning";
      warning.textContent = `Falta ${missingRanks.join(", ")}`;
      node.querySelector(".group-title").appendChild(warning);
    }
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

  state.highlightMissingGroups = false;
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

async function saveCurrentPrediction() {
  if (isReadOnlyMode()) return;

  if (!canCreateInActivePeriod()) {
    showSaveFeedback("Este período está fechado. Não dá para criar ou editar palpites agora.");
    return;
  }

  const completionIssue = getCompletionIssue();
  if (completionIssue) {
    showSaveFeedback(completionIssue);
    if (getIncompleteGroups().length) {
      state.highlightMissingGroups = true;
      setView("groups");
      renderGroups();
    }
    return;
  }

  const now = new Date();
  const user = getCurrentUser();
  const sequence = getNextPredictionNumber(user.id);
  const number = state.activeId ? getActivePredictionNumber() : sequence;
  const row = {
    user_id: user.id,
    period_id: state.activePeriodId,
    prediction_number: number,
    name: `@${user.username} #${number}`,
    picks: structuredClone(state.picks),
    bracket_winners: structuredClone(state.bracketWinners),
    champion: state.bracketWinners["final-0"].team,
    updated_at: now.toISOString()
  };

  let result;
  if (state.activeId) {
    result = await db
      .from("predictions")
      .update(row)
      .eq("id", state.activeId)
      .select("*, profiles(username), prediction_periods(title)")
      .single();
  } else {
    result = await db
      .from("predictions")
      .insert(row)
      .select("*, profiles(username), prediction_periods(title)")
      .single();
  }

  if (result.error) {
    showSaveFeedback(`Erro ao salvar: ${result.error.message}`);
    return;
  }

  const saved = mapPrediction(result.data);
  const existingIndex = state.predictions.findIndex((item) => item.id === saved.id);
  if (existingIndex >= 0) state.predictions[existingIndex] = saved;
  else state.predictions.unshift(saved);

  state.activeId = saved.id;
  state.highlightMissingGroups = false;
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

async function deletePrediction(id) {
  const prediction = state.predictions.find((item) => item.id === id);
  if (!prediction || !canEditPrediction(prediction)) return;

  const { error } = await db.from("predictions").delete().eq("id", id);
  if (error) {
    showSaveFeedback(`Erro ao excluir: ${error.message}`);
    return;
  }

  state.predictions = state.predictions.filter((item) => item.id !== id);
  if (state.activeId === id) state.activeId = null;
  renderHome();
  renderActivePeriodBar();
  renderPredictions();
  updatePermissionState();
}

async function refreshAppData() {
  await Promise.all([loadUsers(), loadPeriods(), loadPredictions()]);
  selectDefaultPeriod();
  renderAuthState();
  renderHome();
  renderAdminPeriods();
  renderActivePeriodBar();
  renderGroups();
  renderBracket();
  renderPredictions();
  updateStatus();
  updatePermissionState();
  setScreen(isAdmin() ? getCurrentScreen() : "home");
}

async function loadPredictions() {
  const { data, error } = await db
    .from("predictions")
    .select("*, profiles(username), prediction_periods(title)")
    .order("created_at", { ascending: false });

  if (error) {
    state.predictions = [];
    showSaveFeedback(`Erro ao carregar palpites: ${error.message}`);
    return;
  }

  state.predictions = data.map(mapPrediction);
}

async function loadPeriods() {
  const { data, error } = await db
    .from("prediction_periods")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error) {
    state.periods = [];
    showPeriodFeedback(`Erro ao carregar períodos: ${error.message}`, true);
    return;
  }

  state.periods = data.map(mapPeriod);
}

async function loadUsers() {
  const { data, error } = await db
    .from("profiles")
    .select("id, username, role")
    .order("username", { ascending: true });

  if (error) {
    state.users = [];
    showAuthFeedback(`Erro ao carregar usuários: ${error.message}`, true);
    return;
  }

  state.users = data;
  state.currentProfile = state.users.find((user) => user.id === state.currentUserId) || null;
}

function mapPeriod(period) {
  return {
    id: period.id,
    title: period.title,
    startsAt: period.starts_at,
    endsAt: period.ends_at,
    createdBy: period.created_by,
    createdAt: period.created_at
  };
}

function mapPrediction(prediction) {
  const username = prediction.profiles?.username || "usuario";
  return {
    id: prediction.id,
    userId: prediction.user_id,
    username,
    periodId: prediction.period_id,
    number: prediction.prediction_number,
    name: prediction.name,
    savedAt: formatDateTime(prediction.updated_at || prediction.created_at),
    savedAtISO: prediction.updated_at || prediction.created_at,
    picks: prediction.picks,
    bracketWinners: prediction.bracket_winners,
    champion: prediction.champion
  };
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
  return prediction.periodId || null;
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

async function createPeriod(event) {
  event.preventDefault();
  if (!isAdmin()) {
    showPeriodFeedback("Apenas admin pode criar períodos.", true);
    return;
  }

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

  const { data, error } = await db
    .from("prediction_periods")
    .insert({
      title,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      created_by: getCurrentUser().id
    })
    .select("*")
    .single();

  if (error) {
    showPeriodFeedback(`Erro ao criar período: ${error.message}`, true);
    return;
  }

  state.periods.unshift(mapPeriod(data));
  state.activePeriodId = data.id;
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

function formatDateTime(value) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function toDatetimeLocal(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

async function loadSession() {
  const { data, error } = await db.auth.getSession();
  if (error || !data.session?.user) {
    state.currentUser = null;
    state.currentUserId = null;
    state.currentProfile = null;
    return;
  }

  state.currentUser = data.session.user;
  state.currentUserId = data.session.user.id;
}

function renderAuthState() {
  const isLoggedIn = Boolean(state.currentUserId);
  els.authScreen.classList.toggle("is-hidden", isLoggedIn);
  els.appShell.classList.toggle("is-hidden", !isLoggedIn);

  if (!isLoggedIn) {
    document.querySelectorAll(".admin-only").forEach((node) => {
      node.classList.add("is-hidden");
    });
    els.authEmail.focus();
    return;
  }

  const user = getCurrentUser();
  els.accountUsername.textContent = `@${user.username}`;
  els.accountAvatar.textContent = user.username.slice(0, 1).toUpperCase();
  els.accountRole.textContent = isAdmin() ? "admin" : "usuário";
  document.querySelectorAll(".admin-only").forEach((node) => {
    node.classList.toggle("is-hidden", !isAdmin());
  });
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!db) {
    showAuthFeedback("Configure o Supabase em supabase-config.js para entrar.", true);
    return;
  }

  const identifier = els.authEmail.value.trim();
  const password = els.authPassword.value;
  const passwordConfirm = els.authPasswordConfirm.value;
  const username = normalizeUsername(els.authUsername.value);
  els.authFeedback.className = "feedback";

  if (!identifier || !password) {
    showAuthFeedback(state.authMode === "signup" ? "Preencha email e senha." : "Preencha email/username e senha.", true);
    return;
  }

  if (state.authMode === "signup" && username.length < 3) {
    showAuthFeedback("Use um username com pelo menos 3 caracteres.", true);
    return;
  }

  if (state.authMode === "signup") {
    if (!identifier.includes("@") || !identifier.includes(".")) {
      showAuthFeedback("Use um email válido para criar a conta.", true);
      return;
    }

    if (password !== passwordConfirm) {
      showAuthFeedback("As senhas não conferem.", true);
      return;
    }

    const exists = await db.from("profiles").select("id").eq("username", username).maybeSingle();
    if (exists.data) {
      showAuthFeedback(`@${username} já está em uso.`, true);
      return;
    }

    const { data, error } = await db.auth.signUp({
      email: identifier,
      password,
      options: {
        data: { username },
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      showAuthFeedback(formatAuthError(error, "signup"), true);
      return;
    }

    if (!data.session) {
      showAuthFeedback("Conta criada. Enviamos um email de confirmação. Confirme e depois entre.", false);
      setAuthMode("login");
      return;
    }
  } else {
    const email = await resolveLoginEmail(identifier);
    if (!email) {
      showAuthFeedback("Usuário não encontrado.", true);
      return;
    }

    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
      showAuthFeedback(formatAuthError(error, "login"), true);
      return;
    }
  }

  await loadSession();
  els.authUsername.value = "";
  els.authEmail.value = "";
  els.authPassword.value = "";
  els.authPasswordConfirm.value = "";
  els.authFeedback.textContent = "";
  renderAuthState();
  await refreshAppData();
}

async function logout() {
  if (db) await db.auth.signOut();
  state.currentUserId = null;
  state.currentUser = null;
  state.currentProfile = null;
  state.activeId = null;
  state.picks = createEmptyPicks();
  state.bracketWinners = {};
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

async function resolveLoginEmail(identifier) {
  if (identifier.includes("@") && identifier.includes(".")) return identifier;

  const username = normalizeUsername(identifier);
  if (username.length < 3) return "";

  const { data, error } = await db.rpc("get_email_by_username", {
    requested_username: username
  });

  if (error) {
    showAuthFeedback(`Erro ao buscar username: ${error.message}`, true);
    return "";
  }

  return data || "";
}

function showAuthFeedback(message, isError) {
  els.authFeedback.textContent = message;
  els.authFeedback.classList.toggle("error", isError);
}

function formatAuthError(error, mode) {
  const message = String(error?.message || "");
  const lower = message.toLowerCase();

  if (lower.includes("email rate limit")) {
    return "O Supabase limitou o envio de emails por alguns minutos. Aguarde um pouco antes de criar outra conta.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Email/username ou senha inválidos. Se acabou de criar a conta, confirme o email antes de entrar.";
  }

  if (lower.includes("email not confirmed")) {
    return "Confirme seu email antes de entrar.";
  }

  return mode === "signup" ? `Erro ao criar conta: ${message}` : `Erro ao entrar: ${message}`;
}

function getCurrentUser() {
  return state.currentProfile || state.users.find((user) => user.id === state.currentUserId) || {
    id: state.currentUserId,
    username: "usuario",
    role: "user"
  };
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
  const incompleteGroups = getIncompleteGroups();
  if (incompleteGroups.length) {
    const details = incompleteGroups
      .map((item) => `Grupo ${item.label}: falta ${item.missingRanks.join(", ")}`)
      .join("; ");
    return `Complete 1º, 2º e 3º em todos os grupos. ${details}.`;
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

function getIncompleteGroups() {
  return state.picks
    .map((pick, index) => ({
      label: groupLabel(index),
      missingRanks: getMissingGroupRanks(index, pick)
    }))
    .filter((item) => item.missingRanks.length);
}

function getMissingGroupRanks(groupIndex, pick = state.picks[groupIndex]) {
  const ranks = [];
  if (!pick?.first) ranks.push("1º");
  if (!pick?.second) ranks.push("2º");
  if (!pick?.third) ranks.push("3º");
  return ranks;
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
