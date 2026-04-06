const STORAGE_KEY = "pontinho-scoreboard-state";
const INITIAL_SCORE = 100;
const DEFAULT_VIEW_MODE = "table";

const elements = {
  addPlayerForm: document.querySelector("#add-player-form"),
  playerNameInput: document.querySelector("#player-name"),
  playersView: document.querySelector("#players-view"),
  resetMatchButton: document.querySelector("#reset-match-button"),
  audioLibraryTrigger: document.querySelector("#audio-library-trigger"),
  audioLibraryModal: document.querySelector("#audio-library-modal"),
  audioLibraryList: document.querySelector("#audio-library-list"),
  audioLibraryCloseButton: document.querySelector("#audio-library-close-button"),
  winnerModal: document.querySelector("#winner-modal"),
  viewToggle: document.querySelector("#view-toggle"),
  togglePlayersButton: document.querySelector("#toggle-players-button"),
  playersPanelBody: document.querySelector("#players-panel-body"),
  confirmModal: document.querySelector("#confirm-modal"),
  confirmModalMessage: document.querySelector("#confirm-modal-message"),
  modalCancelButton: document.querySelector("#modal-cancel-button"),
  modalConfirmButton: document.querySelector("#modal-confirm-button"),
  confettiLayer: document.querySelector("#confetti-layer"),
};

const state = loadState();
const modalState = {
  onConfirm: null,
};

const VOICE_TRACKS = [
  "assets/audio/voice-6.mp3",
  "assets/audio/voice-7.mp3",
  "assets/audio/voice-8.mp3",
  "assets/audio/voice-9.mp3",
  "assets/audio/voice-10.mp3",
  "assets/audio/voice-11.mp3",
  "assets/audio/voice-12.mp3",
  "assets/audio/voice-13.mp3",
  "assets/audio/voice-14.mp3",
  "assets/audio/voice-15.mp3",
  "assets/audio/voice-16.mp3",
  "assets/audio/voice-17.mp3",
  "assets/audio/voice-18.mp3",
  "assets/audio/voice-19.mp3",
  "assets/audio/voice-20.mp3",
  "assets/audio/voice-21.mp3",
  "assets/audio/voice-22.mp3",
  "assets/audio/voice-23.mp3",
  "assets/audio/voice-24.mp3",
  "assets/audio/voice-25.mp3",
  "assets/audio/voice-27.mp3",
  "assets/audio/voice-28.mp3",
  "assets/audio/voice-29.mp3",
  "assets/audio/voice-30.mp3",
  "assets/audio/voice-32.mp3",
  "assets/audio/voice-33.mp3",
  "assets/audio/voice-34.mp3",
];

const uiState = {
  lastWinnerId: null,
  winnerModalDismissed: false,
  audioContext: null,
  audioMasterGain: null,
  audioCompressor: null,
  audioLoopTimer: null,
  victoryThemeIndex: null,
  previousVictoryThemeIndex: null,
  voiceAudio: null,
  voicePlaybackActive: false,
  previewAudio: null,
  previewTrack: null,
  unusedVoiceTracks: [...VOICE_TRACKS],
};

const VICTORY_THEMES = [
  {
    beat: 0.2,
    leadType: "triangle",
    bassType: "square",
    padType: "sine",
    leadDuration: 0.95,
    bassDuration: 0.9,
    padDuration: 1.8,
    leadVolume: 0.22,
    bassVolume: 0.14,
    padVolume: 0.08,
    melody: [659.25, 783.99, 987.77, 1046.5, 1174.66, 1318.51, 1567.98, 1318.51],
    bass: [164.81, 164.81, 196.0, 196.0, 220.0, 220.0, 246.94, 246.94],
    chords: [
      [659.25, 783.99],
      [739.99, 987.77],
      [783.99, 1046.5],
      [987.77, 1318.51],
    ],
  },
  {
    beat: 0.18,
    leadType: "sawtooth",
    bassType: "square",
    padType: "triangle",
    leadDuration: 0.9,
    bassDuration: 0.88,
    padDuration: 1.7,
    leadVolume: 0.2,
    bassVolume: 0.15,
    padVolume: 0.07,
    melody: [523.25, 659.25, 783.99, 659.25, 880.0, 987.77, 1174.66, 1567.98],
    bass: [130.81, 130.81, 146.83, 146.83, 174.61, 174.61, 196.0, 196.0],
    chords: [
      [523.25, 659.25],
      [587.33, 783.99],
      [659.25, 880.0],
      [783.99, 1046.5],
    ],
  },
  {
    beat: 0.22,
    leadType: "triangle",
    bassType: "sawtooth",
    padType: "sine",
    leadDuration: 0.92,
    bassDuration: 0.85,
    padDuration: 1.9,
    leadVolume: 0.24,
    bassVolume: 0.12,
    padVolume: 0.08,
    melody: [587.33, 739.99, 880.0, 987.77, 1174.66, 987.77, 1318.51, 1760.0],
    bass: [146.83, 146.83, 174.61, 174.61, 196.0, 196.0, 220.0, 220.0],
    chords: [
      [587.33, 739.99],
      [659.25, 880.0],
      [739.99, 987.77],
      [880.0, 1174.66],
    ],
  },
  {
    beat: 0.16,
    leadType: "square",
    bassType: "triangle",
    padType: "sine",
    leadDuration: 0.88,
    bassDuration: 0.82,
    padDuration: 1.6,
    leadVolume: 0.2,
    bassVolume: 0.13,
    padVolume: 0.06,
    melody: [783.99, 880.0, 987.77, 1174.66, 987.77, 1318.51, 1567.98, 1760.0],
    bass: [196.0, 196.0, 220.0, 220.0, 246.94, 246.94, 261.63, 261.63],
    chords: [
      [783.99, 987.77],
      [880.0, 1174.66],
      [987.77, 1318.51],
      [1046.5, 1567.98],
    ],
  },
  {
    beat: 0.21,
    leadType: "triangle",
    bassType: "square",
    padType: "triangle",
    leadDuration: 0.94,
    bassDuration: 0.86,
    padDuration: 1.75,
    leadVolume: 0.22,
    bassVolume: 0.14,
    padVolume: 0.07,
    melody: [698.46, 783.99, 932.33, 1046.5, 1174.66, 1396.91, 1174.66, 1567.98],
    bass: [174.61, 174.61, 196.0, 196.0, 233.08, 233.08, 196.0, 261.63],
    chords: [
      [698.46, 932.33],
      [783.99, 1046.5],
      [932.33, 1174.66],
      [1046.5, 1396.91],
    ],
  },
  {
    beat: 0.19,
    leadType: "sawtooth",
    bassType: "square",
    padType: "sine",
    leadDuration: 0.9,
    bassDuration: 0.84,
    padDuration: 1.7,
    leadVolume: 0.21,
    bassVolume: 0.15,
    padVolume: 0.08,
    melody: [659.25, 739.99, 880.0, 987.77, 1108.73, 1318.51, 1479.98, 1318.51],
    bass: [164.81, 164.81, 185.0, 185.0, 220.0, 220.0, 246.94, 246.94],
    chords: [
      [659.25, 880.0],
      [739.99, 987.77],
      [880.0, 1108.73],
      [987.77, 1318.51],
    ],
  },
  {
    beat: 0.17,
    leadType: "triangle",
    bassType: "sawtooth",
    padType: "triangle",
    leadDuration: 0.9,
    bassDuration: 0.8,
    padDuration: 1.65,
    leadVolume: 0.23,
    bassVolume: 0.13,
    padVolume: 0.07,
    melody: [587.33, 659.25, 783.99, 932.33, 1046.5, 1174.66, 1396.91, 1864.66],
    bass: [146.83, 146.83, 164.81, 164.81, 196.0, 196.0, 233.08, 233.08],
    chords: [
      [587.33, 783.99],
      [659.25, 932.33],
      [783.99, 1046.5],
      [932.33, 1174.66],
    ],
  },
  {
    beat: 0.2,
    leadType: "square",
    bassType: "square",
    padType: "sine",
    leadDuration: 0.93,
    bassDuration: 0.88,
    padDuration: 1.85,
    leadVolume: 0.2,
    bassVolume: 0.14,
    padVolume: 0.06,
    melody: [523.25, 698.46, 783.99, 932.33, 1046.5, 1174.66, 1396.91, 2093.0],
    bass: [130.81, 130.81, 174.61, 174.61, 196.0, 196.0, 233.08, 233.08],
    chords: [
      [523.25, 783.99],
      [698.46, 932.33],
      [783.99, 1046.5],
      [932.33, 1396.91],
    ],
  },
];

render();
bindEvents();

function bindEvents() {
  elements.addPlayerForm.addEventListener("submit", handleAddPlayer);
  elements.resetMatchButton.addEventListener("click", handleResetMatch);
  elements.audioLibraryTrigger.addEventListener("click", openAudioLibraryModal);
  elements.audioLibraryCloseButton.addEventListener("click", closeAudioLibraryModal);
  elements.audioLibraryModal.addEventListener("click", handleAudioLibraryBackdropClick);
  elements.audioLibraryList.addEventListener("click", handleAudioLibraryListClick);
  elements.playersView.addEventListener("click", handlePlayersViewClick);
  elements.playersView.addEventListener("submit", handlePlayersViewSubmit);
  elements.viewToggle.addEventListener("click", handleViewToggleClick);
  elements.togglePlayersButton.addEventListener("click", handlePlayersPanelToggle);
  elements.modalCancelButton.addEventListener("click", closeConfirmModal);
  elements.modalConfirmButton.addEventListener("click", handleModalConfirm);
  elements.confirmModal.addEventListener("click", handleModalBackdropClick);
  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("click", handleWinnerModalClick);
}

function loadState() {
  const fallback = {
    players: [],
    rows: [],
    viewMode: DEFAULT_VIEW_MODE,
    playersPanelOpen: true,
  };

  try {
    const rawState = localStorage.getItem(STORAGE_KEY);
    if (!rawState) return fallback;

    const parsed = JSON.parse(rawState);
    if (!Array.isArray(parsed.players)) return fallback;

    const players = parsed.players
      .filter((player) => typeof player?.name === "string")
      .map((player) => ({
        id: String(player.id),
        name: player.name.trim(),
        score: Number.isFinite(player.score) ? player.score : INITIAL_SCORE,
      }));
    const playerIds = new Set(players.map((player) => player.id));

    return {
      players,
      rows: normalizeRows(parsed.rows, parsed.history, playerIds, players),
      viewMode: parsed.viewMode === "cards" ? "cards" : DEFAULT_VIEW_MODE,
      playersPanelOpen: parsed.playersPanelOpen !== false,
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function handleAddPlayer(event) {
  event.preventDefault();

  const name = elements.playerNameInput.value.trim();

  if (!name) {
    setFeedback("Informe um nome válido para adicionar o jogador.", "error");
    elements.playerNameInput.focus();
    return;
  }

  const hasDuplicate = state.players.some(
    (player) => player.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR")
  );

  if (hasDuplicate) {
    setFeedback("Já existe um jogador com esse nome.", "error");
    elements.playerNameInput.focus();
    return;
  }

  state.players.push({
    id: crypto.randomUUID(),
    name,
    score: INITIAL_SCORE,
  });

  saveState();
  renderPlayersView();
  elements.addPlayerForm.reset();
  elements.playerNameInput.focus();
  setFeedback("Jogador adicionado.", "success");
}

function handleResetMatch() {
  if (state.players.length === 0) {
    setFeedback("Não há jogadores cadastrados para reiniciar a partida.", "error");
    return;
  }

  openConfirmModal({
    message: "Reiniciar a partida e voltar todos os jogadores para 100 pontos?",
    confirmText: "Reiniciar",
    onConfirm: () => {
      resetMatchState();
      setFeedback("Partida reiniciada. Todos voltaram para 100 pontos.", "success");
    },
  });
}

function handlePlayersViewClick(event) {
  const deleteEntryButton = event.target.closest("[data-delete-entry]");
  if (deleteEntryButton) {
    deleteHistoryEntry(deleteEntryButton.dataset.rowId, deleteEntryButton.dataset.playerId);
    return;
  }

  const removeButton = event.target.closest("[data-remove-player]");
  if (!removeButton) return;

  const playerId = removeButton.dataset.removePlayer;
  const player = state.players.find((item) => item.id === playerId);
  if (!player) return;

  openConfirmModal({
    message: `Remover ${player.name} da partida?`,
    confirmText: "Remover",
    onConfirm: () => {
      state.players = state.players.filter((item) => item.id !== playerId);
      state.rows = state.rows
        .map((row) => {
          const values = { ...row.values };
          delete values[playerId];

          return {
            ...row,
            values,
          };
        })
        .filter((row) => Object.keys(row.values).length > 0);

      saveState();
      renderPlayersView();
      setFeedback(`Jogador "${player.name}" removido.`, "success");
    },
  });
}

function handlePlayersViewSubmit(event) {
  const lossForm = event.target.closest("[data-loss-form]");
  if (!lossForm) {
    return;
  }

  event.preventDefault();
  applyPlayerLoss(lossForm.dataset.lossForm);
}

function handleViewToggleClick(event) {
  const button = event.target.closest("[data-view-mode]");
  if (!button) return;

  const nextMode = button.dataset.viewMode === "cards" ? "cards" : "table";
  if (state.viewMode === nextMode) return;

  state.viewMode = nextMode;
  saveState();
  render();
}

function handlePlayersPanelToggle() {
  state.playersPanelOpen = !state.playersPanelOpen;
  saveState();
  renderPlayersPanel();
}

function handleModalConfirm() {
  const action = modalState.onConfirm;
  closeConfirmModal();
  if (action) {
    action();
  }
}

function handleModalBackdropClick(event) {
  if (event.target === elements.confirmModal) {
    closeConfirmModal();
  }
}

function handleDocumentKeydown(event) {
  if (event.key === "Escape" && !elements.confirmModal.hidden) {
    closeConfirmModal();
  }

  if (event.key === "Escape" && !elements.audioLibraryModal.hidden) {
    closeAudioLibraryModal();
  }
}

function openAudioLibraryModal() {
  renderAudioLibraryList();
  elements.audioLibraryModal.hidden = false;
}

function closeAudioLibraryModal() {
  elements.audioLibraryModal.hidden = true;
  stopPreviewAudio();
}

function handleAudioLibraryBackdropClick(event) {
  if (event.target === elements.audioLibraryModal) {
    closeAudioLibraryModal();
  }
}

function handleAudioLibraryListClick(event) {
  const playButton = event.target.closest("[data-preview-audio]");
  if (!playButton) return;

  const track = playButton.dataset.previewAudio;

  if (uiState.previewTrack === track) {
    stopPreviewAudio();
    renderAudioLibraryList();
    return;
  }

  playPreviewAudio(track);
  renderAudioLibraryList();
}

function handleWinnerModalClick(event) {
  const resetButton = event.target.closest("[data-reset-from-winner]");
  if (!resetButton) return;

  resetMatchState();
}

function render() {
  renderPlayersPanel();
  renderViewToggle();
  renderPlayersView();
  renderWinnerModal();
}

function renderAudioLibraryList() {
  elements.audioLibraryList.innerHTML = VOICE_TRACKS
    .map((track) => {
      const isPlaying = uiState.previewTrack === track;
      return `
        <div class="audio-library-item">
          <span class="audio-library-item__name">${escapeHtml(formatTrackName(track))}</span>
          <button
            type="button"
            class="button button--ghost button--small audio-library-item__button ${isPlaying ? "is-playing" : ""}"
            data-preview-audio="${track}"
          >
            ${isPlaying ? "Parar" : "Ouvir"}
          </button>
        </div>
      `;
    })
    .join("");
}

function renderPlayersPanel() {
  elements.playersPanelBody.hidden = !state.playersPanelOpen;
  elements.togglePlayersButton.textContent = state.playersPanelOpen ? "Ocultar" : "Mostrar";
  elements.togglePlayersButton.setAttribute("aria-expanded", String(state.playersPanelOpen));
}

function renderViewToggle() {
  document.querySelectorAll("[data-view-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewMode === state.viewMode);
  });
}

function renderPlayersView() {
  if (state.players.length === 0) {
    elements.playersView.innerHTML = `
      <div class="empty-state">
        Nenhum jogador cadastrado ainda. Adicione nomes para começar a partida.
      </div>
    `;
    renderWinnerModal();
    return;
  }

  const scoreMeta = getScoreMeta();

  if (state.viewMode === "cards") {
    elements.playersView.innerHTML = renderCardsView(scoreMeta);
    renderWinnerModal();
    return;
  }

  elements.playersView.innerHTML = renderTableView(scoreMeta);
  renderWinnerModal();
}

function renderWinnerModal() {
  const winner = getWinner();

  if (!winner) {
    elements.winnerModal.hidden = true;
    elements.winnerModal.innerHTML = "";
    elements.confettiLayer.hidden = true;
    elements.confettiLayer.innerHTML = "";
    stopVictoryJingle();
    stopWinnerVoices();
    uiState.lastWinnerId = null;
    uiState.winnerModalDismissed = false;
    uiState.victoryThemeIndex = null;
    return;
  }

  if (uiState.lastWinnerId !== winner.id) {
    uiState.lastWinnerId = winner.id;
    uiState.winnerModalDismissed = false;
    uiState.victoryThemeIndex = pickVictoryThemeIndex();
    uiState.previousVictoryThemeIndex = uiState.victoryThemeIndex;
    launchConfetti();
    playVictoryJingle();
    startWinnerVoices();
  }

  if (uiState.winnerModalDismissed) {
    elements.winnerModal.hidden = true;
    elements.winnerModal.innerHTML = "";
    return;
  }

  elements.winnerModal.hidden = false;
  elements.winnerModal.innerHTML = `
    <div class="winner-modal__card">
      <p class="winner-modal__kicker">Temos um(a) vencedor(a)</p>
      <h2 class="winner-modal__title">🏆 Vitória</h2>
      <span class="winner-modal__name">${escapeHtml(winner.name)}</span>
    </div>
    <div class="winner-modal__actions">
      <button type="button" class="button winner-modal__close" data-reset-from-winner>
        Fechar e reiniciar
      </button>
    </div>
  `;
}

function renderTableView(scoreMeta) {
  return `
    <div class="table-wrap">
      <table class="players-table">
        <thead>
          <tr>
            ${state.players
              .map((player) => `
                <th class="players-table__head" scope="col">
                  <div class="player-head">
                    <span class="player-head__name">${escapeHtml(player.name)}</span>
                    <button
                      type="button"
                      class="icon-button"
                      data-remove-player="${player.id}"
                      aria-label="Remover ${escapeHtml(player.name)}"
                    >
                      ×
                    </button>
                  </div>
                </th>
              `)
              .join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            ${state.players
              .map((player) => `
                <td>
                  <form class="input-inline" data-loss-form="${player.id}">
                    <input
                      type="tel"
                      inputmode="numeric"
                      enterkeyhint="send"
                      placeholder="0"
                      data-loss-input="${player.id}"
                      aria-label="Pontos perdidos por ${escapeHtml(player.name)}"
                    >
                    <button
                      type="submit"
                      class="button button--primary button--small input-inline__button"
                      aria-label="Aplicar perda para ${escapeHtml(player.name)}"
                    >
                      <span aria-hidden="true">✓</span>
                    </button>
                  </form>
                </td>
              `)
              .join("")}
          </tr>
          ${renderHistoryRows()}
          <tr class="players-table__total-row">
            ${state.players
              .map((player) => {
                const classes = getScoreCellClass(player, scoreMeta);
                return `
                  <td class="${classes}">
                    <div class="score-stack">
                      ${
                        player.score < 0
                          ? '<span class="score-status">❌</span>'
                          : `<span class="score-value">${player.score}</span>`
                      }
                    </div>
                  </td>
                `;
              })
              .join("")}
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderCardsView(scoreMeta) {
  return `
    <div class="cards-grid">
      ${state.players
        .map((player) => {
          const cardClass = getCardClass(player, scoreMeta);
          const playerHistory = getPlayerHistory(player.id);
          return `
            <article class="player-card ${cardClass}">
              <div class="player-card__top">
                <div class="player-card__header">
                  <div class="player-card__title">
                    <h3 class="player-card__name">${escapeHtml(player.name)}</h3>
                    <button
                      type="button"
                      class="icon-button"
                      data-remove-player="${player.id}"
                      aria-label="Remover ${escapeHtml(player.name)}"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div class="player-card__body">
                <div class="player-card__score-row">
                  <div class="player-card__score-box">
                    ${
                      player.score < 0
                        ? '<p class="player-card__status">❌</p>'
                        : `<p class="player-card__score">${player.score}</p>`
                    }
                  </div>

                  <div class="player-card__actions">
                    <form class="input-inline" data-loss-form="${player.id}">
                      <input
                        type="tel"
                        inputmode="numeric"
                        enterkeyhint="send"
                        placeholder="0"
                        data-loss-input="${player.id}"
                        aria-label="Pontos perdidos por ${escapeHtml(player.name)}"
                      >
                      <button
                        type="submit"
                        class="button button--primary button--small input-inline__button"
                        aria-label="Aplicar perda para ${escapeHtml(player.name)}"
                      >
                        <span aria-hidden="true">✓</span>
                      </button>
                    </form>
                  </div>
                </div>

                <div class="history-line">
                  ${playerHistory.length > 0
                    ? playerHistory
                        .map(
                          (entry) => `
                            <button
                              type="button"
                              class="history-chip ${entry.value === 0 ? "history-chip--zero" : ""}"
                              data-delete-entry="true"
                              data-row-id="${entry.rowId}"
                              data-player-id="${player.id}"
                              aria-label="Excluir lançamento ${formatLossValue(entry.value)} de ${escapeHtml(player.name)}"
                            >
                              ${formatLossValue(entry.value)}
                            </button>
                          `
                        )
                        .join("")
                    : '<span class="history-chip history-chip--empty">.</span>'}
                </div>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderHistoryRows() {
  if (state.rows.length === 0) {
    return "";
  }

  return state.rows
    .map((row) => `
      <tr class="players-table__history-row">
        ${state.players
          .map((player) => `
            <td>
              ${
                Object.hasOwn(row.values, player.id)
                  ? `<button
                      type="button"
                      class="history-chip ${row.values[player.id] === 0 ? "history-chip--zero" : ""}"
                      data-delete-entry="true"
                      data-row-id="${row.id}"
                      data-player-id="${player.id}"
                      aria-label="Excluir lançamento ${formatLossValue(row.values[player.id])} de ${escapeHtml(player.name)}"
                    >${formatLossValue(row.values[player.id])}</button>`
                  : '<span class="history-chip history-chip--empty">.</span>'
              }
            </td>
          `)
          .join("")}
      </tr>
    `)
    .join("");
}

function applyPlayerLoss(playerId) {
  const player = state.players.find((item) => item.id === playerId);
  const input = document.querySelector(`[data-loss-input="${playerId}"]`);
  const rawValue = input?.value.trim() ?? "";
  const normalizedValue = rawValue === "" ? "0" : rawValue;

  if (!player || !input) return;

  if (!/^\d+$/.test(normalizedValue)) {
    setFeedback(`Use apenas números inteiros e não negativos para ${player.name}.`, "error");
    input.focus();
    return;
  }

  const value = Number(normalizedValue);

  player.score -= value;
  const row = getOrCreateRowForPlayer(playerId);
  row.values[playerId] = value;

  saveState();
  renderPlayersView();
  setFeedback(
    "Lançamento registrado.",
    "success"
  );
}

function deleteHistoryEntry(rowId, playerId) {
  const row = state.rows.find((item) => item.id === rowId);
  const player = state.players.find((item) => item.id === playerId);

  if (!row || !player || !Object.hasOwn(row.values, playerId)) {
    return;
  }

  const value = row.values[playerId];

  openConfirmModal({
    message: `Excluir esse lançamento de ${player.name}?`,
    confirmText: "Excluir",
    onConfirm: () => {
      player.score += value;
      delete row.values[playerId];
      state.rows = state.rows.filter((item) => Object.keys(item.values).length > 0);

      saveState();
      renderPlayersView();
    },
  });
}

function openConfirmModal({ message, confirmText, onConfirm }) {
  modalState.onConfirm = onConfirm;
  elements.confirmModalMessage.textContent = message;
  elements.modalConfirmButton.textContent = confirmText;
  elements.confirmModal.hidden = false;
}

function closeConfirmModal() {
  modalState.onConfirm = null;
  elements.confirmModal.hidden = true;
}

function getScoreMeta() {
  const scores = state.players.map((player) => player.score);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  return {
    highest,
    lowest,
    hasSpread: highest !== lowest,
  };
}

function getScoreCellClass(player, scoreMeta) {
  const classes = [];

  if (scoreMeta.hasSpread && player.score === scoreMeta.highest) {
    classes.push("players-table__cell--leader");
  }

  if (scoreMeta.hasSpread && player.score === scoreMeta.lowest) {
    classes.push("players-table__cell--trailing");
  }

  return classes.join(" ");
}

function getCardClass(player, scoreMeta) {
  const classes = [];

  if (scoreMeta.hasSpread && player.score === scoreMeta.highest) {
    classes.push("player-card--leader");
  }

  if (scoreMeta.hasSpread && player.score === scoreMeta.lowest) {
    classes.push("player-card--trailing");
  }

  return classes.join(" ");
}

function getPlayerHistory(playerId) {
  return state.rows
    .filter((row) => Object.hasOwn(row.values, playerId))
    .map((row) => ({
      rowId: row.id,
      value: row.values[playerId],
      createdAt: row.createdAt,
    }))
    .slice(-6)
    .reverse();
}

function getOrCreateRowForPlayer(playerId) {
  for (const row of state.rows) {
    if (isRowOpen(row) && !Object.hasOwn(row.values, playerId)) {
      return row;
    }
  }

  const newRow = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    values: {},
  };

  state.rows.push(newRow);
  return newRow;
}

function isRowOpen(row) {
  return Object.keys(row.values).length < state.players.length;
}

function normalizeRows(savedRows, flatHistory, playerIds, players) {
  if (Array.isArray(savedRows)) {
    return savedRows
      .filter((row) => row && typeof row === "object")
      .map((row, index) => ({
        id: String(row.id ?? `row-${index}`),
        createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
        values: normalizeRowValues(row.values, playerIds),
      }))
      .filter((row) => Object.keys(row.values).length > 0);
  }

  if (Array.isArray(flatHistory)) {
    return migrateFlatHistoryToRows(flatHistory, playerIds, players);
  }

  return [];
}

function normalizeRowValues(values, playerIds) {
  if (!values || typeof values !== "object") {
    return {};
  }

  return Object.entries(values).reduce((accumulator, [playerId, value]) => {
    if (playerIds.has(String(playerId)) && Number.isFinite(value)) {
      accumulator[String(playerId)] = Number(value);
    }

    return accumulator;
  }, {});
}

function migrateFlatHistoryToRows(flatHistory, playerIds, players) {
  const rows = [];

  for (const entry of flatHistory) {
    const playerId = String(entry?.playerId ?? "");
    const value = Number(entry?.value);

    if (!playerIds.has(playerId) || !Number.isFinite(value)) {
      continue;
    }

    const row = getOrCreateRowForMigration(rows, players, playerId, entry?.createdAt);
    row.values[playerId] = value;
  }

  return rows;
}

function getOrCreateRowForMigration(rows, players, playerId, createdAt) {
  for (const row of rows) {
    if (Object.keys(row.values).length < players.length && !Object.hasOwn(row.values, playerId)) {
      return row;
    }
  }

  const newRow = {
    id: crypto.randomUUID(),
    createdAt: typeof createdAt === "string" ? createdAt : new Date().toISOString(),
    values: {},
  };

  rows.push(newRow);
  return newRow;
}

function setFeedback(message, type = "") {
  void message;
  void type;
}

function resetMatchState() {
  stopVictoryJingle();
  stopWinnerVoices();
  state.players = state.players.map((player) => ({
    ...player,
    score: INITIAL_SCORE,
  }));
  state.rows = [];
  uiState.winnerModalDismissed = false;
  uiState.victoryThemeIndex = null;

  saveState();
  renderPlayersView();
}

function pickVictoryThemeIndex() {
  if (VICTORY_THEMES.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * VICTORY_THEMES.length);

  while (nextIndex === uiState.previousVictoryThemeIndex) {
    nextIndex = Math.floor(Math.random() * VICTORY_THEMES.length);
  }

  return nextIndex;
}

function getWinner() {
  if (state.players.length < 2) {
    return null;
  }

  const positivePlayers = state.players.filter((player) => player.score > 0);

  return positivePlayers.length === 1 ? positivePlayers[0] : null;
}

function launchConfetti() {
  const colors = ["#c86f31", "#1f8f5f", "#e4b84f", "#bb4d3e", "#2a7da8"];
  const pieces = Array.from({ length: 28 }, (_, index) => {
    const left = Math.round((index / 27) * 100);
    const drift = Math.round(Math.random() * 120 - 60);
    const rotate = Math.round(Math.random() * 540 + 180);
    const duration = 1800 + Math.round(Math.random() * 1200);
    const delay = Math.round(Math.random() * 240);
    const color = colors[index % colors.length];

    return `
      <span
        class="confetti-piece"
        style="--confetti-left:${left}%;--confetti-drift:${drift}px;--confetti-rotate:${rotate}deg;--confetti-duration:${duration}ms;--confetti-delay:${delay}ms;--confetti-color:${color};"
      ></span>
    `;
  }).join("");

  elements.confettiLayer.hidden = false;
  elements.confettiLayer.innerHTML = pieces;
}

function playVictoryJingle() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  if (!uiState.audioContext) {
    uiState.audioContext = new AudioContextClass();
  }

  const context = uiState.audioContext;
  if (!uiState.audioMasterGain) {
    uiState.audioCompressor = context.createDynamicsCompressor();
    uiState.audioCompressor.threshold.setValueAtTime(-18, context.currentTime);
    uiState.audioCompressor.knee.setValueAtTime(18, context.currentTime);
    uiState.audioCompressor.ratio.setValueAtTime(10, context.currentTime);
    uiState.audioCompressor.attack.setValueAtTime(0.003, context.currentTime);
    uiState.audioCompressor.release.setValueAtTime(0.2, context.currentTime);

    uiState.audioMasterGain = context.createGain();
    uiState.audioMasterGain.gain.setValueAtTime(0.09, context.currentTime);
    uiState.audioMasterGain.connect(uiState.audioCompressor);
    uiState.audioCompressor.connect(context.destination);
  }

  const startTime = context.currentTime + 0.02;

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  if (uiState.audioLoopTimer) {
    return;
  }

  uiState.audioMasterGain.gain.cancelScheduledValues(context.currentTime);
  uiState.audioMasterGain.gain.setValueAtTime(0.09, context.currentTime);

  playVictoryPhrase(context, startTime);
  uiState.audioLoopTimer = window.setInterval(() => {
    if (!getWinner()) {
      stopVictoryJingle();
      return;
    }

    playVictoryPhrase(context, context.currentTime + 0.02);
  }, 1600);
}

function playVictoryPhrase(context, startTime) {
  const theme = VICTORY_THEMES[uiState.victoryThemeIndex ?? 0];
  const beat = theme.beat;

  theme.melody.forEach((frequency, index) => {
    const noteStart = startTime + index * beat;
    scheduleVoice(context, {
      frequency,
      type: theme.leadType,
      start: noteStart,
      duration: beat * theme.leadDuration,
      volume: theme.leadVolume,
    });

    scheduleVoice(context, {
      frequency: theme.bass[index],
      type: theme.bassType,
      start: noteStart,
      duration: beat * theme.bassDuration,
      volume: theme.bassVolume,
    });

    if (index % 2 === 0) {
      const chord = theme.chords[index / 2];
      chord.forEach((chordFrequency) => {
        scheduleVoice(context, {
          frequency: chordFrequency,
          type: theme.padType,
          start: noteStart,
          duration: beat * theme.padDuration,
          volume: theme.padVolume,
        });
      });
    }
  });
}

function scheduleVoice(context, { frequency, type, start, duration, volume }) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  gainNode.gain.setValueAtTime(0.0001, start);
  gainNode.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gainNode);
  gainNode.connect(uiState.audioMasterGain);
  oscillator.start(start);
  oscillator.stop(end);
}

function stopVictoryJingle() {
  if (uiState.audioLoopTimer) {
    clearInterval(uiState.audioLoopTimer);
    uiState.audioLoopTimer = null;
  }

  if (uiState.audioContext && uiState.audioMasterGain) {
    const now = uiState.audioContext.currentTime;
    uiState.audioMasterGain.gain.cancelScheduledValues(now);
    uiState.audioMasterGain.gain.setValueAtTime(0.0001, now);
  }
}

function startWinnerVoices() {
  if (VOICE_TRACKS.length === 0) {
    return;
  }

  if (!uiState.voiceAudio) {
    uiState.voiceAudio = new Audio();
    uiState.voiceAudio.preload = "auto";
    uiState.voiceAudio.volume = 1;
    uiState.voiceAudio.addEventListener("ended", handleWinnerVoiceEnded);
  }

  if (uiState.voicePlaybackActive) {
    return;
  }

  const nextTrack = pickNextWinnerVoiceTrack();
  if (!nextTrack) {
    return;
  }

  uiState.voicePlaybackActive = true;
  uiState.voiceAudio.volume = 1;
  uiState.voiceAudio.src = nextTrack;
  uiState.voiceAudio.currentTime = 0;
  uiState.voiceAudio.play().catch(() => {});
}

function handleWinnerVoiceEnded() {
  uiState.voicePlaybackActive = false;
}

function stopWinnerVoices() {
  uiState.voicePlaybackActive = false;

  if (uiState.voiceAudio) {
    uiState.voiceAudio.pause();
    uiState.voiceAudio.removeAttribute("src");
    uiState.voiceAudio.load();
  }
}

function pickNextWinnerVoiceTrack() {
  if (uiState.unusedVoiceTracks.length === 0) {
    return null;
  }

  const nextIndex = Math.floor(Math.random() * uiState.unusedVoiceTracks.length);
  const [nextTrack] = uiState.unusedVoiceTracks.splice(nextIndex, 1);
  return nextTrack;
}

function playPreviewAudio(track) {
  if (!uiState.previewAudio) {
    uiState.previewAudio = new Audio();
    uiState.previewAudio.preload = "auto";
    uiState.previewAudio.volume = 1;
    uiState.previewAudio.addEventListener("ended", () => {
      uiState.previewTrack = null;
      renderAudioLibraryList();
    });
  }

  uiState.previewTrack = track;
  uiState.previewAudio.src = track;
  uiState.previewAudio.currentTime = 0;
  uiState.previewAudio.play().catch(() => {});
}

function stopPreviewAudio() {
  uiState.previewTrack = null;

  if (uiState.previewAudio) {
    uiState.previewAudio.pause();
    uiState.previewAudio.removeAttribute("src");
    uiState.previewAudio.load();
  }
}

function formatLossValue(value) {
  return value === 0 ? "0" : `-${value}`;
}

function formatTrackName(track) {
  const fileName = track.split("/").pop() ?? track;
  return fileName.replace(/\.[^.]+$/, "");
}


function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
