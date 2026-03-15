// 98th Academy Awards (2026) - Official nominees
// Ceremony: March 15, 2026, 7pm ET / 4pm PT

export const CEREMONY_START = '2026-03-16T00:00:00Z'; // 7pm ET = midnight UTC next day

export const CATEGORIES = [
  {
    id: 'best-director',
    name: 'Achievement in Directing',
    nominees: [
      { id: 'zhao', name: 'Chloé Zhao — Hamnet' },
      { id: 'safdie', name: 'Josh Safdie — Marty Supreme' },
      { id: 'pta', name: 'Paul Thomas Anderson — One Battle After Another' },
      { id: 'trier', name: 'Joachim Trier — Sentimental Value' },
      { id: 'coogler', name: 'Ryan Coogler — Sinners' },
    ],
  },
  {
    id: 'best-actor',
    name: 'Performance by an Actor in a Leading Role',
    nominees: [
      { id: 'chalamet', name: 'Timothée Chalamet — Marty Supreme' },
      { id: 'dicaprio', name: 'Leonardo DiCaprio — One Battle After Another' },
      { id: 'hawke', name: 'Ethan Hawke — Blue Moon' },
      { id: 'jordan', name: 'Michael B. Jordan — Sinners' },
      { id: 'moura', name: 'Wagner Moura — The Secret Agent' },
    ],
  },
  {
    id: 'best-actress',
    name: 'Performance by an Actress in a Leading Role',
    nominees: [
      { id: 'buckley', name: 'Jessie Buckley — Hamnet' },
      { id: 'byrne', name: 'Rose Byrne — If I Had Legs I\'d Kick You' },
      { id: 'hudson', name: 'Kate Hudson — Song Sung Blue' },
      { id: 'reinsve', name: 'Renate Reinsve — Sentimental Value' },
      { id: 'stone', name: 'Emma Stone — Bugonia' },
    ],
  },
  {
    id: 'best-supporting-actor',
    name: 'Performance by an Actor in a Supporting Role',
    nominees: [
      { id: 'del-toro', name: 'Benicio del Toro — One Battle After Another' },
      { id: 'elordi', name: 'Jacob Elordi — Frankenstein' },
      { id: 'lindo', name: 'Delroy Lindo — Sinners' },
      { id: 'penn', name: 'Sean Penn — One Battle After Another' },
      { id: 'skarsgard', name: 'Stellan Skarsgård — Sentimental Value' },
    ],
  },
  {
    id: 'best-supporting-actress',
    name: 'Performance by an Actress in a Supporting Role',
    nominees: [
      { id: 'fanning', name: 'Elle Fanning — Sentimental Value' },
      { id: 'lilleaas', name: 'Inga Ibsdotter Lilleaas — Sentimental Value' },
      { id: 'madigan', name: 'Amy Madigan — Weapons' },
      { id: 'mosaku', name: 'Wunmi Mosaku — Sinners' },
      { id: 'taylor', name: 'Teyana Taylor — One Battle After Another' },
    ],
  },
  {
    id: 'best-original-screenplay',
    name: 'Writing (Original Screenplay)',
    nominees: [
      { id: 'kaplow', name: 'Robert Kaplow — Blue Moon' },
      { id: 'panahi', name: 'Jafar Panahi — It Was Just an Accident' },
      { id: 'bronstein-safdie', name: 'Ronald Bronstein & Josh Safdie — Marty Supreme' },
      { id: 'vogt-trier', name: 'Eskil Vogt, Joachim Trier — Sentimental Value' },
      { id: 'coogler-script', name: 'Ryan Coogler — Sinners' },
    ],
  },
  {
    id: 'best-adapted-screenplay',
    name: 'Writing (Adapted Screenplay)',
    nominees: [
      { id: 'tracy', name: 'Will Tracy — Bugonia' },
      { id: 'del-toro-script', name: 'Guillermo del Toro — Frankenstein' },
      { id: 'zhao-ofarrell', name: 'Chloé Zhao & Maggie O\'Farrell — Hamnet' },
      { id: 'pta-script', name: 'Paul Thomas Anderson — One Battle After Another' },
      { id: 'bentley-kwedar', name: 'Clint Bentley & Greg Kwedar — Train Dreams' },
    ],
  },
  {
    id: 'best-animated-feature',
    name: 'Best Animated Feature Film',
    nominees: [
      { id: 'arco', name: 'Arco' },
      { id: 'elio', name: 'Elio' },
      { id: 'kpop', name: 'KPop Demon Hunters' },
      { id: 'amelie', name: 'Little Amélie or the Character of Rain' },
      { id: 'zootopia2', name: 'Zootopia 2' },
    ],
  },
  {
    id: 'best-international-feature',
    name: 'Best International Feature Film',
    nominees: [
      { id: 'secret-agent-br', name: 'The Secret Agent — Brazil' },
      { id: 'accident', name: 'It Was Just an Accident — France' },
      { id: 'sentimental-norway', name: 'Sentimental Value — Norway' },
      { id: 'sirat', name: 'Sirāt — Spain' },
      { id: 'hind-rajab', name: 'The Voice of Hind Rajab — Tunisia' },
    ],
  },
  {
    id: 'best-documentary-feature',
    name: 'Best Documentary Feature Film',
    nominees: [
      { id: 'alabama', name: 'The Alabama Solution' },
      { id: 'good-light', name: 'Come See Me in the Good Light' },
      { id: 'rocks', name: 'Cutting Through Rocks' },
      { id: 'putin', name: 'Mr. Nobody Against Putin' },
      { id: 'neighbor', name: 'The Perfect Neighbor' },
    ],
  },
  {
    id: 'best-documentary-short',
    name: 'Best Documentary Short Film',
    nominees: [
      { id: 'empty-rooms', name: 'All the Empty Rooms' },
      { id: 'renaud', name: 'Armed Only With a Camera: The Life and Death of Brent Renaud' },
      { id: 'children', name: 'Children No More: Were and Are Gone' },
      { id: 'devil', name: 'The Devil Is Busy' },
      { id: 'strangeness', name: 'Perfectly a Strangeness' },
    ],
  },
  {
    id: 'best-live-action-short',
    name: 'Best Live Action Short Film',
    nominees: [
      { id: 'butchers', name: 'Butcher\'s Stain' },
      { id: 'dorothy', name: 'A Friend of Dorothy' },
      { id: 'austen', name: 'Jane Austen\'s Period Drama' },
      { id: 'singers', name: 'The Singers' },
      { id: 'saliva', name: 'Two People Exchanging Saliva' },
    ],
  },
  {
    id: 'best-animated-short',
    name: 'Best Animated Short Film',
    nominees: [
      { id: 'butterfly', name: 'Butterfly' },
      { id: 'forevergreen', name: 'Forevergreen' },
      { id: 'pearls', name: 'The Girl Who Cried Pearls' },
      { id: 'retirement', name: 'Retirement Plan' },
      { id: 'sisters', name: 'The Three Sisters' },
    ],
  },
  {
    id: 'best-original-score',
    name: 'Achievement in Music Written for Motion Pictures (Original Score)',
    nominees: [
      { id: 'fendrix', name: 'Jerskin Fendrix — Bugonia' },
      { id: 'desplat', name: 'Alexandre Desplat — Frankenstein' },
      { id: 'richter', name: 'Max Richter — Hamnet' },
      { id: 'greenwood', name: 'Jonny Greenwood — One Battle After Another' },
      { id: 'goransson', name: 'Ludwig Göransson — Sinners' },
    ],
  },
  {
    id: 'best-original-song',
    name: 'Achievement in Music Written for Motion Pictures (Original Song)',
    nominees: [
      { id: 'dear-me', name: '"Dear Me" — Diane Warren: Relentless' },
      { id: 'golden', name: '"Golden" — KPop Demon Hunters' },
      { id: 'i-lied', name: '"I Lied to You" — Sinners' },
      { id: 'sweet-dreams', name: '"Sweet Dreams of Joy" — Viva Verdi!' },
      { id: 'train-dreams-song', name: '"Train Dreams" — Train Dreams' },
    ],
  },
  {
    id: 'best-cinematography',
    name: 'Achievement in Cinematography',
    nominees: [
      { id: 'ci-frankenstein', name: 'Frankenstein' },
      { id: 'ci-marty', name: 'Marty Supreme' },
      { id: 'ci-one-battle', name: 'One Battle After Another' },
      { id: 'ci-sinners', name: 'Sinners' },
      { id: 'ci-train', name: 'Train Dreams' },
    ],
  },
  {
    id: 'best-costume-design',
    name: 'Achievement in Costume Design',
    nominees: [
      { id: 'cd-avatar', name: 'Avatar: Fire and Ash' },
      { id: 'cd-frankenstein', name: 'Frankenstein' },
      { id: 'cd-hamnet', name: 'Hamnet' },
      { id: 'cd-marty', name: 'Marty Supreme' },
      { id: 'cd-sinners', name: 'Sinners' },
    ],
  },
  {
    id: 'best-film-editing',
    name: 'Achievement in Film Editing',
    nominees: [
      { id: 'fe-f1', name: 'F1' },
      { id: 'fe-marty', name: 'Marty Supreme' },
      { id: 'fe-one-battle', name: 'One Battle After Another' },
      { id: 'fe-sentimental', name: 'Sentimental Value' },
      { id: 'fe-sinners', name: 'Sinners' },
    ],
  },
  {
    id: 'best-makeup-hairstyling',
    name: 'Achievement in Makeup and Hairstyling',
    nominees: [
      { id: 'mh-frankenstein', name: 'Frankenstein' },
      { id: 'mh-kokuho', name: 'Kokuho' },
      { id: 'mh-sinners', name: 'Sinners' },
      { id: 'mh-smashing', name: 'The Smashing Machine' },
      { id: 'mh-ugly', name: 'The Ugly Stepsister' },
    ],
  },
  {
    id: 'best-production-design',
    name: 'Achievement in Production Design',
    nominees: [
      { id: 'pd-frankenstein', name: 'Frankenstein' },
      { id: 'pd-hamnet', name: 'Hamnet' },
      { id: 'pd-marty', name: 'Marty Supreme' },
      { id: 'pd-one-battle', name: 'One Battle After Another' },
      { id: 'pd-sinners', name: 'Sinners' },
    ],
  },
  {
    id: 'best-sound',
    name: 'Achievement in Sound',
    nominees: [
      { id: 'so-f1', name: 'F1' },
      { id: 'so-frankenstein', name: 'Frankenstein' },
      { id: 'so-one-battle', name: 'One Battle After Another' },
      { id: 'so-sinners', name: 'Sinners' },
      { id: 'so-sirat', name: 'Sirāt' },
    ],
  },
  {
    id: 'best-visual-effects',
    name: 'Achievement in Visual Effects',
    nominees: [
      { id: 've-avatar', name: 'Avatar: Fire and Ash' },
      { id: 've-f1', name: 'F1' },
      { id: 've-jurassic', name: 'Jurassic World Rebirth' },
      { id: 've-lost-bus', name: 'The Lost Bus' },
      { id: 've-sinners', name: 'Sinners' },
    ],
  },
  {
    id: 'best-casting',
    name: 'Achievement in Casting',
    nominees: [
      { id: 'cast-hamnet', name: 'Hamnet — Nina Gold' },
      { id: 'cast-marty', name: 'Marty Supreme — Jennifer Venditti' },
      { id: 'cast-one-battle', name: 'One Battle After Another — Cassandra Kulukundis' },
      { id: 'cast-secret-agent', name: 'The Secret Agent — Gabriel Domingues' },
      { id: 'cast-sinners', name: 'Sinners — Francine Maisler' },
    ],
  },
  {
    id: 'best-picture',
    name: 'Best Picture',
    nominees: [
      { id: 'bugonia', name: 'Bugonia' },
      { id: 'f1', name: 'F1' },
      { id: 'frankenstein', name: 'Frankenstein' },
      { id: 'hamnet', name: 'Hamnet' },
      { id: 'marty-supreme', name: 'Marty Supreme' },
      { id: 'one-battle', name: 'One Battle After Another' },
      { id: 'secret-agent', name: 'The Secret Agent' },
      { id: 'sentimental-value', name: 'Sentimental Value' },
      { id: 'sinners', name: 'Sinners' },
      { id: 'train-dreams', name: 'Train Dreams' },
    ],
  },
];
