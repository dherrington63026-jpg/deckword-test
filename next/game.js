// Deckword test version: group-sorting solitaire with three modes (Words, Colors, Pictures).
// No ads, no real purchases. Everything saves on this phone only.
(function () {
'use strict';
var MODES = {
  words:  { name: 'Words',    bank: window.BANK,  blurb: 'Sort words into hidden groups' },
  colors: { name: 'Colors',   bank: window.CBANK, blurb: 'Sort shades into color families' },
  pics:   { name: 'Pictures', bank: window.PBANK, blurb: 'Sort pictures into groups' }
};
MODES.nums = { name: 'Numbers', bank: window.NBANK, blurb: 'Sort numbers: even, prime, multiples...', kind: 'text' };
MODES.decades = { name: 'Remember When', bank: window.DBANK, blurb: 'Which decade did it arrive?', kind: 'text' };
MODES.wordplay = { name: 'Word Play', bank: window.WBANK, blurb: 'Rhymes, spelling and word parts', kind: 'text' };
MODES.bible = { name: 'Bible', bank: window.BIBANK, blurb: 'Books, people, places and stories', kind: 'text' };
MODES.words.kind = 'text';
var MORDER = ['words', 'colors', 'pics', 'nums', 'decades', 'wordplay', 'bible'];
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
function label(id) { var w = S.lv.cards[id].w; return w === 'icecream' ? 'Ice cream' : w === 'bubbletea' ? 'Bubble tea' : disp(w); }

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
  c.tier = (mode === 'nums' || mode === 'wordplay' || mode === 'bible') ? (n <= 10 ? 1 : n <= 25 ? 2 : 3) : 9;
  c.gap = mode === 'decades' ? (n <= 25 ? 2 : 1) : 0;
  return c;
}

function makeLevel(n, seed, over, mode) {
  mode = mode || 'words';
  var BK = MODES[mode].bank, PR = pairsFor(mode);
  var c = over || cfg(n, mode);
  var rng = mulberry32(seed);
  var tier = c.tier || 9, gap = c.gap || 0;
  function gapOK(idx, chosen) {
    if (!gap || BK[idx].pos === undefined) return true;
    for (var z = 0; z < chosen.length; z++) if (BK[chosen[z]].pos !== undefined && Math.abs(BK[chosen[z]].pos - BK[idx].pos) < gap) return false;
    return true;
  }
  for (var attempt = 0; attempt < 1200; attempt++) {
    var chosen = [], used = {}, tw = [];
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
      must.concat(pool.slice(0, c.per - must.length)).forEach(function (w3) { cards.push({ w: w3, cat: k2 }); });
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
function defaults() { var sm = {}, cu = {}; MORDER.forEach(function (m) { sm[m] = {}; cu[m] = 1; }); return { sm: sm, curs: cu, mode: 'words', fs: 1, sound: true, first: true, streak: { last: '', count: 0 }, daily: {}, funAsked: [], coachDone: false, seen: {}, style: 'solitaire', zen: false }; }
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
    bible: 'Bible: sort books, people, places and stories into their groups.'
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

function cardEl(id, cls, w) {
  var wd = S.lv.cards[id].w, m = S.mode;
  if (MODES[m].kind === 'text') {
    var txt = disp(wd), two = txt.length > 11 && txt.indexOf(' ') > 0;
    var fs = two ? 13 * P.fs : Math.max(12, Math.min(19, Math.floor(w * 0.82 / (txt.length * 0.56)))) * P.fs;
    return '<div class="card' + (two ? ' two' : '') + ' ' + cls + '" data-id="' + id + '" style="font-size:' + fs.toFixed(1) + 'px">' + esc(txt) + '</div>';
  }
  if (m === 'colors') {
    var hex = window.COLORS[wd], fs2 = Math.max(12, Math.min(17, Math.floor(w * 0.8 / (wd.length * 0.56)))) * P.fs;
    return '<div class="card c ' + cls + '" data-id="' + id + '" style="background:' + hex + ';color:' + hexText(hex) + ';font-size:' + fs2.toFixed(1) + 'px">' + esc(cap(wd)) + '</div>';
  }
  return '<div class="card p ' + cls + '" data-id="' + id + '"><img src="pics/' + wd + '.webp" alt="" draggable="false"><span class="n">' + esc(label(id)) + '</span></div>';
}
function slotItem(id) {
  var wd = S.lv.cards[id].w;
  if (S.mode === 'colors') return '<i class="dot" style="background:' + window.COLORS[wd] + '"></i>' + esc(cap(wd));
  if (S.mode === 'pics') return '<img src="pics/' + wd + '.webp" alt="">' + esc(label(id));
  var t = disp(wd);
  return t.length > 12 ? '<span style="font-size:.88em">' + esc(t) + '</span>' : esc(t);
}

function coachInfo() {
  if (S.style === 'grid') return null;
  if (P.coachDone && !(S.bye && Date.now() < S.bye)) return null;
  if (S.daily) return null;
  if (S.bye && Date.now() < S.bye) return { msg: 'Group complete! Its name is revealed. Keep going until every box is full.' };
  var started = S.slots.some(function (s) { return s.ids.length; });
  if (!S.sel && !started) { var e = ends().filter(function (x) { return x.from === 'col'; })[0]; return { msg: 'Step 1: Tap a card at the BOTTOM of any column.', card: e && e.id }; }
  if (S.sel && !started) return { msg: 'Step 2: Now tap an empty box at the top to put the card there.', slot: 0 };
  var si = -1; S.slots.forEach(function (s, i) { if (si < 0 && s.ids.length && !s.done) si = i; });
  if (!S.sel && started) { var r = findHint(); return { msg: 'Step 3: Tap another card that belongs in the SAME group, then tap that box. (The glowing card fits.)', card: r && r.h.slot === si ? r.h.id : undefined, slot: si }; }
  return { msg: 'Now tap the box. If the card does not belong, it only counts as a miss.', slot: si };
}

function captureRects() { var m = {}; document.querySelectorAll('#cols [data-id]').forEach(function (el) { m[el.getAttribute('data-id')] = el.getBoundingClientRect(); }); return m; }

function render() {
  if (!S) return;
  var before = captureRects();
  var W = Math.min(window.innerWidth, 480) - 28;
  var nc = S.cols.length, gap = 9, cw = (W - gap * (nc - 1)) / nc;
  var h = S.hint, sid = selId(), co = coachInfo();
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
  setBar();
  if (S.style === 'grid') { renderGrid(); persistCur(); return; }
  var cb = $('coach');
  if (co) { cb.innerHTML = esc(co.msg) + ' <a data-act="coachoff">Hide tips</a>'; cb.classList.add('on'); } else cb.classList.remove('on');
  var ns = S.slots.length, sl = $('slots'); sl.className = 'slots n' + ns;
  var html = '';
  S.slots.forEach(function (s, i) {
    var pal = s.cat >= 0 ? PAL[s.cat % PAL.length] : ['#cdbfae', '#cdbfae'];
    var hit = (h && h.slot === i) || (co && co.slot === i);
    html += '<div class="slot' + (s.done ? ' done' : s.ids.length ? ' started' : ' empty') + (hit ? ' hint' : '') + (S.sel && !s.done ? ' target' : '') + (S.bump === i ? ' bump' : '') + '" data-slot="' + i + '" style="--c1:' + pal[0] + ';--c2:' + pal[1] + '">';
    html += '<div class="sh">' + (s.done ? CHECK + esc(S.lv.cats[s.cat]) : s.ids.length ? 'Group ' + s.ids.length + '/' + S.lv.per : 'Empty') + '</div>';
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
function renderGrid() {
  var W = Math.min(window.innerWidth, 480) - 28, n = S.lv.cards.length, cols = n >= 16 ? 4 : 3, gap = 9, cw = (W - gap * (cols - 1)) / cols;
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
}
function shareResult() {
  var sq = ['🟥', '🟩', '🟨', '🟦', '🟪'];
  var line = S.doneOrder.map(function (c) { return sq[c % 5]; }).join('');
  var txt = 'Deckword · ' + MODES[S.mode].name + (S.daily ? ' · Daily ' + dstr() : ' · Level ' + S.lv.n) + '\n' +
    (P.zen ? '' : '⭐'.repeat(S.stars || 1) + ' · ' + S.misses + ' miss' + (S.misses === 1 ? '' : 'es') + '\n') + line + '\n' + location.origin + location.pathname;
  log('share');
  if (navigator.share) { navigator.share({ text: txt }).catch(function () { }); return; }
  var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast('Copied! Paste it into a message.'); } catch (e) { toast(txt); }
  ta.remove();
}

// ---------- modals ----------
function modal(html) { var m = $('modal'); m.innerHTML = '<div class="sheet">' + html + '</div>'; m.classList.add('on'); }
function closeModal() { $('modal').classList.remove('on'); $('modal').innerHTML = ''; }
function totalDone() { var n = 0; MORDER.forEach(function (m) { n += Object.keys(P.sm[m]).length; }); return n; }

function showWin(stars, secs, done) {
  var names = S.lv.cats.map(function (c, i) { var p = PAL[i % PAL.length]; return '<span class="chip" style="background:linear-gradient(135deg,' + p[0] + ',' + p[1] + ')">' + esc(c) + '</span>'; }).join('');
  var fun = '';
  var ask = [5, 15, 30].filter(function (x) { return done >= x && P.funAsked.indexOf(x) < 0; })[0];
  if (ask && !S.daily) {
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
  modal('<h2>Deckword</h2><div class="grid1">' +
    '<button class="pri" data-act="resume">Back to the game</button>' +
    '<button class="mt" data-act="modes">' + MICON[cm] + '<span><b>Game mode</b><small>Playing: ' + MODES[cm].name + ' · tap to change</small></span></button>' +
    '<button class="mt" data-act="daily"><span class="mi w" style="background:linear-gradient(145deg,#f6b73c,#ff8a4a)">' + (dailyDone ? '✓' : '★') + '</span><span><b>Daily deck: ' + MODES[dm].name + '</b><small>' + (dailyDone ? 'Done today! ' : 'New puzzle every day · ') + 'Streak ' + streak + ' day' + (streak === 1 ? '' : 's') + '</small></span></button>' +
    '<button class="mt" data-act="style"><span class="mi w" style="background:linear-gradient(145deg,#6c7ae0,#8c9bff);font-size:18px">' + (P.style === 'grid' ? '▦' : '☰') + '</span><span><b>Play style</b><small>' + (P.style === 'grid' ? 'Four Groups grid' : 'Solitaire columns') + ' · tap to switch</small></span></button>' +
    '<button data-act="levels">All levels</button>' +
    '<button data-act="how">How to play</button>' +
    '<button data-act="settings">Settings</button>' +
    '<button data-act="stats">My results (for the test)</button>' +
    '<button data-act="remove">Remove ads: $3.99</button></div>');
}
function modes() {
  var h = '<h2>Choose a mode</h2><div class="grid1">', cm = S ? S.mode : P.mode;
  visibleModes().forEach(function (m) {
    var n = Object.keys(P.sm[m]).length;
    h += '<button class="mt' + (m === cm ? ' sel' : '') + '" data-act="mode" data-m="' + m + '">' + MICON[m] + '<span style="flex:1"><b>' + MODES[m].name + '</b><small>' + MODES[m].blurb + '</small><span class="bar2"><i style="width:' + Math.min(100, n) + '%"></i></span><small>' + n + ' of 100 levels done</small></span></button>';
  });
  modal(h + '<button data-act="menu">Back</button></div>');
}
function levels() {
  var m = S ? S.mode : P.mode;
  var h = '<h2>' + MODES[m].name + ' levels</h2><div class="lgrid">';
  for (var n = 1; n <= 100; n++) {
    var s = P.sm[m][n] || 0;
    h += '<button class="lv' + (n === (S && !S.daily ? S.lv.n : -1) ? ' cur' : '') + '" data-act="go" data-n="' + n + '">' + n + '<i>' + (s ? '★'.repeat(s) : '·') + '</i></button>';
  }
  modal(h + '</div><div class="row"><button data-act="menu">Back</button></div>');
}
function how() {
  modal('<h2>How to play</h2><ol class="how"><li>The cards belong to <b>hidden groups</b> (like Fruits, or Blues).</li>' +
    '<li>You can only use the <b>bottom card</b> of each column. Tap it, then tap a box at the top.</li>' +
    '<li>An empty box takes any card. After that, only cards from the <b>same group</b> fit. A wrong try is a <b>miss</b>.</li>' +
    '<li>Fill a box to reveal its name and clear the cards.</li>' +
    '<li>Tap a column instead to <b>park</b> a card there and uncover the ones under it.</li>' +
    '<li>Undo is free and unlimited. Some cards fit <b>two groups</b>, so count carefully!</li></ol>' +
    '<div class="row"><button class="pri" data-act="resume">Got it</button></div>');
}
function welcome() {
  modal('<h2>Welcome to Deckword</h2><p class="sub" style="font-size:18px">Sort the cards into hidden groups. I will show you how in the first level, one step at a time.</p><div class="row"><button class="pri" data-act="resume">Start</button></div>');
}
function settings() {
  modal('<h2>Settings</h2><div class="grid1"><button data-act="fs">Text size: ' + ['Medium', 'Large', 'Extra large'][[1, 1.15, 1.3].indexOf(P.fs)] + '</button>' +
    '<button data-act="snd">Sound: ' + (P.sound ? 'On' : 'Off') + '</button>' +
    '<button data-act="hidebible">Bible mode: ' + (P.hideBible ? 'Hidden' : 'Shown') + '</button>' +
    '<button data-act="zen">Zen mode: ' + (P.zen ? 'On (no stars or miss count)' : 'Off') + '</button>' +
    '<button data-act="restart">Restart this level</button>' +
    '<button data-act="tipson">Show first-level tips again</button>' +
    '<button data-act="reset">Erase my progress</button><button data-act="menu">Back</button></div>');
}
function stats() {
  var ev = ST.ev, doneAll = ev.filter(function (e) { return e.e === 'level_done'; });
  var done = doneAll.filter(function (e) { return !e.daily; });
  var days = {}; ev.forEach(function (e) { days[new Date(e.t).toDateString()] = 1; });
  function cnt(x) { return ev.filter(function (e) { return e.e === x; }).length; }
  var fun = ev.filter(function (e) { return e.e === 'fun'; }).map(function (e) { return e.v + (e.m ? '(' + e.m + ')' : ''); });
  var avgM = doneAll.length ? (doneAll.reduce(function (a, e) { return a + e.misses; }, 0) / doneAll.length).toFixed(1) : '0';
  var avgS = doneAll.length ? Math.round(doneAll.reduce(function (a, e) { return a + e.secs; }, 0) / doneAll.length) : 0;
  var perMode = MORDER.map(function (m) { return MODES[m].name + ' ' + doneAll.filter(function (e) { return (e.m || 'words') === m; }).length; }).join(', ');
  var rep = 'DECKWORD TEST RESULTS\nLevels finished (incl. daily): ' + doneAll.length + '  [' + perMode + ']\nDaily decks finished: ' + doneAll.filter(function (e) { return e.daily; }).length +
    '\nDays played: ' + Object.keys(days).length + '\nAverage misses per level: ' + avgM + '\nAverage seconds per level: ' + avgS + '\nHints used: ' + cnt('hint') + '\nUndos: ' + cnt('undo') +
    '\nTapped "More hints / watch an ad": ' + cnt('adhint_tap') + '\nTapped "Remove ads $3.99": ' + cnt('removeads_tap') + '\nFun answers: ' + (fun.join(', ') || 'none') +
    '\nHighest level (Words/Colors/Pictures): ' + MORDER.map(function (m) { return Math.max.apply(null, [0].concat(Object.keys(P.sm[m]).map(Number))); }).join(' / ') +
    '\nStreak: ' + P.streak.count + '\nMode switches: ' + cnt('mode_switch');
  modal('<h2>My results</h2><p class="sub">Nothing leaves your phone. To share, copy this and paste it to Claude.</p><textarea id="rep" readonly>' + esc(rep) + '</textarea><div class="row"><button data-act="copy">Copy</button><button data-act="menu">Back</button></div>');
}

// ---------- sound ----------
var ac = null;
function unlock() { try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { } }
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
  else if (a === 'mode') { var m = el.getAttribute('data-m'); log('mode_switch', { to: m }); startLevel(P.curs[m] || 1, { mode: m }); }
  else if (a === 'daily') { var dm = dailyMode(); startLevel(45, { daily: true, seed: +dstr().replace(/-/g, ''), cfg: DCFG, mode: dm }); }
  else if (a === 'coachoff') { P.coachDone = true; saveP(); S.bye = 0; render(); }
  else if (a === 'tipson') { P.coachDone = false; saveP(); closeModal(); render(); }
  else if (a === 'fs') { P.fs = P.fs === 1 ? 1.15 : P.fs === 1.15 ? 1.3 : 1; saveP(); applyFs(); settings(); render(); }
  else if (a === 'snd') { P.sound = !P.sound; saveP(); settings(); }
  else if (a === 'hidebible') { P.hideBible = !P.hideBible; saveP(); if (P.hideBible && S && S.mode === 'bible') { startLevel(P.curs.words || 1, { mode: 'words' }); } settings(); }
  else if (a === 'zen') { P.zen = !P.zen; saveP(); settings(); render(); }
  else if (a === 'restart') { closeModal(); restartCur(); }
  else if (a === 'style') { P.style = P.style === 'grid' ? 'solitaire' : 'grid'; saveP(); log('style_switch', { to: P.style }); closeModal(); restartCur(); }
  else if (a === 'share') { shareResult(); }
  else if (a === 'reset') { if (confirm('Erase all progress and results on this phone?')) { P = defaults(); ST = { ev: [] }; saveP(); store('dw_stats', ST); store('dw_cur', null); startLevel(1); welcome(); } }
  else if (a === 'fun') { log('fun', { v: el.getAttribute('data-v') }); el.parentNode.parentNode.innerHTML = '<p>Thank you!</p>'; }
  else if (a === 'copy') { var r = $('rep'); r.select(); try { document.execCommand('copy'); toast('Copied'); } catch (x) { } }
  else if (a === 'remove') { log('removeads_tap'); modal('<h2>Remove ads</h2><p class="sub">This test version has no ads at all, and nothing is for sale yet. Thank you for telling us you would want this.</p><div class="row"><button class="pri" data-act="menu">OK</button></div>'); }
}
$('bUndo').onclick = function () { if (S && S.style === 'grid') gridShuffle(); else undo(); };
$('bHint').onclick = function () {
  if (S && S.hints <= 0) { log('adhint_tap'); S.hints += 3; toast('Test version: no real ad. Here are 3 more hints!'); render(); return; }
  giveHint();
};
$('bMenu').onclick = function () { unlock(); menu(); };
$('bRestart').onclick = function () { if (!S || S.won) return; if (S.style === 'grid') gridSubmit(); else restartCur(); };
window.addEventListener('resize', render);
function applyFs() { document.documentElement.style.setProperty('--fs', P.fs); }
applyFs();

// ---------- start ----------
var cur = store('dw_cur');
try {
  if (cur && cur.cols) {
    var lv = makeLevel(cur.n, cur.seed, cur.daily ? DCFG : null, cur.mode || 'words');
    S = newState(lv, cur.daily); S.cols = cur.cols; S.slots = cur.slots; S.misses = cur.misses; S.moves = cur.moves; S.hints = cur.hints; S.t0 = cur.t0;
    S.style = cur.style || 'solitaire'; if (cur.gorder) { S.gsel = cur.gsel || []; S.gfound = cur.gfound || []; S.gorder = cur.gorder; } S.doneOrder = cur.doneOrder || [];
    render();
  } else startLevel(P.curs[P.mode] || 1, { mode: P.mode });
} catch (e) { store('dw_cur', null); P.mode = 'words'; startLevel(1); }
if (P.first) { P.first = false; saveP(); welcome(); }

window.DW = {
  makeLevel: makeLevel, cfg: cfg, state: function () { return S; }, MODES: MODES, start: startLevel,
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
