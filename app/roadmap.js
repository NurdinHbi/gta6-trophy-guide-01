// Renders the roadmap to the Platinum: five stages in play order, each listing
// the trophies that belong to it and how many of them the reader has earned.

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story',
    body: 'Chapters 1 to 4, the named missions and the final mission. All story trophies are unmissable: just play the campaign. Finish the final mission last in this stage, and clear the meditation spots (Positive Mental Attitude) along the way.',
  },
  {
    stage: 2,
    title: 'Stage 2 — Strangers and partners',
    body: 'Eight stranger mission strands — Andy, Kenton, Billy, Randy, Tyrone, Bret and the rest — plus the partner trophies. Start each strand as its marker appears and finish it before moving on; the strands unlock across the story, so do not save them all for post-game.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Activities and combat',
    body: 'Races, drone races, the shooting range, fishing, the arcade, bowling, stunts, challenges, robberies and the wanted-level trophies. The shooting range alone is 42 gold medals, and the stunts need 250 — chip away at both between missions.',
  },
  {
    stage: 4,
    title: 'Stage 4 — Collectibles and exploration',
    body: 'Cards, WAiNK tags, vehicles, garages, the Scooter Bros registrations, Marked Bills laundering and exploring every corner of Leonida. Do the WAiNK tags and the exploration together, and register vehicles as you discover them.',
  },
  {
    stage: 5,
    title: 'Stage 5 — Cleanup and the Platinum',
    body: 'Check the in-game 100% checklist, clear whatever categories are still short — usually a few stunts, races or collectibles — and A Long Road (100% completion) pops. The Platinum, Vice Got a Price!, follows the moment the other 54 are earned.',
  },
];

export function renderRoadmap(container, trophies, earned) {
  container.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => earned.has(t.name)).length;

    const block = document.createElement('section');
    block.className = 'roadmap-stage';
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    const progress = document.createElement('p');
    progress.className = 'stage-progress';
    progress.textContent = done + ' of ' + members.length + ' earned in this stage';
    const body = document.createElement('p');
    body.textContent = stage.body;
    const list = document.createElement('ul');
    for (const trophy of members) {
      const item = document.createElement('li');
      item.textContent = (earned.has(trophy.name) ? '✓ ' : '○ ') + trophy.name + ' — ' + trophy.grade + (trophy.missable ? ' (potentially missable)' : '');
      list.append(item);
    }
    block.append(heading, progress, body, list);
    container.append(block);
  }
}
