// Boots the Leonida Trophy Guide: loads the trophy data, keeps the earned set in
// localStorage, wires the filters, the spoiler setting, the view tabs, the
// export/import/reset tools, and the deep-link query parameters.

import { renderChecklist, renderDetailPanel } from './checklist.js';
import { renderRoadmap } from './roadmap.js';

const STORAGE_KEY = 'leonida-trophy-guide-earned-v1';

const trophyList = document.getElementById('trophyList');
const detailPanel = document.getElementById('detailPanel');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const platinumNote = document.getElementById('platinumNote');
const resultCount = document.getElementById('resultCount');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const earnedFilterSelect = document.getElementById('earnedFilter');
const spoilerBox = document.getElementById('spoiler');
const checklistView = document.getElementById('checklistView');
const roadmapView = document.getElementById('roadmapView');
const roadmapStages = document.getElementById('roadmapStages');

const state = {
  trophies: [],
  earned: new Set(),
  selectedId: null,
  spoilerOn: false,
  filters: { kind: 'all', grade: 'all', earned: 'all', search: '' },
  onToggleEarned: (trophy) => toggleEarned(trophy),
};

function loadEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((name) => typeof name === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.earned]));
}

function trophyById(id) {
  return state.trophies.find((t) => t.id === id) || null;
}

function renderAll() {
  const shown = renderChecklist(trophyList, state.trophies, state, {
    onToggleEarned: toggleEarned,
    onSelect: selectTrophy,
  });
  resultCount.textContent = 'Showing ' + shown + ' of ' + state.trophies.length + ' trophies';
  emptyState.hidden = shown !== 0;
  renderDetailPanel(detailPanel, trophyById(state.selectedId), state);
  renderRoadmap(roadmapStages, state.trophies, state.earned);

  const earnedCount = state.earned.size;
  const total = state.trophies.length;
  progressText.textContent = earnedCount + ' of ' + total + ' earned';
  progressBar.style.width = total ? Math.round((earnedCount / total) * 100) + '%' : '0%';
  platinumNote.textContent = earnedCount >= total
    ? 'Platinum earned — Vice Got a Price!'
    : 'Platinum: ' + (total - earnedCount) + ' trophies to go.';
}

function toggleEarned(trophy) {
  if (state.earned.has(trophy.name)) state.earned.delete(trophy.name);
  else state.earned.add(trophy.name);
  saveEarned();
  renderAll();
}

function selectTrophy(trophy) {
  state.selectedId = trophy.id;
  renderAll();
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setView(view) {
  const roadmap = view === 'roadmap';
  checklistView.hidden = roadmap;
  roadmapView.hidden = !roadmap;
  document.getElementById('viewChecklist').classList.toggle('active', !roadmap);
  document.getElementById('viewRoadmap').classList.toggle('active', roadmap);
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'roadmap') setView('roadmap');
  if (params.get('spoiler') === 'on') {
    state.spoilerOn = true;
    spoilerBox.checked = true;
  }
  const kind = params.get('kind');
  if (kind) {
    state.filters.kind = kind;
    for (const button of document.querySelectorAll('.kind-btn')) {
      button.classList.toggle('active', button.dataset.kind === kind);
    }
  }
  const id = Number(params.get('trophy'));
  if (Number.isInteger(id) && id > 0) state.selectedId = id;
}

function wireControls() {
  searchInput.addEventListener('input', () => {
    state.filters.search = searchInput.value.trim();
    renderAll();
  });
  gradeSelect.addEventListener('change', () => {
    state.filters.grade = gradeSelect.value;
    renderAll();
  });
  earnedFilterSelect.addEventListener('change', () => {
    state.filters.earned = earnedFilterSelect.value;
    renderAll();
  });
  spoilerBox.addEventListener('change', () => {
    state.spoilerOn = spoilerBox.checked;
    renderAll();
  });
  for (const button of document.querySelectorAll('.kind-btn')) {
    button.addEventListener('click', () => {
      state.filters.kind = button.dataset.kind;
      for (const other of document.querySelectorAll('.kind-btn')) {
        other.classList.toggle('active', other === button);
      }
      renderAll();
    });
  }
  document.getElementById('viewChecklist').addEventListener('click', () => setView('checklist'));
  document.getElementById('viewRoadmap').addEventListener('click', () => setView('roadmap'));

  document.getElementById('export').addEventListener('click', exportProgress);
  document.getElementById('import').addEventListener('change', importProgress);
  document.getElementById('reset').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies?')) {
      state.earned.clear();
      saveEarned();
      renderAll();
    }
  });
}

function exportProgress() {
  const payload = JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...state.earned] }, null, 2);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  link.download = 'leonida-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(state.trophies.map((t) => t.name));
    state.earned = new Set(names.filter((name) => known.has(name)));
    saveEarned();
    renderAll();
  } catch {
    window.alert('That file is not a trophy progress export from this guide.');
  }
  event.target.value = '';
}

async function boot() {
  state.earned = loadEarned();
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  state.trophies = doc.trophies;
  applyQueryParams();
  wireControls();
  renderAll();
}

boot();
