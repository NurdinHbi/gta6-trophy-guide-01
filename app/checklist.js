// Renders the trophy checklist: one card per trophy, with its official name,
// description, grade, kind tags, missable flag, and an earned checkbox.

export function trophyIsHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.hidden && !earned.has(trophy.name);
}

export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return (trophy.tags || []).includes('online');
  return (trophy.tags || []).includes(kind);
}

export function trophyMatchesFilters(trophy, filters, earned) {
  if (!trophyMatchesKind(trophy, filters.kind)) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.earned === 'earned' && !earned.has(trophy.name)) return false;
  if (filters.earned === 'remaining' && earned.has(trophy.name)) return false;
  if (filters.search) {
    const needle = filters.search.toLowerCase();
    const haystack = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function buildGradeBadge(trophy) {
  const badge = document.createElement('span');
  badge.className = 'grade-badge grade-' + trophy.grade;
  badge.textContent = trophy.grade;
  return badge;
}

function buildTagRow(trophy) {
  const row = document.createElement('div');
  row.className = 'trophy-tags';
  for (const tag of trophy.tags || []) {
    const chip = document.createElement('span');
    chip.className = 'tag';
    chip.textContent = tag;
    row.append(chip);
  }
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'tag tag-missable';
    flag.textContent = 'potentially missable';
    row.append(flag);
  }
  if (trophy.hidden) {
    const flag = document.createElement('span');
    flag.className = 'tag tag-hidden';
    flag.textContent = 'hidden on PS5';
    row.append(flag);
  }
  return row;
}

export function buildTrophyCard(trophy, state, callbacks) {
  const earned = state.earned;
  const isEarned = earned.has(trophy.name);
  const hiddenNow = trophyIsHidden(trophy, state.spoilerOn, earned);

  const card = document.createElement('li');
  card.className = 'trophy-card' + (isEarned ? ' earned' : '') + (state.selectedId === trophy.id ? ' selected' : '');
  card.dataset.trophyId = String(trophy.id);

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
  box.addEventListener('change', (event) => {
    event.stopPropagation();
    callbacks.onToggleEarned(trophy);
  });
  box.addEventListener('click', (event) => event.stopPropagation());
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = hiddenNow ? 'Hidden story trophy' : trophy.name;
  head.append(box, name, buildGradeBadge(trophy));
  card.append(head);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hiddenNow ? 'Hidden until earned — turn off the spoiler setting to reveal it.' : trophy.description;
  card.append(desc);
  card.append(buildTagRow(trophy));

  card.addEventListener('click', () => callbacks.onSelect(trophy));
  return card;
}

export function renderChecklist(listElement, trophies, state, callbacks) {
  listElement.replaceChildren();
  const visible = trophies.filter((t) => trophyMatchesFilters(t, state.filters, state.earned));
  for (const trophy of visible) {
    listElement.append(buildTrophyCard(trophy, state, callbacks));
  }
  return visible.length;
}

export function renderDetailPanel(panel, trophy, state) {
  panel.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy on the left to read its guide and sources here.';
    panel.append(empty);
    return;
  }
  const isEarned = state.earned.has(trophy.name);
  const hiddenNow = trophyIsHidden(trophy, state.spoilerOn, state.earned);

  const grade = document.createElement('p');
  grade.className = 'detail-grade';
  grade.textContent = trophy.grade + ' trophy' + (trophy.hidden ? ' · hidden on PS5' : '');
  const title = document.createElement('h2');
  title.textContent = hiddenNow ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('p');
  desc.textContent = hiddenNow ? 'Hidden until earned — turn off the spoiler setting to reveal it.' : trophy.description;
  panel.append(grade, title, desc);

  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'tag tag-missable';
    warn.textContent = trophy.missableNote || 'Potentially missable — flagged by PowerPyx, not confirmed.';
    panel.append(warn);
  }

  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = hiddenNow ? 'Earn this trophy, or turn the spoiler setting off, to read its guide.' : trophy.guide;
  panel.append(guideHeading, guide);

  if (!hiddenNow && trophy.sources && trophy.sources.length) {
    const sourceHeading = document.createElement('h3');
    sourceHeading.textContent = 'Sources';
    const list = document.createElement('ul');
    list.className = 'source-list';
    for (const source of trophy.sources) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.name;
      link.target = '_blank';
      link.rel = 'noopener';
      item.append(link);
      list.append(item);
    }
    panel.append(sourceHeading, list);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = isEarned ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => state.onToggleEarned(trophy));
  actions.append(toggle);
  panel.append(actions);
}
