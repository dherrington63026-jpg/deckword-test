// Alikeberry: group-sorting solitaire with many modes.
// No ads, no real purchases. Everything saves on this phone only.
(function () {
'use strict';
var MODES = {
  words:  { name: 'Words',    bank: window.BANK,  blurb: 'Sort words into groups' },
  colors: { name: 'Colors',   bank: window.CBANK, blurb: 'Sort shades into color families' },
  pics:   { name: 'Pictures', bank: window.PBANK, blurb: 'Sort pictures into groups' }
};
MODES.nums = { name: 'Numbers', bank: window.NBANK, blurb: 'Sort numbers: even, prime, multiples...', kind: 'text' };
MODES.decades = { name: 'Remember When', bank: window.DBANK, blurb: 'Which decade did it arrive?', kind: 'text' };
MODES.wordplay = { name: 'Word Play', bank: window.WBANK, blurb: 'Rhymes, spelling and word parts', kind: 'text' };
MODES.bible = { name: 'Bible', bank: window.BIBANK, blurb: 'Books, people, places and stories', kind: 'text' };
MODES.words.kind = 'text';
MODES.colors.kind = 'colors';
MODES.pics.kind = 'img';
MODES.foods = { name: 'Foods of the World', bank: window.FBANK, blurb: 'Which country is the dish from?', kind: 'img' };
MODES.states = { name: 'US States', bank: window.SBANK, blurb: 'Sort the states by name and place', kind: 'states' };
MODES.flowers = { name: 'Flowers', bank: window.FLBANK, blurb: 'Sort flowers by type or by color', kind: 'img' };
MODES.birds = { name: 'Birds', bank: window.BIBANK2, blurb: 'Which kind of bird is it?', kind: 'img' };
MODES.places = { name: 'Famous Places', bank: window.PLBANK, blurb: 'Landmarks by type or continent', kind: 'photo' };
// Mixed: one group from each of several different kinds of cards, so a level has words, colors, numbers, pictures...
var DOMAINS = [
  ['Fruits', 'Vegetables', 'Berries', 'Nuts', 'Cheeses', 'Breads', 'Desserts', 'Pasta', 'Breakfast foods', 'Candy', 'Spices', 'Condiments', 'Drinks', 'Coffee drinks', 'Ice cream flavors', 'Cooking methods', 'Sweets', 'Fast food', 'Italian', 'Japanese', 'Mexican', 'French', 'Indian', 'Chinese', 'Greek', 'German', 'Kitchen items', 'Kitchen tools', 'Kitchen appliances'],
  ['Pets', 'Dog breeds', 'Baby animals', 'Farm animals', 'Zoo animals', 'Big cats', 'Rodents', 'Night animals', 'Birds', 'Insects', 'Reptiles', 'Sea creatures', 'Fish', 'Wild animals', 'Sea animals', 'Birds of prey', 'Waterbirds', 'Seabirds', 'Backyard birds', 'Tropical birds', 'Birds that cannot fly', 'Farm and game birds', 'Crow family'],
  ['Planets', 'Space'],
  ['Clothes', 'Hats', 'Shoes', 'Jewelry', 'Fabrics', 'Accessories'],
  ['Car brands', 'Road vehicles', 'Boats', 'Aircraft', 'Construction machines', 'Road signs', 'Land vehicles', 'Water vehicles'],
  ['Trees', 'Tree parts', 'Flowers', 'Plants and flowers', 'Landforms', 'Water sources', 'Weather', 'Seasons', 'Dog sounds', 'Spring bulbs', 'Wildflowers', 'Tropical flowers', 'Garden favorites', 'Blossoming trees and shrubs', 'Red flowers', 'Yellow flowers', 'Purple flowers', 'White flowers', 'Pink flowers', 'Blue flowers', 'Orange flowers'],
  ['Countries', 'US states', 'Capital cities', 'Continents', 'US cities', 'Rivers', 'Oceans and seas', 'Islands', 'Start with M', 'Start with N', 'Start with A', 'Start with C', 'Start with W', 'Start with I', 'Start with NEW', 'Touch the Pacific Ocean', 'Touch the Gulf of Mexico', 'Touch the Atlantic Ocean', 'Touch a Great Lake', 'Border Mexico', 'New England', 'Mountain states', 'The original 13 colonies', 'Joined the Union in the 1900s', 'Famous towers', 'Famous bridges', 'Ancient wonders', 'Natural wonders', 'Palaces and famous buildings', 'Statues and monuments', 'Landmarks of Europe', 'Landmarks of Asia', 'Landmarks of North America', 'Landmarks of South America', 'Landmarks of Africa', 'Landmarks of Australia'],
  ['1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', 'In the 20s', 'In the 30s', 'In the 40s', 'In the 50s', 'In the 60s', 'In the 70s', 'In the 80s', 'In the 90s', 'Teens', 'Single digits'],
  ['Months', 'Days of the week', 'Time units', 'Holidays'],
  ['Furniture', 'Bathroom items', 'Rooms', 'Cleaning supplies', 'Tools', 'Garden items', 'School supplies', 'School and office'],
  ['Body parts', 'Bones', 'Organs', 'Senses'],
  ['Sports', 'Golf words', 'Board games', 'Card games', 'Playground', 'Baseball', 'Sports balls and gear'],
  ['Instruments', 'Music styles', 'Dances'],
  ['Computer parts', 'Coding languages', 'Tech companies', 'Gadgets'],
  ['Punctuation', 'Parts of speech', 'Math words', 'School subjects', 'Kinds of writing'],
  ['Colors', 'Reds', 'Oranges', 'Pinks', 'Yellows', 'Browns', 'Greens', 'Blues', 'Purples', 'Grays'],
  ['Fairy tale creatures', 'Halloween things', 'Halloween'],
  ['Camping gear', 'Beach things'],
  ['Medical items', 'Money']
];
var DOMOF = {};
DOMAINS.forEach(function (d, i) { d.forEach(function (n) { DOMOF[n] = 'dom' + i; }); });
var MIXSRC = ['words', 'colors', 'pics', 'nums', 'decades', 'foods', 'states', 'flowers', 'birds', 'places'];
var MIXED = [];
MIXSRC.forEach(function (m) { MODES[m].bank.forEach(function (b) { MIXED.push({ g: m, name: b.name, words: b.words, tier: b.tier, src: m, dom: DOMOF[b.name] || (m + ':' + b.name) }); }); });
MODES.mixed = { name: 'Mixed', bank: MIXED, blurb: 'Words, colors, numbers and pictures together', kind: 'mixed' };
var MORDER = ['words', 'colors', 'pics', 'nums', 'decades', 'wordplay', 'bible', 'foods', 'states', 'flowers', 'birds', 'places', 'mixed'];
var $ = function (id) { return document.getElementById(id); };

// ---------- helpers ----------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, rng) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function range(n) { var r = []; for (var i = 0; i < n; i++) r.push(i); return r; }
function store(k, v) { try { if (v === undefined) { var s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } return null; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function dstr(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function disp(w) { w = String(w).replace(/_/g, ' '); return /[A-Z0-9]/.test(w) ? w : cap(w); }
var LABELS = { icecream: 'Ice cream', bubbletea: 'Bubble tea', misosoup: 'Miso soup', friedrice: 'Fried rice', springrolls: 'Spring rolls', chowmein: 'Chow mein', dimsum: 'Dim sum',
  pekingduck: 'Peking duck', wontonsoup: 'Wonton soup', greeksalad: 'Greek salad', blackforest: 'Black Forest', gulabjamun: 'Gulab jamun', tandoori: 'Tandoori', sunhat: 'Sun hat', witchhat: 'Witch hat',
  hotdog: 'Hot dog', paperclip: 'Paper clip', springrolls_: '', bookshelf: 'Bookshelf',
  forgetmenot: 'Forget-me-not', birdofparadise: 'Bird of paradise', tigerlily: 'Tiger lily', cherryblossom: 'Cherry blossom', bluejay: 'Blue jay', kiwibird: 'Kiwi',
  eiffel: 'Eiffel Tower', bigben: 'Big Ben', pisa: 'Leaning Tower', towerbridge: 'Tower Bridge', brandenburg: 'Brandenburg Gate', sagrada: 'Sagrada Familia', tajmahal: 'Taj Mahal', greatwall: 'Great Wall',
  fuji: 'Mount Fuji', angkorwat: 'Angkor Wat', forbiddencity: 'Forbidden City', burjkhalifa: 'Burj Khalifa', halong: 'Ha Long Bay', liberty: 'Statue of Liberty', goldengate: 'Golden Gate', rushmore: 'Mount Rushmore',
  niagara: 'Niagara Falls', grandcanyon: 'Grand Canyon', whitehouse: 'White House', empire: 'Empire State', spaceneedle: 'Space Needle', gatewayarch: 'Gateway Arch', brooklyn: 'Brooklyn Bridge', chichen: 'Chichen Itza',
  cntower: 'CN Tower', christ: 'Christ Redeemer', machu: 'Machu Picchu', iguazu: 'Iguazu Falls', pyramids: 'Pyramids', victoria: 'Victoria Falls', tablemountain: 'Table Mountain', sydneyopera: 'Sydney Opera', butterchicken: 'Butter chicken', newyear: 'New Year', valentine: 'Valentine’s Day', flipflops: 'Flip-flops', harbourbridge: 'Harbour Bridge' };
function cmode(id) { return S.lv.cards[id].m || S.mode; }
function label(id) { var w = S.lv.cards[id].w; return LABELS[w] || disp(w); }
function stateSvg(w, size) {
  var st = window.STATEDATA && window.STATEDATA[w]; if (!st) return '';
  return '<svg viewBox="6 14 48 44" width="' + size + '" height="' + Math.round(size * 44 / 48) + '"><path d="' + st.d + '" fill="' + st.c + '" stroke="#3a4a5a" stroke-width="1.6" stroke-linejoin="round"/></svg>';
}

// ---------- level generator ----------
var PAIRS = {};
function pairsFor(mode) {
  if (PAIRS[mode]) return PAIRS[mode];
  var B = MODES[mode].bank, out = [];
  for (var i = 0; i < B.length; i++) for (var j = i + 1; j < B.length; j++) {
    var sh = B[i].words.filter(function (w) { return B[j].words.indexOf(w) >= 0; });
    if (sh.length) out.push({ a: i, b: j, words: sh });
  }
  return (PAIRS[mode] = out);
}

function cfg(n, mode) {
  var c;
  if (n <= 3) c = { cats: 3, per: 3, tricks: 0 };
  else if (n <= 10) c = { cats: 3, per: 4, tricks: 0 };
  else if (n <= 25) c = { cats: 4, per: 4, tricks: 0 };
  else if (n <= 40) c = { cats: 4, per: 4, tricks: 1 };
  else if (n <= 60) c = { cats: 4, per: 5, tricks: 1 };
  else if (n <= 80) c = { cats: 5, per: 5, tricks: 1 };
  else c = { cats: 5, per: 5, tricks: 2 };
  if (mode === 'colors' && c.cats > 5) c.cats = 5;
  c.tier = ({ nums: 1, wordplay: 1, bible: 1, foods: 1, states: 1, mixed: 1 })[mode] ? (n <= 10 ? 1 : n <= 25 ? 2 : 3) : 9;
  if (mode === 'mixed') c.tricks = 0;
  if (mode === 'states' && c.cats > 4) c.cats = 4;
  c.gap = mode === 'decades' ? (n <= 25 ? 2 : 1) : 0;
  return c;
}

function makeLevel(n, seed, over, mode) {
  mode = mode || 'words';
  var base = over || cfg(n, mode);
  var BK = MODES[mode].bank, PR = pairsFor(mode);
  var c = base;
  var rng = mulberry32(seed);
  var tier = c.tier || 9, gap = c.gap || 0;
  function gapOK(idx, chosen) {
    if (!gap || BK[idx].pos === undefined) return true;
    for (var z = 0; z < chosen.length; z++) if (BK[chosen[z]].pos !== undefined && Math.abs(BK[chosen[z]].pos - BK[idx].pos) < gap) return false;
    return true;
  }
  for (var attempt = 0; attempt < 1800; attempt++) {
    if (attempt === 900) c = { cats: base.cats, per: Math.max(3, base.per - 1), tricks: 0, tier: base.tier, gap: base.gap };
    if (attempt === 1400) c = { cats: Math.max(3, base.cats - 1), per: Math.max(3, base.per - 2), tricks: 0, tier: base.tier, gap: base.gap };
    var chosen = [], used = {}, usedDom = {}, tw = [];
    var tn = attempt < 700 ? c.tricks : 0; // no tricks possible in some modes: fall back after many tries
    if (tn > 0) {
      var tp = shuffle(PR.slice(), rng);
      for (var q = 0; q < tp.length && tw.length < tn; q++) {
        var p = tp[q];
        if ((BK[p.a].tier || 1) > tier || (BK[p.b].tier || 1) > tier) continue;
        if (chosen.indexOf(p.a) >= 0 || chosen.indexOf(p.b) >= 0) continue;
        if (!gapOK(p.a, chosen) || !gapOK(p.b, chosen)) continue;
        var ga = BK[p.a].g, gb = BK[p.b].g;
        if ((used[ga] && ga !== gb) || (used[gb] && ga !== gb) || (ga === gb && used[ga])) continue;
        var w = p.words[Math.floor(rng() * p.words.length)];
        chosen.push(p.a, p.b); used[ga] = 1; used[gb] = 1;
        tw.push({ w: w, a: p.a, b: p.b, to: rng() < 0.5 ? p.a : p.b });
      }
      if (tw.length < tn) continue;
    }
    var order = shuffle(range(BK.length), rng);
    for (var k = 0; k < order.length && chosen.length < c.cats; k++) {
      var idx = order[k], g = BK[idx].g;
      if (used[g] || chosen.indexOf(idx) >= 0 || (BK[idx].tier || 1) > tier || !gapOK(idx, chosen)) continue;
      if (BK[idx].dom) { var dd = BK[idx].dom; if (usedDom[dd]) continue; usedDom[dd] = 1; }
      chosen.push(idx); used[g] = 1;
    }
    if (chosen.length < c.cats) continue;
    var designated = {}; tw.forEach(function (t) { designated[t.w] = t; });
    var bad = false;
    tw.forEach(function (t) { chosen.forEach(function (ci) { if (ci !== t.a && ci !== t.b && BK[ci].words.indexOf(t.w) >= 0) bad = true; }); });
    if (bad) continue;
    shuffle(chosen, rng);
    var cards = [], fail = false;
    chosen.forEach(function (ci, k2) {
      var must = [];
      tw.forEach(function (t) { if (t.to === ci) must.push(t.w); });
      var pool = BK[ci].words.filter(function (w2) {
        if (designated[w2]) return false;
        for (var o = 0; o < chosen.length; o++) if (chosen[o] !== ci && BK[chosen[o]].words.indexOf(w2) >= 0) return false;
        return true;
      });
      if (must.length + pool.length < c.per) { fail = true; return; }
      shuffle(pool, rng);
      must.concat(pool.slice(0, c.per - must.length)).forEach(function (w3) { cards.push({ w: w3, cat: k2, m: BK[ci].src }); });
    });
    if (fail) continue;
    shuffle(cards, rng);
    var ncols = c.cats <= 3 ? 3 : 4;
    var cols = range(ncols).map(function () { return []; });
    cards.forEach(function (_, i) { cols[i % ncols].push(i); });
    return { mode: mode, n: n, seed: seed, per: c.per, cats: chosen.map(function (ci) { return BK[ci].name; }), tricks: tw.map(function (t) { return t.w; }), cards: cards, cols: cols };
  }
  throw new Error('could not build level ' + n + ' (' + mode + ')');
}

// ---------- state ----------
var S = null, hist = [];
function defaults() { var sm = {}, cu = {}; MORDER.forEach(function (m) { sm[m] = {}; cu[m] = 1; }); return { sm: sm, curs: cu, mode: 'words', fs: 1, sound: true, first: true, streak: { last: '', count: 0 }, daily: {}, funAsked: [], coachDone: false, seen: {}, style: 'solitaire', zen: false, theme: { bg: 'auto', color: 'auto', card: 'classic', season: 'none', hol: 'none', auto: true, pack: 'none' }, packSound: true, own: {} }; }
var P = store('dw_prog') || defaults();
(function migrate() { // from the first test version
  var d = defaults();
  for (var k in d) if (P[k] === undefined) P[k] = d[k];
  MORDER.forEach(function (m) { if (!P.sm[m]) P.sm[m] = {}; if (!P.curs[m]) P.curs[m] = 1; });
  if (P.stars) { P.sm.words = P.stars; delete P.stars; if (P.cur) P.curs.words = P.cur; delete P.cur; }
  if (!P.first) P.coachDone = P.coachDone || P.funAsked.length > 0 || Object.keys(P.sm.words).length > 1;
  saveP();
})();
var ST = store('dw_stats') || { ev: [] };
function saveP() { store('dw_prog', P); }
function log(e, d) { var o = { t: Date.now(), e: e, m: S ? S.mode : P.mode }; if (d) for (var k in d) o[k] = d[k]; ST.ev.push(o); if (ST.ev.length > 1800) ST.ev.splice(0, 300); store('dw_stats', ST); }

function newState(lv, daily) {
  return { lv: lv, mode: lv.mode, daily: !!daily, cols: lv.cols.map(function (c) { return c.slice(); }),
    slots: lv.cats.map(function () { return { cat: -1, ids: [], done: false }; }), sel: null, misses: 0, moves: 0, hints: 3, hint: null, t0: Date.now(), won: false, bye: 0,
    style: P.style === 'grid' ? 'grid' : 'solitaire', gsel: [], gfound: [], gorder: range(lv.cards.length), doneOrder: [] };
}
function snap() { return JSON.stringify({ c: S.cols, s: S.slots, m: S.moves }); }
function pushHist() { hist.push(snap()); if (hist.length > 400) hist.shift(); }
function persistCur() { if (!S || S.won) return; store('dw_cur', { mode: S.mode, n: S.lv.n, seed: S.lv.seed, daily: S.daily, cols: S.cols, slots: S.slots, misses: S.misses, moves: S.moves, hints: S.hints, t0: S.t0, style: S.style, gsel: S.gsel, gfound: S.gfound, gorder: S.gorder, doneOrder: S.doneOrder }); }

function visibleModes() { return MORDER.filter(function (m) { return !(m === 'bible' && P.hideBible); }); }
function dailyMode() { var d = new Date(); var k = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); var L = MORDER.filter(function (m) { return m !== 'bible'; }); return L[k % L.length]; }
var DCFG = { cats: 4, per: 5, tricks: 1, tier: 3, gap: 1 };

function startLevel(n, opts) {
  opts = opts || {};
  var mode = opts.mode || P.mode;
  if (!opts.daily && levelLocked(mode, n)) { if (!S) startLevel(FREELEVELS, { mode: mode }); lockModes(mode, n); return; }
  var seed = opts.seed || (n * 7919 + 13 + MORDER.indexOf(mode) * 100003);
  var lv = makeLevel(n, seed, opts.cfg, mode);
  document.querySelectorAll('.ghost,.drag-ghost').forEach(function (e) { e.remove(); });
  S = newState(lv, opts.daily); hist = [];
  if (!opts.daily) { P.mode = mode; P.curs[mode] = n; saveP(); }
  log('level_start', { n: n, daily: !!opts.daily });
  persistCur(); closeModal(); render();
  var TIPS = {
    colors: 'Colors: group the shades by color family. Some shades sit between two families!',
    pics: 'Pictures: group the pictures by what they are.',
    nums: 'Numbers: sort by what they have in common, like even, odd, or times tables.',
    decades: 'Remember When: sort by the decade each one first arrived.',
    wordplay: 'Word Play: sort by sound or spelling, like rhymes, endings, or double letters.',
    bible: 'Bible: sort books, people, places and stories into their groups.',
    foods: 'Foods of the World: sort the dishes by the country they come from.',
    states: 'US States: sort the states by their name or where they are.',
    flowers: 'Flowers: sort the flowers by their type or their color.',
    birds: 'Birds: sort the birds by the kind of bird they are.',
    places: 'Famous Places: sort the landmarks by what they are or where they are.',
    mixed: 'Mixed: every group is a different kind of card, so look carefully.'
  };
  if (!P.seen[mode] && TIPS[mode]) { P.seen[mode] = 1; saveP(); toast(TIPS[mode]); }
  else if (S.style === 'grid' && !P.seen.grid) { P.seen.grid = 1; saveP(); toast('Four Groups: tap ' + S.lv.per + ' cards that belong together, then press Submit.'); }
}

// ---------- actions ----------
function ends() {
  var r = [];
  S.cols.forEach(function (c, i) { if (c.length) r.push({ id: c[c.length - 1], from: 'col', i: i }); });
  S.slots.forEach(function (s, i) { if (!s.done && s.ids.length) r.push({ id: s.ids[s.ids.length - 1], from: 'slot', i: i }); });
  return r;
}
function selId() { if (!S.sel) return -1; var a = S.sel.from === 'col' ? S.cols[S.sel.i] : S.slots[S.sel.i].ids; return a.length ? a[a.length - 1] : -1; }
function takeSel() { var a = S.sel.from === 'col' ? S.cols[S.sel.i] : S.slots[S.sel.i].ids; var id = a.pop(); if (S.sel.from === 'slot' && !a.length) S.slots[S.sel.i].cat = -1; return id; }

function tapCard(from, i) {
  unlock();
  if (S.won) return;
  var arr = from === 'col' ? S.cols[i] : S.slots[i].ids;
  if (!arr.length) return;
  if (S.sel && S.sel.from === from && S.sel.i === i) { S.sel = null; S.hint = null; render(); return; }
  if (S.sel) { if (from === 'col') return tapColumn(i); return tapSlot(i); }
  S.sel = { from: from, i: i }; S.hint = null; sfx('tick'); render();
}
function tapColumn(i) {
  unlock();
  if (S.won) return;
  if (!S.sel) { if (S.cols[i].length) tapCard('col', i); return; }
  if (S.sel.from === 'col' && S.sel.i === i) { S.sel = null; render(); return; }
  pushHist();
  var id = takeSel(); S.cols[i].push(id); S.moves++; S.sel = null; S.hint = null;
  sfx('tick'); persistCur(); render();
}
function tapSlot(i) {
  unlock();
  if (S.won) return;
  var s = S.slots[i];
  if (!S.sel) { if (s.done) toast(S.lv.cats[s.cat]); else if (s.ids.length) tapCard('slot', i); return; }
  if (s.done) { toast('That group is finished'); return; }
  if (S.sel.from === 'slot' && S.sel.i === i) { S.sel = null; render(); return; }
  var id = selId(), card = S.lv.cards[id];
  if (s.ids.length && s.cat !== card.cat) {
    S.misses++; sfx('miss'); log('miss', { n: S.lv.n }); shake(i); toast('Does not fit that group'); S.sel = null; persistCur(); render(); return;
  }
  pushHist();
  fly(id, i);
  takeSel(); s.cat = card.cat; s.ids.push(id); S.moves++; S.sel = null; S.hint = null; S.bump = i;
  if (s.ids.length === S.lv.per) { s.done = true; S.doneOrder.push(s.cat); sfx('clear'); sparkle(i); toast(S.lv.cats[s.cat] + '!'); if (!P.coachDone) { P.coachDone = true; saveP(); S.bye = Date.now() + 6000; setTimeout(render, 6100); } } else sfx('ok');
  persistCur(); render();
  if (S.slots.every(function (x) { return x.done; })) win();
}
function undo() {
  unlock();
  if (!hist.length || S.won) { toast('Nothing to undo'); return; }
  var o = JSON.parse(hist.pop()); S.cols = o.c; S.slots = o.s; S.moves = o.m; S.sel = null; S.hint = null;
  log('undo'); persistCur(); sfx('tick'); render();
}

function findHint() {
  var colEnds = ends().filter(function (e) { return e.from === 'col'; });
  var h = null, msg = '';
  for (var k = 0; k < colEnds.length && !h; k++) {
    var card = S.lv.cards[colEnds[k].id];
    for (var si = 0; si < S.slots.length; si++) if (!S.slots[si].done && S.slots[si].ids.length && S.slots[si].cat === card.cat) { h = { id: colEnds[k].id, slot: si }; msg = 'This card fits the highlighted group'; break; }
  }
  if (!h) {
    var empty = -1; S.slots.forEach(function (s, i) { if (empty < 0 && !s.done && !s.ids.length) empty = i; });
    for (var a = 0; a < colEnds.length && !h && empty >= 0; a++) for (var b = a + 1; b < colEnds.length; b++)
      if (S.lv.cards[colEnds[a].id].cat === S.lv.cards[colEnds[b].id].cat) { h = { id: colEnds[a].id, slot: empty, id2: colEnds[b].id }; msg = 'These two cards belong together'; break; }
  }
  if (!h) {
    var bd = 99;
    colEnds.forEach(function (ce) {
      S.cols.forEach(function (c) {
        c.forEach(function (id2, k) {
          if (id2 !== ce.id && S.lv.cards[id2].cat === S.lv.cards[ce.id].cat) { var d = c.length - 1 - k; if (d < bd) { bd = d; h = { id: ce.id, id2: id2 }; msg = 'These two belong together'; } }
        });
      });
    });
  }
  if (!h) {
    var best = -1, bl = -1; S.cols.forEach(function (c, i) { if (c.length > bl) { bl = c.length; best = i; } });
    if (best >= 0) { h = { id: S.cols[best][S.cols[best].length - 1] }; msg = 'Move this card to another column to uncover the ones below'; }
  }
  return h ? { h: h, msg: msg } : null;
}
function giveHint() {
  unlock();
  if (S.won) return;
  if (S.hints <= 0) { toast('No hints left'); return; }
  if (S.style === 'grid') {
    var left = S.lv.cats.map(function (c, i) { return i; }).filter(function (i) { return !isFound(i); });
    if (!left.length) return;
    var c0 = left[Math.floor(Math.random() * left.length)];
    var two = S.gorder.filter(function (id) { return S.lv.cards[id].cat === c0; }).slice(0, 2);
    S.hints--; S.hint = { id: two[0], id2: two[1] }; log('hint', { n: S.lv.n }); toast('These two belong together'); render(); return;
  }
  var r = findHint(); if (!r) return;
  S.hints--; S.hint = r.h; log('hint', { n: S.lv.n }); toast(r.msg); render();
}

function win() {
  S.won = true; confetti(70);
  var secs = Math.round((Date.now() - S.t0) / 1000);
  var allowed = Math.ceil(S.lv.cards.length / 6);
  var stars = S.misses <= allowed ? 3 : S.misses <= allowed * 2 ? 2 : 1;
  S.stars = stars;
  var sm = P.sm[S.mode], key = String(S.lv.n);
  if (!S.daily) { sm[key] = Math.max(sm[key] || 0, stars); P.curs[S.mode] = S.lv.n + 1; }
  var today = dstr();
  if (S.daily && P.daily.date !== today) {
    P.daily = { date: today, stars: stars, mode: S.mode };
    var ystr = dstr(new Date(Date.now() - 864e5));
    P.streak.count = (P.streak.last === ystr) ? P.streak.count + 1 : 1; P.streak.last = today;
  }
  saveP(); store('dw_cur', null);
  log('level_done', { style: S.style, n: S.lv.n, daily: S.daily, misses: S.misses, moves: S.moves, secs: secs, stars: stars, hints: 3 - S.hints });
  sfx('win');
  var done = totalDone();
  setTimeout(function () { showWin(stars, secs, done); }, 600);
}

// ---------- rendering ----------
var PAL = [['#ff6b6b', '#ff9a76'], ['#17a589', '#45cfae'], ['#e8920c', '#f4b940'], ['#5b6cf0', '#8c9bff'], ['#b45fc9', '#d88be3']];
var STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
var CHECK = '<span class="ck"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>';
function hexText(hex) { var r = parseInt(hex.substr(1, 2), 16), g = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16); return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#2b211c' : '#ffffff'; }

var K = 1, fitTries = 0;
// Make the cards (and group boxes) as big as the screen allows, so easy levels do not leave half the screen empty.
function fitK(cw, grid) {
  var cc = $('cols'), avail = (cc.clientHeight || Math.round(window.innerHeight * 0.5)) - 22;
  var small = window.innerHeight <= 720;
  var tall = S.lv.cards.some(function (c) { var kd = MODES[c.m || S.mode].kind; return kd !== 'text' && kd !== 'colors'; });
  var h0 = tall ? (small ? 70 : 86) : (small ? 56 : 64), s0 = tall ? (small ? 42 : 56) : (small ? 28 : 32), base, kmax;
  if (grid) {
    var ncol = S.lv.cards.length >= 16 ? 4 : 3, rows = Math.max(1, Math.ceil(S.gorder.length / ncol)), gh = tall ? 92 : 66;
    base = rows * (gh + 9) - 9; kmax = Math.min(2.0, (tall ? 1.7 : 1.4) * cw / gh);
  } else {
    var depth = 1; S.cols.forEach(function (c) { if (c.length > depth) depth = c.length; });
    base = (depth - 1) * s0 + h0; kmax = Math.min(2.4, (tall ? 1.9 : 1.5) * cw / h0);
  }
  return Math.round(Math.max(1, Math.min(kmax, avail / base)) * 100) / 100;
}
function cardEl(id, cls, w) {
  var wd = S.lv.cards[id].w, m = cmode(id), kind = MODES[m].kind;
  if (kind === 'text') {
    var txt = disp(wd), two = txt.length > 11 && txt.indexOf(' ') > 0;
    var capPx = Math.round(19 * (1 + (K - 1) * 0.6)) * (txt.length <= 3 ? 1.25 : 1);
    var fs = two ? 13 * P.fs * (1 + (K - 1) * 0.35) : Math.max(12, Math.min(capPx, Math.floor(w * 0.82 / (txt.length * 0.56)))) * P.fs;
    return '<div class="card' + (two ? ' two' : '') + ' ' + cls + '" data-id="' + id + '" style="font-size:' + fs.toFixed(1) + 'px">' + esc(txt) + '</div>';
  }
  if (kind === 'colors') {
    var hex = window.COLORS[wd], fs2 = Math.max(12, Math.min(Math.round(17 * (1 + (K - 1) * 0.6)), Math.floor(w * 0.8 / (wd.length * 0.56)))) * P.fs;
    return '<div class="card c ' + cls + '" data-id="' + id + '" style="background:' + hex + ';color:' + hexText(hex) + ';font-size:' + fs2.toFixed(1) + 'px">' + esc(cap(wd)) + '</div>';
  }
  var lab = label(id), nfs = lab.length > 11 ? ' style="font-size:10.5px"' : '';
  if (kind === 'photo') return '<div class="card p ' + cls + '" data-id="' + id + '"><img class="ph" src="pics/' + wd + '.webp" alt="" draggable="false"><span class="n"' + nfs + '>' + esc(lab) + '</span></div>';
  if (kind === 'states') return '<div class="card p s ' + cls + '" data-id="' + id + '"><span class="n"' + nfs + '>' + esc(lab) + '</span>' + stateSvg(wd, 56) + '</div>';
  return '<div class="card p ' + cls + '" data-id="' + id + '"><img src="pics/' + wd + '.webp" alt="" draggable="false"><span class="n"' + nfs + '>' + esc(lab) + '</span></div>';
}
function slotItem(id) {
  var wd = S.lv.cards[id].w, kind = MODES[cmode(id)].kind;
  if (kind === 'colors') return '<i class="dot" style="background:' + window.COLORS[wd] + '"></i>' + esc(cap(wd));
  if (kind === 'states') return stateSvg(wd, 24) + esc(label(id));
  if (kind === 'img') return '<img src="pics/' + wd + '.webp" alt="">' + esc(label(id));
  if (kind === 'photo') return '<img class="ph" src="pics/' + wd + '.webp" alt="">' + esc(label(id));
  var t = disp(wd);
  return t.length > 12 ? '<span style="font-size:.88em">' + esc(t) + '</span>' : esc(t);
}

function coachInfo() {
  if (S.style === 'grid') return null;
  if (P.coachDone && !(S.bye && Date.now() < S.bye)) return null;
  if (S.daily) return null;
  if (S.bye && Date.now() < S.bye) return { msg: 'Group complete! Keep going until every box is full.' };
  var started = S.slots.some(function (s) { return s.ids.length; });
  if (!S.sel && !started) { var e = ends().filter(function (x) { return x.from === 'col'; })[0]; return { msg: 'Step 1: Tap a card at the BOTTOM of any column.', card: e && e.id }; }
  if (S.sel && !started) return { msg: 'Step 2: Now tap an empty box at the top to put the card there.', slot: 0 };
  var si = -1; S.slots.forEach(function (s, i) { if (si < 0 && s.ids.length && !s.done) si = i; });
  if (!S.sel && started) { var r = findHint(); return { msg: 'Step 3: Tap another card that belongs in the SAME group, then tap that box. (The glowing card fits.)', card: r && r.h.slot === si ? r.h.id : undefined, slot: si }; }
  return { msg: 'Now tap the box. If the card does not belong, it only counts as a miss.', slot: si };
}

function captureRects() { var m = {}; document.querySelectorAll('#cols [data-id]').forEach(function (el) { m[el.getAttribute('data-id')] = el.getBoundingClientRect(); }); return m; }

// the line of group names above the boxes (Settings can hide it for a harder game)
function showGroups() { return P.showGroups !== false; }
function renderClue() {
  var cl = $('clue');
  if (!showGroups()) { cl.classList.remove('on'); cl.innerHTML = ''; return; }
  var ord = S.lv.cats.map(function (c, i) { return i; }).sort(function (a, b) { return S.lv.cats[a] < S.lv.cats[b] ? -1 : 1; });
  cl.innerHTML = '<b class="cl">Find these groups</b>' + ord.map(function (i) {
    var pal = PAL[i % PAL.length], inBox = S.style !== 'grid' && S.slots.some(function (x) { return !x.done && x.ids.length && x.cat === i; }), f = isFound(i);
    return '<span class="cg' + (f ? ' on' : inBox ? ' cur' : '') + '" style="--c1:' + pal[0] + ';--c2:' + pal[1] + '">' + (f ? '✓ ' : '') + esc(S.lv.cats[i]) + '</span>';
  }).join('');
  cl.classList.add('on');
}
function render() {
  if (!S) return;
  var before = captureRects();
  var W = Math.min(window.innerWidth, 480) - 28;
  var nc = S.cols.length, gap = 9, cw = (W - gap * (nc - 1)) / nc;
  var h = S.hint, sid = selId(), co = coachInfo();
  if (S.style !== 'grid') applyK(fitK(cw, false));
  document.body.setAttribute('data-mode', S.mode);
  $('modeTag').textContent = S.daily ? 'Daily deck · ' + MODES[S.mode].name : MODES[S.mode].name;
  $('lvl').textContent = S.daily ? 'Today' : 'Level ' + S.lv.n;
  var allowed = Math.ceil(S.lv.cards.length / 6), live = S.misses <= allowed ? 3 : S.misses <= allowed * 2 ? 2 : 1;
  $('stars').innerHTML = [1, 2, 3].map(function (i) { return STAR.replace('<svg', '<svg' + (i > live ? ' class="off"' : '')); }).join('');
  $('miss').textContent = S.misses + (S.misses === 1 ? ' miss' : ' misses');
  $('dots').innerHTML = S.lv.cats.map(function (c, i) { return '<i' + (isFound(i) ? ' class="on"' : '') + '></i>'; }).join('');
  $('stars').style.display = $('miss').style.display = P.zen ? 'none' : '';
  $('hintBadge').textContent = S.hints > 0 ? S.hints : '+3';
  $('hintLbl').textContent = S.hints > 0 ? 'Hint' : 'More hints';
  setBar(); renderClue();
  if (S.style === 'grid') { renderGrid(); persistCur(); return; }
  var cb = $('coach');
  if (co) { cb.innerHTML = esc(co.msg) + ' <a data-act="coachoff">Hide tips</a>'; cb.classList.add('on'); } else cb.classList.remove('on');
  var ns = S.slots.length, sl = $('slots'); sl.className = 'slots n' + ns;
  var html = '';
  S.slots.forEach(function (s, i) {
    var pal = s.cat >= 0 ? PAL[s.cat % PAL.length] : ['#cdbfae', '#cdbfae'];
    var hit = (h && h.slot === i) || (co && co.slot === i);
    html += '<div class="slot' + (s.done ? ' done' : s.ids.length ? ' started' : ' empty') + (hit ? ' hint' : '') + (S.sel && !s.done ? ' target' : '') + (S.bump === i ? ' bump' : '') + '" data-slot="' + i + '" style="--c1:' + pal[0] + ';--c2:' + pal[1] + '">';
    html += '<div class="sh">' + (s.done ? CHECK + esc(S.lv.cats[s.cat]) : s.ids.length ? (showGroups() ? esc(S.lv.cats[s.cat]) + ' · ' : 'Group ') + s.ids.length + '/' + S.lv.per : 'Empty') + '</div>';
    s.ids.forEach(function (id, k) {
      var last = k === s.ids.length - 1 && !s.done;
      html += '<div class="sw' + (last && sid === id ? ' sel' : '') + '"' + (last ? ' data-top="1"' : '') + '>' + slotItem(id) + '</div>';
    });
    html += '</div>';
  });
  sl.innerHTML = html; S.bump = -1;
  var ch = '';
  S.cols.forEach(function (c, i) {
    ch += '<div class="col" data-col="' + i + '" style="width:' + cw + 'px">';
    if (!c.length) ch += '<div class="empty">' + (S.sel ? 'Park here' : '') + '</div>';
    c.forEach(function (id, k) {
      var last = k === c.length - 1, cls = last ? 'play' : 'locked';
      if (last && sid === id) cls += ' sel';
      if ((h && (h.id === id || h.id2 === id)) || (co && co.card === id)) cls += ' hint';
      ch += cardEl(id, cls, cw);
    });
    ch += '</div>';
  });
  $('cols').innerHTML = ch;
  // glide cards that moved (uncovered or parked) to their new place
  document.querySelectorAll('#cols [data-id]').forEach(function (el) {
    var r0 = before[el.getAttribute('data-id')]; if (!r0 || !el.animate) return;
    var r1 = el.getBoundingClientRect(), dx = r0.left - r1.left, dy = r0.top - r1.top;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
  });
  var k2 = fitK(cw, false);
  if (Math.abs(k2 - K) > 0.03 && fitTries < 3) { fitTries++; applyK(k2); render(); return; }
  fitTries = 0;
  persistCur();
}
// a copy of the card flies into the group box
function fly(id, si) {
  if (S.noFly) return;
  var el = document.querySelector('#cols [data-id="' + id + '"]');
  if (!el || !el.animate) return;
  var r = el.getBoundingClientRect(), g = el.cloneNode(true);
  g.className = el.className.replace(/\bsel\b|\bhint\b/g, '') + ' ghost';
  g.style.left = r.left + 'px'; g.style.top = r.top + 'px'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
  document.body.appendChild(g);
  setTimeout(function () { g.remove(); }, 900);
  setTimeout(function () {
    var t = document.querySelector('.slot[data-slot="' + si + '"]');
    if (!t) { g.remove(); return; }
    var tr = t.getBoundingClientRect(), dx = tr.left + tr.width / 2 - (r.left + r.width / 2), dy = tr.top + tr.height / 2 - (r.top + r.height / 2);
    g.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.45)', opacity: 0.1 }], { duration: 280, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' }).onfinish = function () { g.remove(); };
  }, 0);
}
function sparkle(si) {
  setTimeout(function () {
    var t = document.querySelector('.slot[data-slot="' + si + '"]'); if (!t || !t.animate) return;
    var r = t.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var k = 0; k < 16; k++) {
      var d = document.createElement('i'), a = Math.random() * 6.28, dist = 40 + Math.random() * 60;
      d.className = 'conf'; d.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;width:8px;height:8px;border-radius:50%;animation:none;background:' + ['#fff', '#ffe08a', '#ffb3a7', '#a8f0e0'][k % 4];
      document.body.appendChild(d);
      d.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * dist + 'px,' + Math.sin(a) * dist + 'px) scale(.2)', opacity: 0 }], { duration: 650, easing: 'ease-out' }).onfinish = (function (n) { return function () { n.remove(); }; })(d);
    }
  }, 30);
}
function confetti(n) {
  var cols = ['#ff6b6b', '#f6b73c', '#2bc5a8', '#5b6cf0', '#c25fd8', '#ff9a5a'];
  for (var i = 0; i < n; i++) {
    var d = document.createElement('i'); d.className = 'conf';
    d.style.left = Math.random() * 100 + 'vw'; d.style.background = cols[i % cols.length];
    d.style.animationDelay = (Math.random() * 0.5) + 's'; d.style.animationDuration = (1.4 + Math.random() * 1.2) + 's';
    document.body.appendChild(d); setTimeout((function (x) { return function () { x.remove(); }; })(d), 3200);
  }
}
function shake(i) { var el = document.querySelector('[data-slot="' + i + '"]'); if (el) { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 400); } }
var tt = 0;
function toast(m) { var t = $('toast'); if (!m) { t.classList.remove('on'); return; } t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600); }


// ---------- Four Groups (grid) play style ----------
function isFound(cat) { return S.style === 'grid' ? S.gfound.indexOf(cat) >= 0 : S.slots.some(function (x) { return x.done && x.cat === cat; }); }
var ICO = {
  undo: '<svg viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/></svg>',
  restart: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};
function setBar() {
  var g = S.style === 'grid', u = $('bUndo'), r = $('bRestart');
  var ukey = g ? 'shuffle' : 'undo', rkey = g ? 'submit' : 'restart';
  if (u.getAttribute('data-k') !== ukey) { u.setAttribute('data-k', ukey); u.innerHTML = (g ? ICO.shuffle + 'Shuffle' : ICO.undo + 'Undo'); }
  if (r.getAttribute('data-k') !== rkey) { r.setAttribute('data-k', rkey); r.innerHTML = (g ? ICO.check + 'Submit' : ICO.restart + 'Restart'); }
  r.classList.toggle('ready', g && S.gsel.length === S.lv.per);
}
function gridTap(id) {
  unlock();
  if (S.won) return;
  var i = S.gsel.indexOf(id);
  if (i >= 0) S.gsel.splice(i, 1); else if (S.gsel.length < S.lv.per) S.gsel.push(id); else { toast('Deselect one first, or press Submit'); return; }
  S.hint = null; sfx('tick'); render();
}
function gridShuffle() { unlock(); if (S.won) return; for (var i = S.gorder.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = S.gorder[i]; S.gorder[i] = S.gorder[j]; S.gorder[j] = t; } sfx('tick'); render(); }
function gridSubmit() {
  unlock();
  if (S.won) return;
  var per = S.lv.per;
  if (S.gsel.length !== per) { toast('Pick ' + per + ' cards first'); return; }
  var cats = S.gsel.map(function (id) { return S.lv.cards[id].cat; });
  var cnt = {}; cats.forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; });
  var best = Math.max.apply(null, Object.keys(cnt).map(function (k) { return cnt[k]; }));
  S.moves++;
  if (best === per) {
    var c = cats[0]; S.gfound.push(c); S.doneOrder.push(c);
    S.gorder = S.gorder.filter(function (id) { return S.gsel.indexOf(id) < 0; });
    S.gsel = []; S.hint = null; sfx('clear'); toast(S.lv.cats[c] + '!'); render();
    if (S.gfound.length === S.lv.cats.length) win();
  } else {
    S.misses++; sfx('miss'); log('miss', { n: S.lv.n });
    toast(best === per - 1 ? 'So close - one card is wrong!' : 'Not a group. Try again.');
    var g = document.querySelector('#cols .grid'); if (g && g.animate) g.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 320 });
    persistCur(); render();
  }
}
function applyK(k) {
  K = k;
  $('cols').style.setProperty('--k', k); $('cols').style.setProperty('--kf', 1 + (k - 1) * 0.5);
  $('slots').style.setProperty('--ks', 1 + (k - 1) * 0.35);
}
function renderGrid() {
  var W = Math.min(window.innerWidth, 480) - 28, n = S.lv.cards.length, cols = n >= 16 ? 4 : 3, gap = 9, cw = (W - gap * (cols - 1)) / cols;
  applyK(fitK(cw, true));
  $('coach').classList.remove('on');
  var sl = $('slots'); sl.className = 'slots bands';
  sl.innerHTML = S.gfound.map(function (c) {
    var pal = PAL[c % PAL.length];
    var items = S.lv.cards.map(function (cd, id) { return cd.cat === c ? '<span>' + slotItem(id) + '</span>' : ''; }).join('');
    return '<div class="slot done band" style="--c1:' + pal[0] + ';--c2:' + pal[1] + '"><div class="sh">' + CHECK + esc(S.lv.cats[c]) + '</div><div class="bw">' + items + '</div></div>';
  }).join('');
  var h = S.hint, ch = '<div class="grid" style="grid-template-columns:repeat(' + cols + ',1fr)">';
  S.gorder.forEach(function (id) {
    var cls = 'gcard' + (S.gsel.indexOf(id) >= 0 ? ' sel' : '') + (h && (h.id === id || h.id2 === id) ? ' hint' : '');
    ch += cardEl(id, cls, cw);
  });
  $('cols').innerHTML = ch + '</div>';
  var k2 = fitK(cw, true);
  if (Math.abs(k2 - K) > 0.03 && fitTries < 3) { fitTries++; applyK(k2); renderGrid(); return; }
  fitTries = 0;
}
function shareResult() {
  var sq = ['🟥', '🟩', '🟨', '🟦', '🟪'];
  var line = S.doneOrder.map(function (c) { return sq[c % 5]; }).join('');
  var txt = 'Alikeberry · ' + MODES[S.mode].name + (S.daily ? ' · Daily ' + dstr() : ' · Level ' + S.lv.n) + '\n' +
    (P.zen ? '' : '⭐'.repeat(S.stars || 1) + ' · ' + S.misses + ' miss' + (S.misses === 1 ? '' : 'es') + '\n') + line + '\n' + location.origin + location.pathname;
  log('share');
  if (navigator.share) { navigator.share({ text: txt }).catch(function () { }); return; }
  var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast('Copied! Paste it into a message.'); } catch (e) { toast(txt); }
  ta.remove();
}


// ---------- themes: holidays, backgrounds, colors, card styles, seasons ----------
// item = [id, label, free?, swatch]. Paid ones come with the Every Theme purchase; holidays are always free.
var TH = {
  hol: { label: 'Holidays', items: [
    ['none', 'None', 1, '∅'], ['christmas', 'Christmas', 1, '🎄'], ['halloween', 'Halloween', 1, '🎃'], ['thanksgiving', 'Thanksgiving', 1, '🦃'],
    ['july4', '4th of July', 1, '🎆'], ['valentine', 'Valentine’s', 1, '💝'], ['stpat', 'St. Patrick’s', 1, '🍀'], ['easter', 'Easter', 1, '🐣'], ['newyear', 'New Year’s Eve', 1, '🥂'] ] },
  bg: { label: 'Backgrounds', items: [
    ['auto', 'Auto', 1, 'linear-gradient(135deg,#fbf6ee,#efd9c2)'], ['meadow', 'Meadow', 0, 'linear-gradient(135deg,#f3faea,#c5e6ae)'], ['sunset', 'Sunset', 0, 'linear-gradient(135deg,#fff1e8,#f4a9a0)'],
    ['night', 'Night sky', 0, 'linear-gradient(135deg,#3b3f9c,#0a0b22)'], ['lake', 'Lake', 0, 'linear-gradient(135deg,#eaf8fb,#8fd0e4)'], ['autumn', 'Autumn', 0, 'linear-gradient(135deg,#fff4e0,#e8ac62)'], ['winter', 'Winter', 0, 'linear-gradient(135deg,#f4f9fe,#bcd4ec)'] ] },
  color: { label: 'Colors', items: [
    ['auto', 'Auto', 1, 'linear-gradient(135deg,#ff6b4a,#7a5af8)'], ['coral', 'Coral', 0, 'linear-gradient(135deg,#ff6b4a,#ff9a5a)'], ['ocean', 'Ocean', 0, 'linear-gradient(135deg,#2a7de1,#5bc0f8)'],
    ['lavender', 'Lavender', 0, 'linear-gradient(135deg,#8a63d2,#b99bff)'], ['forest', 'Forest', 0, 'linear-gradient(135deg,#2f8f5b,#7acb8c)'], ['berry', 'Berry', 0, 'linear-gradient(135deg,#c2386f,#f27aa8)'], ['mono', 'Mono', 0, 'linear-gradient(135deg,#4a4a55,#9a9aa8)'] ] },
  card: { label: 'Cards', items: [
    ['classic', 'Classic', 1], ['paper', 'Paper', 0], ['wood', 'Wood', 0], ['glass', 'Frosted', 0], ['pastel', 'Pastel', 0], ['bold', 'Bold', 0] ] },
  season: { label: 'Seasons', items: [
    ['none', 'None', 1, '∅'], ['spring', 'Spring', 0, '🌸'], ['summer', 'Summer', 0, '✨'], ['fall', 'Fall', 1, '🍂'], ['winter', 'Winter', 0, '❄️'] ] }
};
var PACKS = [
  { id: 'blossom', name: 'Cherry Blossom Garden', free: 1, tone: 'light', card: 'paper', fx: 'packblossom', snd: 'audio/piano2.mp3', blurb: 'Drifting petals and soft piano' },
  { id: 'harvest', name: 'Autumn Harvest', free: 1, tone: 'light', card: 'wood', fx: 'packharvest', snd: 'audio/piano5.mp3', blurb: 'Golden leaves and gentle piano' },
  { id: 'beach', name: 'Beach Day', free: 0, tone: 'light', card: 'pastel', fx: 'packbeach', snd: 'audio/beach.mp3', blurb: 'Sunrise, sparkles and ocean waves' },
  { id: 'cabin', name: 'Cozy Cabin', free: 0, tone: 'dark', card: 'wood', fx: 'packcabin', snd: 'audio/fire.mp3', blurb: 'Snow outside, a crackling fire' },
  { id: 'rainy', name: 'Rainy Day', free: 0, tone: 'dark', card: 'glass', fx: 'packrainy', snd: 'audio/rain.mp3', blurb: 'Rain on the window' },
  { id: 'starry', name: 'Starry Night', free: 0, tone: 'dark', card: 'glass', fx: 'packstarry', snd: 'audio/piano4.mp3', blurb: 'Twinkling stars and calm piano' }
];
function packOf(id) { for (var i = 0; i < PACKS.length; i++) if (PACKS[i].id === id) return PACKS[i]; return null; }

// ---------- purchases ----------
// In the app, the store bridge (RevenueCat) sets window.ABStore = { buy(id), restore(), owned(), prices() }, each a Promise
// (buy/restore/owned give the list of product ids the player owns, without the store's 'alikeberry_' prefix; prices gives { id: '$x.xx' } in the player's currency).
// What is saved on the phone is only a copy: the app asks the store again every time it starts.
// The web test version has no store, so it offers a clearly labeled free test unlock instead.
var PRODUCTS = { remove_ads: ['Remove Ads', '$3.99'], all_modes: ['All Modes', '$4.99'], bundle: ['Ad-free + All Modes', '$7.99'],
  theme_beach: ['Beach Day', '$1.99'], theme_cabin: ['Cozy Cabin', '$1.99'], theme_rainy: ['Rainy Day', '$1.99'], theme_starry: ['Starry Night', '$1.99'], themes_all: ['Every Theme', '$3.99'] };
var FREEMODES = { words: 1, colors: 1, nums: 1 }, FREELEVELS = 20;
var NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
var SHOP = { prices: {}, busy: false, after: null };
function owns(id) { return !!(P.own && P.own[id]); }
function hasAdFree() { return owns('remove_ads') || owns('bundle'); }
function hasModes() { return owns('all_modes') || owns('bundle'); }
function hasPack(id) { var p = packOf(id); return !p || !!p.free || owns('themes_all') || owns('theme_' + id); }
function hasTheme(k, it) { return k === 'hol' || !!it[2] || owns('themes_all'); }
function levelLocked(m, n) { return !FREEMODES[m] && n > FREELEVELS && !hasModes(); }
function price(id) { return SHOP.prices[id] || PRODUCTS[id][1]; }
function setOwned(ids, replace) { if (replace || !P.own) P.own = {}; (ids || []).forEach(function (i) { if (PRODUCTS[i]) P.own[i] = 1; }); saveP(); }
// drop a paid look the player does not own (for example after a refund)
function themeCheck() {
  var t = P.theme, d = { bg: 'auto', color: 'auto', card: 'classic', season: 'none' };
  if (!hasPack(t.pack)) t.pack = 'none';
  Object.keys(d).forEach(function (k) { var it = TH[k].items.filter(function (x) { return x[0] === t[k]; })[0]; if (!it || !hasTheme(k, it)) t[k] = d[k]; });
  saveP();
}
function storeSync() {
  if (!window.ABStore) return;
  window.ABStore.owned().then(function (ids) { setOwned(ids, true); themeCheck(); applyTheme(); }).catch(function () { });
  if (window.ABStore.prices) window.ABStore.prices().then(function (pr) { SHOP.prices = pr || {}; }).catch(function () { });
}
function buy(id) {
  if (SHOP.busy || !PRODUCTS[id]) return;
  log('buy_tap', { id: id });
  if (window.ABStore) {
    SHOP.busy = true; toast('Opening the store…');
    window.ABStore.buy(id).then(function (ids) { SHOP.busy = false; setOwned(ids, true); if (owns(id)) bought(id); else toast('Purchase not finished. You were not charged.'); })
      .catch(function () { SHOP.busy = false; toast('Purchase not finished. You were not charged.'); });
    return;
  }
  if (NATIVE) { toast('The store is not available right now. Please try again later.'); return; }
  modal('<h2>Test version</h2><p class="sub">This web test version cannot take money. Unlock <b>' + esc(PRODUCTS[id][0]) + '</b> for free so you can try it?</p><p class="sub">In the app, this button opens the App Store or Google Play.</p>' +
    '<div class="grid1"><button class="pri" data-act="testbuy" data-v="' + id + '">Unlock for testing</button><button data-act="resume">Cancel</button></div>');
}
function bought(id) {
  log('bought', { id: id });
  var a = SHOP.after; SHOP.after = null;
  toast('Thank you! ' + PRODUCTS[id][0] + ' is yours.');
  if (a && a.mode && !levelLocked(a.mode, a.n)) return startLevel(a.n, { mode: a.mode });
  if (a && a.pack && hasPack(a.pack)) { P.theme.pack = a.pack; P.theme.hol = 'none'; saveP(); applyTheme(); return themes(); }
  if (a && a.k) { var it = TH[a.k].items.filter(function (x) { return x[0] === a.v; })[0]; if (it && hasTheme(a.k, it)) { P.theme[a.k] = a.v; saveP(); applyTheme(); } return themes(); }
  menu();
}
function restorePurchases() {
  log('restore_tap');
  if (window.ABStore) {
    toast('Checking your purchases…');
    window.ABStore.restore().then(function (ids) { setOwned(ids, true); themeCheck(); applyTheme(); restored(); }).catch(function () { toast('Could not reach the store. Check your internet and try again.'); });
    return;
  }
  if (NATIVE) { toast('Could not reach the store. Check your internet and try again.'); return; }
  restored();
}
function restored() {
  var ids = Object.keys(P.own || {});
  modal('<h2>Restore purchases</h2><p class="sub">' + (ids.length ? 'All set. You own: <b>' + ids.map(function (i) { return esc(PRODUCTS[i][0]); }).join(', ') + '</b>.' : 'No purchases were found' + (NATIVE ? ' for this store account.' : ' in this test version.')) + '</p>' +
    '<p class="sub">Your purchases come back on any phone signed in to the same Apple ID or Google account. You never pay twice.</p><div class="row"><button class="pri" data-act="menu">OK</button></div>');
}
function buyBtn(id, title, note, pri) {
  return '<button class="buyb' + (pri ? ' pri' : '') + '" data-act="buy" data-v="' + id + '"><b>' + esc(title) + ' · ' + esc(price(id)) + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</button>';
}
var RESTLNK = '<button class="lnk" data-act="restore">Restore purchases</button>';
function lockModes(m, n) {
  log('lock_modes', { n: n });
  SHOP.after = { mode: m, n: n };
  var paid = MORDER.filter(function (x) { return !FREEMODES[x]; }).length;
  modal('<div class="mt lockic">' + MICON[m] + '</div><h2>Keep going in ' + MODES[m].name + '?</h2>' +
    '<p class="sub">You have reached the end of the ' + FREELEVELS + ' free levels. One purchase unlocks levels ' + (FREELEVELS + 1) + ' to 100 in <b>every</b> mode, for good.</p><div class="grid1">' +
    buyBtn('all_modes', 'All Modes', paid + ' modes, ' + paid * (100 - FREELEVELS) + ' more puzzles', 1) +
    (hasAdFree() ? '' : buyBtn('bundle', 'Ad-free + All Modes', 'Best value: every level and no ads')) +
    '<button data-act="modes">Not now: play another mode</button>' + RESTLNK + '</div>');
}
function lockPack(p) {
  log('lock_pack', { v: p.id });
  SHOP.after = { pack: p.id };
  modal('<div class="pkbig" style="background-image:url(packs/' + p.id + '.webp)"></div><h2>' + esc(p.name) + '</h2><p class="sub">🔊 ' + esc(p.blurb) + '. A painted scene, matching cards and moving details.</p><div class="grid1">' +
    buyBtn('theme_' + p.id, 'Get ' + p.name, '', 1) + buyBtn('themes_all', 'Every Theme', 'All four paid packs, plus every background, color, card and season') +
    '<button data-act="themes">Not now</button>' + RESTLNK + '</div>');
}
function lockTheme(k, it) {
  log('lock_theme', { k: k, v: it[0] });
  SHOP.after = { k: k, v: it[0] };
  modal('<h2>' + esc(it[1]) + '</h2><p class="sub">Every background, color, card style and season, plus the four paid theme packs (Beach Day, Cozy Cabin, Rainy Day, Starry Night), with one purchase.</p><div class="grid1">' +
    buyBtn('themes_all', 'Every Theme', '', 1) + '<button data-act="themes">Not now</button>' + RESTLNK + '</div>');
}
function removeAds() {
  log('removeads_tap');
  modal('<h2>Remove ads</h2><p class="sub">Ads only show between puzzles, never in the middle of one. Remove them for good with one purchase.</p><div class="grid1">' +
    buyBtn('remove_ads', 'Remove Ads', '', 1) + (hasModes() ? '' : buyBtn('bundle', 'Ad-free + All Modes', 'Also unlocks every level in every mode')) +
    '<button data-act="menu">Not now</button>' + RESTLNK + '</div>');
}
// ambient sound for a pack (looping, quiet, starts after your first tap because phones block sound before that)
var SND = { want: '', a: null, cur: '', vol: 0.35 };
function soundSync() {
  if (SND.a && SND.cur !== SND.want) { var old = SND.a; SND.a = null; SND.cur = ''; var v = old.volume, iv = setInterval(function () { v = Math.max(0, v - 0.05); old.volume = v; if (v <= 0) { clearInterval(iv); old.pause(); } }, 50); }
  if (SND.want && !SND.a) {
    var a = new Audio(SND.want); a.loop = true; a.volume = 0; SND.a = a; SND.cur = SND.want;
    var pr = a.play(); if (pr && pr.catch) pr.catch(function () { });
    var vv = 0, iv2 = setInterval(function () { vv = Math.min(SND.vol, vv + 0.03); a.volume = vv; if (vv >= SND.vol) clearInterval(iv2); }, 60);
  }
}
function soundSet(path) { SND.want = (P.packSound !== false && path) ? path : ''; soundSync(); }
function soundResume() { if (SND.a && SND.a.paused && SND.want && !document.hidden) { var pr = SND.a.play(); if (pr && pr.catch) pr.catch(function () { }); } }
document.addEventListener('visibilitychange', function () { if (document.hidden) { if (SND.a) SND.a.pause(); } else soundResume(); });
var DARKBG = { night: 1 };
var DARKHOL = { july4: 1, halloween: 1, christmas: 1, newyear: 1 };
var HOLNAME = { christmas: 'Christmas', halloween: 'Halloween', thanksgiving: 'Thanksgiving', july4: 'the 4th of July', valentine: 'Valentine’s Day', stpat: 'St. Patrick’s Day', easter: 'Easter', newyear: 'New Year’s' };
function easterDate(y) { var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
function holidayNow(d) {
  d = d || new Date(); var y = d.getFullYear(), t = new Date(y, d.getMonth(), d.getDate()).getTime(), DAY = 864e5;
  function inRange(m1, d1, m2, d2) { return t >= new Date(y, m1 - 1, d1).getTime() && t <= new Date(y, m2 - 1, d2).getTime(); }
  if (inRange(12, 28, 12, 31) || inRange(1, 1, 1, 2)) return 'newyear';
  if (inRange(12, 1, 12, 26)) return 'christmas';
  if (inRange(10, 17, 10, 31)) return 'halloween';
  var tg = new Date(y, 10, 1); while (tg.getDay() !== 4) tg.setDate(tg.getDate() + 1); tg = new Date(y, 10, tg.getDate() + 21);
  if (t >= tg.getTime() - 9 * DAY && t <= tg.getTime() + DAY) return 'thanksgiving';
  if (inRange(6, 27, 7, 5)) return 'july4';
  var ea = easterDate(y).getTime(); if (t >= ea - 8 * DAY && t <= ea) return 'easter';
  if (inRange(3, 10, 3, 17)) return 'stpat';
  if (inRange(2, 6, 2, 14)) return 'valentine';
  return 'none';
}
function activeHoliday() {
  var t = P.theme || {};
  if (t.hol && t.hol !== 'none') return t.hol;
  var custom = (t.bg && t.bg !== 'auto') || (t.color && t.color !== 'auto') || (t.season && t.season !== 'none') || (t.pack && t.pack !== 'none');
  return (t.auto !== false && !custom) ? holidayNow() : 'none';
}
function applyTheme() {
  var t = P.theme || {}, b = document.body, hol = activeHoliday();
  function at(k, v, off) { if (!v || v === off) b.removeAttribute(k); else b.setAttribute(k, v); }
  at('data-card', t.card, 'classic'); b.removeAttribute('data-pack');
  if (hol !== 'none') {
    b.setAttribute('data-hol', hol); b.removeAttribute('data-bg'); b.removeAttribute('data-color');
    if (DARKHOL[hol]) b.setAttribute('data-tone', 'dark'); else b.setAttribute('data-tone', 'light');
    fxStart(hol); soundSet('');
    var key = 'hol' + hol + new Date().getFullYear();
    if ((!t.hol || t.hol === 'none') && !P.seen[key]) { P.seen[key] = 1; saveP(); setTimeout(function () { toast('Happy ' + HOLNAME[hol] + '! A holiday theme is on. Change it any time in Themes.'); }, 900); }
    return;
  }
  b.removeAttribute('data-hol');
  var pk = packOf(t.pack);
  if (pk) {
    b.setAttribute('data-pack', pk.id); b.removeAttribute('data-bg'); b.removeAttribute('data-color'); b.setAttribute('data-card', pk.card); b.setAttribute('data-tone', pk.tone);
    fxStart(pk.fx); soundSet(pk.snd); return;
  }
  b.removeAttribute('data-pack'); soundSet('');
  at('data-bg', t.bg, 'auto'); at('data-color', t.color, 'auto');
  if (DARKBG[t.bg]) b.setAttribute('data-tone', 'dark'); else if (t.bg && t.bg !== 'auto') b.setAttribute('data-tone', 'light'); else b.removeAttribute('data-tone');
  fxStart(t.season || 'none');
}

// ----- moving decorations (one small canvas behind the game; stops when the phone asks for less motion) -----
var FX = { id: 'none', raf: 0, parts: [], bursts: [], bats: [] };
var FXL = { spring: [['petal', 24]], summer: [['firefly', 26]], fall: [['leaf', 22]], winter: [['snow', 44]], christmas: [['snow', 34], ['lights', 0]], valentine: [['heart', 22]], stpat: [['clover', 24]],
  easter: [['egg', 14], ['petal', 10]], july4: [['fireworks', 0]], halloween: [['bat', 6], ['ember', 18]], thanksgiving: [['leaf', 26]], newyear: [['confetti', 46], ['fireworks', 0]],
  packblossom: [['petal', 28]], packharvest: [['leaf', 22]], packbeach: [['star', 30, '#fff2c0']], packcabin: [['ember', 18]], packrainy: [['rain', 80]], packstarry: [['star', 56, '#ffffff']] };
function fxStop() { cancelAnimationFrame(FX.raf); FX.raf = 0; var c = $('fx'); if (c) { var g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); } }
function heartPath(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * 0.35); g.bezierCurveTo(x - s * 1.2, y - s * 0.4, x - s * 0.55, y - s * 1.1, x, y - s * 0.45); g.bezierCurveTo(x + s * 0.55, y - s * 1.1, x + s * 1.2, y - s * 0.4, x, y + s * 0.35); g.fill(); }
function fxStart(id) {
  fxStop(); FX.id = id; FX.parts = []; FX.bursts = []; FX.bats = [];
  var c = $('fx'); if (!c || id === 'none' || !FXL[id] || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var g = c.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = window.innerWidth, H = window.innerHeight;
  c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  var layers = FXL[id], hasFw = false, hasLights = false, PAL = ['#ff4d4d', '#ffffff', '#4da6ff', '#ffd23f', '#ff7ac8'];
  function mk(type, init, col) {
    var p = { type: type, x: Math.random() * W, y: init ? Math.random() * H : -24, r: 2 + Math.random() * 3, vx: (Math.random() - 0.5) * 18, vy: 20 + Math.random() * 28, ph: Math.random() * 6.28, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 2.2 };
    if (type === 'firefly' || type === 'ember') { p.y = Math.random() * H; p.vy = type === 'ember' ? -(10 + Math.random() * 18) : (Math.random() - 0.5) * 16; p.vx = (Math.random() - 0.5) * 16; p.r = 2 + Math.random() * 2.5; p.col = type === 'ember' ? '255,150,50' : '255,214,90'; }
    if (type === 'leaf') { p.col = ['#d9822b', '#c0471f', '#e0a030', '#8c4a1f'][Math.floor(Math.random() * 4)]; p.r = 6 + Math.random() * 4; p.vy = 24 + Math.random() * 26; }
    if (type === 'petal') { p.col = Math.random() < 0.6 ? '#ffb7cf' : '#fff0f5'; p.r = 4 + Math.random() * 3; p.vy = 16 + Math.random() * 20; }
    if (type === 'snow') { p.r = 1.6 + Math.random() * 2.6; p.vy = 18 + Math.random() * 26; }
    if (type === 'heart') { p.col = ['#ff5c8a', '#ff8fb1', '#ffffff', '#ff3d71'][Math.floor(Math.random() * 4)]; p.r = 5 + Math.random() * 6; p.vy = -(14 + Math.random() * 22); p.y = init ? Math.random() * H : H + 20; }
    if (type === 'clover') { p.coin = Math.random() < 0.3; p.r = 5 + Math.random() * 4; p.vy = 18 + Math.random() * 22; }
    if (type === 'egg') { p.col = ['#ffd6e7', '#d6ecff', '#fff3b0', '#d9f5d6', '#e6d9ff'][Math.floor(Math.random() * 5)]; p.r = 8 + Math.random() * 5; p.vy = 14 + Math.random() * 16; }
    if (type === 'rain') { p.vx = -70; p.vy = 480 + Math.random() * 240; p.y = init ? Math.random() * H : -30; p.r = 10 + Math.random() * 10; }
    if (type === 'star') { p.vx = 0; p.vy = 0; p.y = Math.random() * H; p.r = 0.8 + Math.random() * 1.8; p.vr = 0.8 + Math.random() * 2.2; p.col = col || '#ffffff'; }
    if (type === 'confetti') { p.col = ['#f5c542', '#ffe08a', '#ffffff', '#c9c9d6', '#ff7ac8', '#7ad7ff'][Math.floor(Math.random() * 6)]; p.vy = 30 + Math.random() * 40; p.vr = (Math.random() - 0.5) * 8; }
    return p;
  }
  layers.forEach(function (L) {
    if (L[0] === 'fireworks') hasFw = true; else if (L[0] === 'lights') hasLights = true;
    else if (L[0] === 'bat') { for (var i = 0; i < L[1]; i++) FX.bats.push({ x: Math.random() * W, y: H * (0.04 + Math.random() * 0.5), vx: (Math.random() < 0.5 ? -1 : 1) * (25 + Math.random() * 30), s: 9 + Math.random() * 7, ph: Math.random() * 6.28 }); }
    else for (var j = 0; j < L[1]; j++) FX.parts.push(mk(L[0], true, L[2]));
  });
  var last = 0, tt = 0, nextBurst = 0, lc = ['#ff4d4d', '#3ddc84', '#ffd23f', '#4da6ff'];
  function burst() {
    var col = id === 'newyear' ? ['#f5c542', '#ffe08a', '#ffffff'] : PAL, cx = W * (0.15 + Math.random() * 0.7), cy = H * (0.1 + Math.random() * 0.35), parts = [], base = col[Math.floor(Math.random() * col.length)];
    for (var i = 0; i < 30; i++) { var a = (i / 30) * 6.28 + Math.random() * 0.2, sp = 60 + Math.random() * 70; parts.push({ vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: Math.random() < 0.7 ? base : col[Math.floor(Math.random() * col.length)] }); }
    FX.bursts.push({ x: cx, y: cy, t: 0, parts: parts });
  }
  function frame(t) {
    FX.raf = requestAnimationFrame(frame);
    if (t - last < 32) return; var dt = Math.min(0.06, (t - last) / 1000); last = t; tt += dt;
    g.clearRect(0, 0, W, H);
    FX.parts.forEach(function (p) {
      if (p.type === 'star') { p.ph += dt * p.vr; var sa = 0.15 + 0.85 * Math.abs(Math.sin(p.ph)); g.globalAlpha = sa; g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.28); g.fill(); if (p.r > 1.9) { g.fillRect(p.x - p.r * 2.2, p.y - 0.4, p.r * 4.4, 0.8); g.fillRect(p.x - 0.4, p.y - p.r * 2.2, 0.8, p.r * 4.4); } g.globalAlpha = 1; return; }
      if (p.type === 'rain') { p.x += p.vx * dt; p.y += p.vy * dt; g.strokeStyle = 'rgba(205,222,255,.45)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + p.vx * 0.022, p.y + p.vy * 0.022); g.stroke(); if (p.y > H + 20 || p.x < -20) { p.x = Math.random() * (W + 80); p.y = -20; } return; }
      p.ph += dt * 1.6; p.x += (p.vx + Math.sin(p.ph) * 14) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      var ty = p.type;
      if (ty === 'firefly' || ty === 'ember') {
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10; if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        var a = 0.35 + 0.4 * Math.sin(p.ph * 1.7), gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        gr.addColorStop(0, 'rgba(' + p.col + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + p.col + ',0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r * 4, 0, 6.28); g.fill(); return;
      }
      if (ty === 'snow') { g.fillStyle = 'rgba(255,255,255,.92)'; g.strokeStyle = 'rgba(110,140,185,.35)'; g.lineWidth = 0.7; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.28); g.fill(); g.stroke(); }
      else if (ty === 'petal') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.col; g.globalAlpha = 0.9; g.beginPath(); g.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.28); g.fill(); g.restore(); }
      else if (ty === 'leaf') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.col; g.globalAlpha = 0.92; g.beginPath(); g.moveTo(0, -p.r); g.quadraticCurveTo(p.r, 0, 0, p.r); g.quadraticCurveTo(-p.r, 0, 0, -p.r); g.fill(); g.strokeStyle = 'rgba(80,40,10,.45)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, -p.r); g.lineTo(0, p.r); g.stroke(); g.restore(); }
      else if (ty === 'heart') { g.save(); g.translate(p.x, p.y); g.rotate(Math.sin(p.ph) * 0.35); g.fillStyle = p.col; g.globalAlpha = 0.85; heartPath(g, 0, 0, p.r); g.restore(); }
      else if (ty === 'clover') {
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
        if (p.coin) { g.fillStyle = '#f5c542'; g.strokeStyle = '#c9961b'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, p.r * 0.8, 0, 6.28); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(-p.r * 0.25, -p.r * 0.25, p.r * 0.25, 0, 6.28); g.fill(); }
        else { g.fillStyle = '#2f9e5b'; g.globalAlpha = 0.92; var q = p.r * 0.5; [[-q, -q], [q, -q], [-q, q], [q, q]].forEach(function (o) { g.beginPath(); g.arc(o[0], o[1], q * 1.05, 0, 6.28); g.fill(); }); g.strokeStyle = '#1f7a45'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(q * 0.8, q * 2.2); g.stroke(); }
        g.restore();
      }
      else if (ty === 'egg') { g.save(); g.translate(p.x, p.y); g.rotate(Math.sin(p.ph) * 0.4); g.fillStyle = p.col; g.globalAlpha = 0.92; g.beginPath(); g.ellipse(0, 0, p.r * 0.72, p.r, 0, 0, 6.28); g.fill(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-p.r * 0.7, -p.r * 0.1); g.lineTo(-p.r * 0.3, p.r * 0.1); g.lineTo(0, -p.r * 0.1); g.lineTo(p.r * 0.3, p.r * 0.1); g.lineTo(p.r * 0.7, -p.r * 0.1); g.stroke(); g.restore(); }
      else if (ty === 'confetti') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.col; g.globalAlpha = 0.9; g.fillRect(-4, -2, 8, 4); g.restore(); }
      var up = (ty === 'heart');
      if ((!up && p.y > H + 24) || (up && p.y < -24) || p.x < -30 || p.x > W + 30) { var q2 = mk(ty, false); p.x = q2.x; p.y = up ? H + 20 : -20; }
    });
    FX.bats.forEach(function (b) {
      b.ph += dt * 9; b.x += b.vx * dt; b.y += Math.sin(b.ph * 0.2) * 12 * dt;
      if (b.x < -40) b.x = W + 40; if (b.x > W + 40) b.x = -40;
      var fl = Math.sin(b.ph), s = b.s; g.save(); g.translate(b.x, b.y); if (b.vx < 0) g.scale(-1, 1);
      g.fillStyle = '#150a20'; g.strokeStyle = 'rgba(255,140,40,.6)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.6, -s * (0.9 + fl * 0.5), s * 1.5, -s * 0.2 * fl); g.quadraticCurveTo(s * 1.0, s * 0.1, s * 0.5, s * 0.25); g.lineTo(0, s * 0.45); g.lineTo(-s * 0.5, s * 0.25); g.quadraticCurveTo(-s * 1.0, s * 0.1, -s * 1.5, -s * 0.2 * fl); g.quadraticCurveTo(-s * 0.6, -s * (0.9 + fl * 0.5), 0, 0); g.fill(); g.stroke(); g.restore();
    });
    if (hasFw) {
      g.globalCompositeOperation = 'lighter';
      nextBurst -= dt; if (nextBurst <= 0) { burst(); nextBurst = 0.9 + Math.random() * 1.1; }
      FX.bursts = FX.bursts.filter(function (B) {
        B.t += dt; if (B.t > 1.6) return false;
        var al = Math.max(0, 1 - B.t / 1.6);
        B.parts.forEach(function (q) { var x = B.x + q.vx * B.t, y = B.y + q.vy * B.t + 55 * B.t * B.t; g.fillStyle = q.c; g.globalAlpha = al; g.beginPath(); g.arc(x, y, 2 * (0.4 + al), 0, 6.28); g.fill(); });
        g.globalAlpha = 1; return true;
      });
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }
    if (hasLights) {
      g.strokeStyle = 'rgba(40,40,40,.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-5, 4);
      var n = Math.ceil(W / 40) + 1;
      for (var k = 0; k <= n; k++) { var x = k * 40; g.quadraticCurveTo(x - 20, 12 + (k % 2 ? 16 : 6), x, 4 + (k % 2 ? 10 : 2)); }
      g.stroke();
      for (var j = 0; j < n; j++) { var bx = j * 40 + 14, by = 14 + (j % 2 ? 12 : 4), al2 = 0.55 + 0.45 * Math.sin(tt * 3 + j * 1.3); g.fillStyle = lc[j % 4]; g.globalAlpha = al2; g.beginPath(); g.arc(bx, by, 5, 0, 6.28); g.fill(); g.globalAlpha = al2 * 0.35; g.beginPath(); g.arc(bx, by, 10, 0, 6.28); g.fill(); g.globalAlpha = 1; }
    }
  }
  FX.raf = requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', function () { if (document.hidden) cancelAnimationFrame(FX.raf); else if (FX.id !== 'none') fxStart(FX.id); });
var fxRz = 0; window.addEventListener('resize', function () { clearTimeout(fxRz); fxRz = setTimeout(function () { if (FX.id !== 'none') fxStart(FX.id); }, 250); });

function themeChip(k, it) {
  var sel = (P.theme[k] === it[0]);
  var sw = k === 'card' ? '<span class="tsw tcard" data-c="' + it[0] + '">Aa</span>' : (k === 'season' || k === 'hol') ? '<span class="tsw temo">' + it[3] + '</span>' : '<span class="tsw" style="background:' + it[3] + '"></span>';
  return '<button class="tchip' + (sel ? ' sel' : '') + '" data-act="theme" data-k="' + k + '" data-v="' + it[0] + '">' + sw + '<b>' + esc(it[1]) + '</b><small>' + (k === 'hol' && it[0] !== 'none' ? 'Seasonal' : it[2] ? 'Free' : hasTheme(k, it) ? 'Yours' : '🔒 Paid') + '</small></button>';
}
function themes() {
  var auto = P.theme.auto !== false, h = '<h2>Themes</h2><p class="sub">Make the game your own. Holiday looks switch on by themselves.</p>';
  h += '<div class="tsec"><h3>Theme packs</h3><p class="tnote">A painted scene, matching cards, moving details and calm sounds.</p><div class="pkgrid">' +
    '<button class="pk' + (P.theme.pack === 'none' ? ' sel' : '') + ' pknone" data-act="pack" data-v="none"><b>No pack</b></button>' +
    PACKS.map(function (p) { return '<button class="pk' + (P.theme.pack === p.id ? ' sel' : '') + '" data-act="pack" data-v="' + p.id + '" style="background-image:linear-gradient(transparent 35%,rgba(0,0,0,.62)),url(packs/' + p.id + '.webp)"><span class="pkt">' + (p.free ? 'Free' : hasPack(p.id) ? 'Yours' : '🔒 ' + esc(price('theme_' + p.id))) + '</span><b>' + esc(p.name) + '</b><small>\uD83D\uDD0A ' + esc(p.blurb) + '</small></button>'; }).join('') + '</div></div>';
  Object.keys(TH).forEach(function (k) {
    h += '<div class="tsec"><h3>' + TH[k].label + '</h3><div class="tgrid">' + TH[k].items.map(function (it) { return themeChip(k, it); }).join('') + '</div>' +
      (k === 'hol' ? '<button class="tauto" data-act="holauto">Switch on by itself during each holiday: <b>' + (auto ? 'On' : 'Off') + '</b></button>' : '') + '</div>';
  });
  modal(h + '<div class="row"><button class="pri" data-act="resume">Done</button><button data-act="themereset">Reset</button></div>');
}

// ---------- modals ----------
function modal(html) { var m = $('modal'); m.innerHTML = '<div class="sheet">' + html + '</div>'; m.classList.add('on'); }
function closeModal() { $('modal').classList.remove('on'); $('modal').innerHTML = ''; }
function totalDone() { var n = 0; MORDER.forEach(function (m) { n += Object.keys(P.sm[m]).length; }); return n; }

function showWin(stars, secs, done) {
  var names = S.lv.cats.map(function (c, i) { var p = PAL[i % PAL.length]; return '<span class="chip" style="background:linear-gradient(135deg,' + p[0] + ',' + p[1] + ')">' + esc(c) + '</span>'; }).join('');
  var fun = '';
  var ask = [5, 15, 30].filter(function (x) { return done >= x && P.funAsked.indexOf(x) < 0; })[0];
  if (ask && !S.daily && !NATIVE) {
    fun = '<div class="fun"><p>Be honest: is this game fun?</p><div class="row"><button data-act="fun" data-v="yes">Yes</button><button data-act="fun" data-v="ok">It\'s OK</button><button data-act="fun" data-v="no">Not really</button></div></div>';
    P.funAsked.push(ask); saveP();
  }
  var sv = [1, 2, 3].map(function (i) { return STAR.replace('<svg', '<svg' + (i > stars ? ' class="off"' : '')); }).join('');
  modal('<h2>' + (P.zen ? 'Solved!' : stars === 3 ? 'Wonderful!' : stars === 2 ? 'Well done!' : 'Solved!') + '</h2>' + (P.zen ? '' : '<div class="stars-big">' + sv + '</div>') +
    '<p class="sub">' + (P.zen ? 'Zen mode: no score, just enjoy · ' : S.misses + ' miss' + (S.misses === 1 ? '' : 'es') + ' · ') + secs + ' sec</p><div class="chips">' + names + '</div>' + fun +
    '<div class="row"><button class="pri" data-act="' + (S.daily ? 'menu' : 'next') + '">' + (S.daily ? 'Done' : 'Next level') + '</button>' +
    '<button data-act="share">Share result</button></div><div class="row"><button data-act="replay">Play again</button></div>');
}
var MICON = {
  flowers: '<span class="mi fl"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.6"/><path d="M12 9.4C12 6 14 4 12 3c-2 1-0 3-0 6.4M14.6 12c3.4 0 5.4-2 6.4 0-1 2-3 0-6.4 0M12 14.6c0 3.4-2 5.4 0 6.4 2-1 0-3 0-6.4M9.4 12C6 12 4 14 3 12c1-2 3 0 6.4 0"/></svg></span>',
  birds: '<span class="mi bi"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c2-4 6-5 9-3 3-2 7-1 9 3-3 0-4 1-5 2-1 1-1 3 1 5-3 0-5-1-6-3-3 1-6 0-8-4z"/></svg></span>',
  places: '<span class="mi pl"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M9 7h6l1 14H8L9 7zM6 21h12"/></svg></span>',
  foods: '<span class="mi f"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16a8 8 0 01-16 0z"/><path d="M8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3M16 7c0-1.5 1-1.5 1-3"/></svg></span>',
  states: '<span class="mi s"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h8l1 2h5v6l-3 2v4h-4l-2-3H7l-2-3z"/></svg></span>',
  mixed: '<span class="mi x"></span>',
  nums: '<span class="mi n">123</span>',
  decades: '<span class="mi d">70s</span>',
  wordplay: '<span class="mi r">A–Z</span>',
  bible: '<span class="mi b"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4z"/><path d="M12 8v6M9.5 10.5h5"/></svg></span>',
  words: '<span class="mi w">Aa</span>',
  colors: '<span class="mi c"></span>',
  pics: '<span class="mi p"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3.5"/><circle cx="9" cy="10" r="2"/><path d="M3 17l5-5 4 4 3-3 6 6"/></svg></span>'
};
function menu() {
  var st = P.streak, today = dstr(), dm = dailyMode(), cm = S ? S.mode : P.mode;
  var dailyDone = P.daily.date === today;
  var streak = (st.last === today || st.last === dstr(new Date(Date.now() - 864e5))) ? st.count : 0;
  modal('<h2>Alikeberry</h2><div class="grid1">' +
    '<button class="pri" data-act="resume">Back to the game</button>' +
    '<button class="mt" data-act="modes">' + MICON[cm] + '<span><b>Game mode</b><small>Playing: ' + MODES[cm].name + ' · tap to change</small></span></button>' +
    '<button class="mt" data-act="daily"><span class="mi w" style="background:linear-gradient(145deg,#f6b73c,#ff8a4a)">' + (dailyDone ? '✓' : '★') + '</span><span><b>Daily deck: ' + MODES[dm].name + '</b><small>' + (dailyDone ? 'Done today! ' : 'New puzzle every day · ') + 'Streak ' + streak + ' day' + (streak === 1 ? '' : 's') + '</small></span></button>' +
    '<button class="mt" data-act="style"><span class="mi w" style="background:linear-gradient(145deg,#6c7ae0,#8c9bff);font-size:18px">' + (P.style === 'grid' ? '▦' : '☰') + '</span><span><b>Play style</b><small>' + (P.style === 'grid' ? 'Four Groups grid' : 'Solitaire columns') + ' · tap to switch</small></span></button>' +
    '<button class="mt" data-act="themes"><span class="mi w" style="background:linear-gradient(135deg,#ff6b4a,#f6b73c 35%,#2bc5a8 65%,#5b6cf0)"></span><span><b>Themes</b><small>Backgrounds, colors, cards, seasons</small></span></button>' +
    '<button data-act="levels">All levels</button>' +
    '<button data-act="how">How to play</button>' +
    '<button data-act="settings">Settings</button>' +
    '<button data-act="stats">My stats</button>' +
    (hasAdFree() ? '' : '<button data-act="remove">Remove ads · ' + esc(price('remove_ads')) + '</button>') +
    '<button data-act="restore">Restore purchases</button></div>');
}
function modes() {
  var h = '<h2>Choose a mode</h2><div class="grid1">', cm = S ? S.mode : P.mode;
  visibleModes().forEach(function (m) {
    var n = Object.keys(P.sm[m]).length;
    h += '<button class="mt' + (m === cm ? ' sel' : '') + '" data-act="mode" data-m="' + m + '">' + MICON[m] + '<span style="flex:1"><b>' + MODES[m].name + '</b><small>' + MODES[m].blurb + '</small><span class="bar2"><i style="width:' + Math.min(100, n) + '%"></i></span><small>' + n + ' of 100 levels done' + (FREEMODES[m] ? ' · free' : hasModes() ? '' : ' · ' + FREELEVELS + ' free') + '</small></span></button>';
  });
  modal(h + '<button data-act="menu">Back</button></div>');
}
function levels() {
  var m = S ? S.mode : P.mode;
  var h = '<h2>' + MODES[m].name + ' levels</h2><div class="lgrid">';
  for (var n = 1; n <= 100; n++) {
    var s = P.sm[m][n] || 0;
    h += '<button class="lv' + (n === (S && !S.daily ? S.lv.n : -1) ? ' cur' : '') + '" data-act="go" data-n="' + n + '">' + n + '<i>' + (s ? '★'.repeat(s) : levelLocked(m, n) ? '🔒' : '·') + '</i></button>';
  }
  modal(h + '</div><div class="row"><button data-act="menu">Back</button></div>');
}
function how() {
  modal('<h2>How to play</h2><ol class="how"><li>The cards belong to <b>groups</b>. The group names for each level are listed at the top (like Fruits, or Blues).</li>' +
    '<li>You can only use the <b>bottom card</b> of each column. Tap it, then tap a box at the top.</li>' +
    '<li>An empty box takes any card. After that, only cards from the <b>same group</b> fit. A wrong try is a <b>miss</b>.</li>' +
    '<li>Fill a box to reveal its name and clear the cards.</li>' +
    '<li>Tap a column instead to <b>park</b> a card there and uncover the ones under it.</li>' +
    '<li>Undo is free and unlimited. Some cards fit <b>two groups</b>, so count carefully!</li></ol>' +
    '<div class="row"><button class="pri" data-act="resume">Got it</button></div>');
}
function welcome() {
  modal('<h2>Welcome to Alikeberry</h2><p class="sub" style="font-size:18px">Sort the cards into the groups listed at the top. I will show you how in the first level, one step at a time.</p><div class="row"><button class="pri" data-act="resume">Start</button></div>');
}
function settings() {
  modal('<h2>Settings</h2><div class="grid1"><button data-act="fs">Text size: ' + ['Medium', 'Large', 'Extra large'][[1, 1.15, 1.3].indexOf(P.fs)] + '</button>' +
    '<button data-act="snd">Sound: ' + (P.sound ? 'On' : 'Off') + '</button>' +
    '<button data-act="groups">Group names: ' + (showGroups() ? 'Shown' : 'Hidden (harder)') + '</button>' +
    '<button data-act="hidebible">Bible mode: ' + (P.hideBible ? 'Hidden' : 'Shown') + '</button>' +
    '<button data-act="packsnd">Theme sounds: ' + (P.packSound !== false ? 'On' : 'Off') + '</button>' +
    '<button data-act="zen">Zen mode: ' + (P.zen ? 'On (no stars or miss count)' : 'Off') + '</button>' +
    '<button data-act="restart">Restart this level</button>' +
    '<button data-act="tipson">Show first-level tips again</button>' +
    '<button data-act="reset">Erase my progress</button><button data-act="menu">Back</button></div>');
}
function stats() {
  var ev = ST.ev, doneAll = ev.filter(function (e) { return e.e === 'level_done'; });
  var days = {}; ev.forEach(function (e) { days[new Date(e.t).toDateString()] = 1; });
  function cnt(x) { return ev.filter(function (e) { return e.e === x; }).length; }
  var fun = ev.filter(function (e) { return e.e === 'fun'; }).map(function (e) { return e.v + (e.m ? '(' + e.m + ')' : ''); });
  var avgM = doneAll.length ? (doneAll.reduce(function (a, e) { return a + e.misses; }, 0) / doneAll.length).toFixed(1) : '0';
  var avgS = doneAll.length ? Math.round(doneAll.reduce(function (a, e) { return a + e.secs; }, 0) / doneAll.length) : 0;
  var per = MORDER.map(function (m) { return [m, doneAll.filter(function (e) { return (e.m || 'words') === m; }).length]; });
  var best = per.slice().sort(function (x, y) { return y[1] - x[1]; })[0];
  var tried = ev.filter(function (e) { return e.e === 'theme_try'; });
  var rep = 'ALIKEBERRY STATS\nPuzzles solved: ' + doneAll.length + '  [' + per.map(function (p) { return MODES[p[0]].name + ' ' + p[1]; }).join(', ') + ']\nDaily decks finished: ' + doneAll.filter(function (e) { return e.daily; }).length +
    '\nDays played: ' + Object.keys(days).length + '\nAverage misses per puzzle: ' + avgM + '\nAverage seconds per puzzle: ' + avgS + '\nHints used: ' + cnt('hint') + '\nUndos: ' + cnt('undo') +
    '\nTapped "More hints / watch an ad": ' + cnt('adhint_tap') + '\nTapped "Remove ads": ' + cnt('removeads_tap') + '\nFun answers: ' + (fun.join(', ') || 'none') +
    '\nHighest level (per mode): ' + MORDER.map(function (m) { return Math.max.apply(null, [0].concat(Object.keys(P.sm[m]).map(Number))); }).join(' / ') +
    '\nStreak: ' + P.streak.count + '\nMode switches: ' + cnt('mode_switch') + '\nThemes tried: ' + tried.length + ' (' + tried.filter(function (e) { return e.paid; }).map(function (e) { return e.k + ':' + e.v; }).join(', ') + ')\nShares: ' + cnt('share');
  function tile(big, small) { return '<div class="stile"><b>' + big + '</b><span>' + small + '</span></div>'; }
  var mx = Math.max(1, best[1]);
  var bars = per.filter(function (p) { return p[1] > 0; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 5).map(function (p) { return '<div class="sbar"><span>' + MODES[p[0]].name + '</span><i><u style="width:' + Math.round(100 * p[1] / mx) + '%"></u></i><em>' + p[1] + '</em></div>'; }).join('');
  modal('<h2>My stats</h2><div class="stg">' + tile(doneAll.length, 'Puzzles solved') + tile(Object.keys(days).length, 'Days played') + tile(avgM, 'Misses per puzzle') + tile(avgS + 's', 'Average time') +
    tile(P.streak.count, 'Daily streak') + tile(cnt('hint'), 'Hints used') + '</div>' + (bars ? '<div class="sbars"><h3>Your top modes</h3>' + bars + '</div>' : '') +
    (NATIVE ? '<div class="row"><button class="pri" data-act="menu">Back</button></div>' : '<textarea id="rep" class="hid" readonly>' + esc(rep) + '</textarea><div class="row"><button class="pri" data-act="copy">Copy my stats</button><button data-act="menu">Back</button></div>'));
}

// ---------- sound ----------
var ac = null;
function unlock() { soundResume(); try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { } }
function tone(f, d, t0, type, v) { if (!ac || !P.sound) return; var o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.value = f; var t = ac.currentTime + (t0 || 0); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.02); }
function sfx(k) {
  if (!P.sound) return;
  if (k === 'tick') tone(520, 0.06, 0, 'triangle', 0.07);
  else if (k === 'ok') { tone(660, 0.1, 0, 'sine'); tone(880, 0.12, 0.07, 'sine'); }
  else if (k === 'miss') tone(150, 0.22, 0, 'sawtooth', 0.08);
  else if (k === 'clear') [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.22, i * 0.08, 'sine', 0.13); });
  else if (k === 'win') [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.35, i * 0.11, 'sine', 0.14); });
}

// ---------- events ----------
// ---------- drag and drop (tap still works too) ----------
var drag = null, noClick = 0;
function dropTarget(x, y) {
  var el = document.elementFromPoint(x, y); if (!el) return null;
  var sl = el.closest('.slot'); if (sl && !sl.classList.contains('done')) return { type: 'slot', i: +sl.getAttribute('data-slot'), el: sl };
  var co = el.closest('.col'); if (co) return { type: 'col', i: +co.getAttribute('data-col'), el: co };
  return null;
}
function dragClean() {
  if (!drag) return;
  if (drag.ghost) drag.ghost.remove();
  document.querySelectorAll('.dragging').forEach(function (e) { e.classList.remove('dragging'); });
  document.querySelectorAll('.over').forEach(function (e) { e.classList.remove('over'); });
  document.body.classList.remove('is-dragging');
  drag = null;
}
document.addEventListener('pointerdown', function (e) {
  if (!S || S.won || (e.button !== undefined && e.button > 0) || $('modal').classList.contains('on')) return;
  var cd = e.target.closest('.card.play'), sw = !cd && e.target.closest('.slot .sw[data-top]');
  if (!cd && !sw) return;
  var d = { x0: e.clientX, y0: e.clientY, started: false, ghost: null };
  if (cd) { d.from = 'col'; d.i = +cd.parentNode.getAttribute('data-col'); d.el = cd; }
  else { var sl = sw.closest('.slot'); if (sl.classList.contains('done')) return; d.from = 'slot'; d.i = +sl.getAttribute('data-slot'); d.el = sw; }
  var arr = d.from === 'col' ? S.cols[d.i] : S.slots[d.i].ids; if (!arr.length) return;
  d.id = arr[arr.length - 1];
  drag = d;
});
document.addEventListener('pointermove', function (e) {
  if (!drag) return;
  if (!drag.started) {
    if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) < 9) return;
    drag.started = true; unlock();
    S.sel = null; S.hint = null;
    var colEl = document.querySelector('.col .card'), w = drag.from === 'col' ? drag.el.getBoundingClientRect().width : (colEl ? colEl.getBoundingClientRect().width : 86);
    var tmp = document.createElement('div'); tmp.innerHTML = cardEl(drag.id, 'play drag-ghost', w);
    var g = tmp.firstChild; g.style.width = w + 'px'; document.body.appendChild(g);
    drag.ghost = g; drag.w = w; drag.el.classList.add('dragging'); document.body.classList.add('is-dragging');
    sfx('tick');
  }
  e.preventDefault();
  var g2 = drag.ghost, h = g2.getBoundingClientRect().height;
  g2.style.left = (e.clientX - drag.w / 2) + 'px'; g2.style.top = (e.clientY - h * 0.6) + 'px';
  document.querySelectorAll('.over').forEach(function (x) { x.classList.remove('over'); });
  var t = dropTarget(e.clientX, e.clientY);
  if (t && !(t.type === 'col' && drag.from === 'col' && t.i === drag.i) && !(t.type === 'slot' && drag.from === 'slot' && t.i === drag.i)) t.el.classList.add('over');
}, { passive: false });
function dragEnd(e, cancel) {
  if (!drag) return;
  var d = drag, moved = d.started;
  var t = (moved && !cancel) ? dropTarget(e.clientX, e.clientY) : null;
  dragClean();
  if (!moved) return;
  noClick = Date.now();
  if (t && !(t.type === 'col' && d.from === 'col' && t.i === d.i) && !(t.type === 'slot' && d.from === 'slot' && t.i === d.i)) {
    S.sel = { from: d.from, i: d.i }; S.noFly = true;
    if (t.type === 'slot') tapSlot(t.i); else tapColumn(t.i);
    S.noFly = false;
  } else render();
}
document.addEventListener('pointerup', function (e) { dragEnd(e, false); });
document.addEventListener('pointercancel', function (e) { dragEnd(e, true); });
document.addEventListener('click', function (e) {
  if (Date.now() - noClick < 350) return;
  var t = e.target, b = t.closest('[data-act]');
  if (b) return act(b.getAttribute('data-act'), b);
  if (!S) return;
  if (S.style === 'grid') { var gc = t.closest('.card.gcard'); if (gc) gridTap(+gc.getAttribute('data-id')); return; }
  var cd = t.closest('.card.play'); if (cd) return tapCard('col', +cd.parentNode.getAttribute('data-col'));
  var sw = t.closest('.slot'); if (sw) return tapSlot(+sw.getAttribute('data-slot'));
  var col = t.closest('.col'); if (col) return tapColumn(+col.getAttribute('data-col'));
});
function restartCur() { startLevel(S.lv.n, S.daily ? { daily: true, seed: S.lv.seed, cfg: DCFG, mode: S.mode } : { mode: S.mode }); }
function act(a, el) {
  unlock();
  var n = el && +el.getAttribute('data-n');
  if (a === 'menu') menu();
  else if (a === 'resume') closeModal();
  else if (a === 'next') startLevel(S.lv.n + 1, { mode: S.mode });
  else if (a === 'replay') restartCur();
  else if (a === 'levels') levels();
  else if (a === 'go') startLevel(n, { mode: S.mode });
  else if (a === 'how') how();
  else if (a === 'settings') settings();
  else if (a === 'stats') stats();
  else if (a === 'modes') modes();
  else if (a === 'themes') themes();
  else if (a === 'pack') {
    var pv = el.getAttribute('data-v'), pk2 = packOf(pv);
    if (!hasPack(pv)) return lockPack(pk2);
    P.theme.pack = pv; if (pv !== 'none') P.theme.hol = 'none'; saveP(); applyTheme(); log('theme_try', { k: 'pack', v: pv, paid: pk2 && !pk2.free ? 1 : 0 });
    document.querySelectorAll('.pk').forEach(function (c) { c.classList.toggle('sel', c === el); });
  }
  else if (a === 'packsnd') { P.packSound = !P.packSound; saveP(); applyTheme(); settings(); }
  else if (a === 'theme') {
    var tk = el.getAttribute('data-k'), tv = el.getAttribute('data-v'), item = TH[tk].items.filter(function (x) { return x[0] === tv; })[0];
    if (!hasTheme(tk, item)) return lockTheme(tk, item);
    P.theme[tk] = tv; if (tk === 'hol' && tv === 'none') P.theme.auto = false; saveP(); applyTheme(); log('theme_try', { k: tk, v: tv, paid: item[2] ? 0 : 1 });
    document.querySelectorAll('.tchip[data-k="' + tk + '"]').forEach(function (c) { c.classList.toggle('sel', c === el); });
  }
  else if (a === 'themereset') { P.theme = { bg: 'auto', color: 'auto', card: 'classic', season: 'none', hol: 'none', auto: true, pack: 'none' }; saveP(); applyTheme(); themes(); }
  else if (a === 'holauto') { P.theme.auto = P.theme.auto === false; saveP(); applyTheme(); themes(); }
  else if (a === 'mode') { var m = el.getAttribute('data-m'); log('mode_switch', { to: m }); startLevel(P.curs[m] || 1, { mode: m }); }
  else if (a === 'daily') { var dm = dailyMode(); startLevel(45, { daily: true, seed: +dstr().replace(/-/g, ''), cfg: DCFG, mode: dm }); }
  else if (a === 'coachoff') { P.coachDone = true; saveP(); S.bye = 0; render(); }
  else if (a === 'tipson') { P.coachDone = false; saveP(); closeModal(); render(); }
  else if (a === 'fs') { P.fs = P.fs === 1 ? 1.15 : P.fs === 1.15 ? 1.3 : 1; saveP(); applyFs(); settings(); render(); }
  else if (a === 'snd') { P.sound = !P.sound; saveP(); settings(); }
  else if (a === 'hidebible') { P.hideBible = !P.hideBible; saveP(); if (P.hideBible && S && S.mode === 'bible') { startLevel(P.curs.words || 1, { mode: 'words' }); } settings(); }
  else if (a === 'groups') { P.showGroups = !showGroups(); saveP(); log('groups_switch', { on: P.showGroups ? 1 : 0 }); settings(); render(); }
  else if (a === 'zen') { P.zen = !P.zen; saveP(); settings(); render(); }
  else if (a === 'restart') { closeModal(); restartCur(); }
  else if (a === 'style') { P.style = P.style === 'grid' ? 'solitaire' : 'grid'; saveP(); log('style_switch', { to: P.style }); closeModal(); restartCur(); }
  else if (a === 'share') { shareResult(); }
  else if (a === 'reset') { if (confirm('Erase all progress on this phone? Your purchases stay.')) { var keep = P.own; P = defaults(); P.own = keep || {}; ST = { ev: [] }; saveP(); store('dw_stats', ST); store('dw_cur', null); startLevel(1); welcome(); } }
  else if (a === 'fun') { log('fun', { v: el.getAttribute('data-v') }); el.parentNode.parentNode.innerHTML = '<p>Thank you!</p>'; }
  else if (a === 'copy') { var r = $('rep'); r.select(); try { document.execCommand('copy'); toast('Copied'); } catch (x) { } }
  else if (a === 'restore') restorePurchases();
  else if (a === 'remove') removeAds();
  else if (a === 'buy') buy(el.getAttribute('data-v'));
  else if (a === 'testbuy') { var tb = el.getAttribute('data-v'); setOwned([tb]); bought(tb); }
}
$('bUndo').onclick = function () { if (S && S.style === 'grid') gridShuffle(); else undo(); };
$('bHint').onclick = function () {
  if (S && S.hints <= 0) { log('adhint_tap'); S.hints += 3; toast('Here are 3 more hints!'); render(); return; } // Phase 3: optional short video first, unless ad-free
  giveHint();
};
$('bMenu').onclick = function () { unlock(); menu(); };
$('bRestart').onclick = function () { if (!S || S.won) return; if (S.style === 'grid') gridSubmit(); else restartCur(); };
window.addEventListener('resize', render);
function applyFs() { document.documentElement.style.setProperty('--fs', P.fs); }
applyFs();
P.theme = Object.assign({ bg: 'auto', color: 'auto', card: 'classic', season: 'none', hol: 'none', auto: true, pack: 'none' }, P.theme || {}); if (P.packSound === undefined) P.packSound = true; if (P.theme.season === 'holiday') P.theme.season = 'none';
themeCheck(); applyTheme(); storeSync();

// ---------- start ----------
var cur = store('dw_cur');
try {
  if (cur && cur.cols && (cur.daily || !levelLocked(cur.mode || 'words', cur.n))) {
    var lv = makeLevel(cur.n, cur.seed, cur.daily ? DCFG : null, cur.mode || 'words');
    S = newState(lv, cur.daily); S.cols = cur.cols; S.slots = cur.slots; S.misses = cur.misses; S.moves = cur.moves; S.hints = cur.hints; S.t0 = cur.t0;
    S.style = cur.style || 'solitaire'; if (cur.gorder) { S.gsel = cur.gsel || []; S.gfound = cur.gfound || []; S.gorder = cur.gorder; } S.doneOrder = cur.doneOrder || [];
    render();
  } else startLevel(P.curs[P.mode] || 1, { mode: P.mode });
} catch (e) { store('dw_cur', null); P.mode = 'words'; startLevel(1); }
if (P.first) { P.first = false; saveP(); welcome(); }

window.DW = {
  makeLevel: makeLevel, cfg: cfg, state: function () { return S; }, MODES: MODES, start: startLevel, holidayNow: holidayNow, activeHoliday: activeHoliday, storeSync: storeSync, owns: owns, levelLocked: levelLocked, fxStart: fxStart, FX: FX,
  autoplay: function () {
    if (S.style === 'grid') { var gg = 0; while (!S.won && gg++ < 20) { var left = S.lv.cats.map(function (c, i) { return i; }).filter(function (i) { return !isFound(i); }); S.gsel = S.gorder.filter(function (id) { return S.lv.cards[id].cat === left[0]; }); gridSubmit(); } return S.won; }
    var guard = 0;
    while (!S.won && guard++ < 500) {
      var played = false, e = ends().filter(function (x) { return x.from === 'col'; });
      for (var k = 0; k < e.length && !played; k++) {
        var card = S.lv.cards[e[k].id], si = -1;
        S.slots.forEach(function (s, i) { if (!s.done && s.ids.length && s.cat === card.cat) si = i; });
        if (si < 0) S.slots.forEach(function (s, i) { if (si < 0 && !s.done && !s.ids.length) si = i; });
        if (si >= 0) { S.sel = { from: 'col', i: e[k].i }; tapSlot(si); played = true; }
      }
      if (!played) return false;
    }
    return S.won;
  }
};
})();
