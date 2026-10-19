// Deckword test version: word-group solitaire. No ads, no real purchases. Everything saves on this phone only.
(function () {
'use strict';
var BANK = window.BANK;
var $ = function (id) { return document.getElementById(id); };

// ---------- helpers ----------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, rng) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function range(n) { var r = []; for (var i = 0; i < n; i++) r.push(i); return r; }
function store(k, v) { try { if (v === undefined) { var s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } return null; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

// ---------- level generator ----------
var PAIRS = [];
(function () {
  for (var i = 0; i < BANK.length; i++) for (var j = i + 1; j < BANK.length; j++) {
    var sh = BANK[i].words.filter(function (w) { return BANK[j].words.indexOf(w) >= 0; });
    if (sh.length) PAIRS.push({ a: i, b: j, words: sh });
  }
})();

function cfg(n) {
  if (n <= 3) return { cats: 3, per: 3, tricks: 0 };
  if (n <= 10) return { cats: 3, per: 4, tricks: 0 };
  if (n <= 25) return { cats: 4, per: 4, tricks: 0 };
  if (n <= 40) return { cats: 4, per: 4, tricks: 1 };
  if (n <= 60) return { cats: 4, per: 5, tricks: 1 };
  if (n <= 80) return { cats: 5, per: 5, tricks: 1 };
  return { cats: 5, per: 5, tricks: 2 };
}

function makeLevel(n, seed, over) {
  var c = over || cfg(n);
  var rng = mulberry32(seed);
  for (var attempt = 0; attempt < 600; attempt++) {
    var chosen = [], used = {}, tw = [];
    if (c.tricks > 0) {
      var tp = shuffle(PAIRS.slice(), rng);
      for (var q = 0; q < tp.length && tw.length < c.tricks; q++) {
        var p = tp[q];
        if (chosen.indexOf(p.a) >= 0 || chosen.indexOf(p.b) >= 0) continue;
        var ga = BANK[p.a].g, gb = BANK[p.b].g;
        if (used[ga] || used[gb]) continue;
        var w = p.words[Math.floor(rng() * p.words.length)];
        // the trick word must be in exactly these two categories among all chosen
        chosen.push(p.a, p.b); used[ga] = 1; used[gb] = 1;
        tw.push({ w: w, a: p.a, b: p.b, to: rng() < 0.5 ? p.a : p.b });
      }
      if (tw.length < c.tricks) continue;
    }
    var order = shuffle(range(BANK.length), rng);
    for (var k = 0; k < order.length && chosen.length < c.cats; k++) {
      var idx = order[k], g = BANK[idx].g;
      if (used[g] || chosen.indexOf(idx) >= 0) continue;
      chosen.push(idx); used[g] = 1;
    }
    if (chosen.length < c.cats) continue;
    var designated = {}; tw.forEach(function (t) { designated[t.w] = t; });
    var bad = false;
    tw.forEach(function (t) { chosen.forEach(function (ci) { if (ci !== t.a && ci !== t.b && BANK[ci].words.indexOf(t.w) >= 0) bad = true; }); });
    if (bad) continue;
    shuffle(chosen, rng);
    var cards = [], fail = false;
    chosen.forEach(function (ci, k2) {
      var must = [];
      tw.forEach(function (t) { if (t.to === ci) must.push(t.w); });
      var pool = BANK[ci].words.filter(function (w2) {
        if (designated[w2]) return false;
        for (var o = 0; o < chosen.length; o++) if (chosen[o] !== ci && BANK[chosen[o]].words.indexOf(w2) >= 0) return false;
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
    return {
      n: n, seed: seed, per: c.per, cats: chosen.map(function (ci) { return BANK[ci].name; }),
      tricks: tw.map(function (t) { return t.w; }), cards: cards, cols: cols
    };
  }
  throw new Error('could not build level ' + n);
}

// ---------- state ----------
var S = null;          // current level state
var hist = [];         // undo snapshots
var P = store('dw_prog') || { stars: {}, cur: 1, fs: 1, sound: true, first: true, streak: { last: '', count: 0 }, daily: {}, funAsked: [] };
var ST = store('dw_stats') || { ev: [] };
function saveP() { store('dw_prog', P); }
function log(e, d) { var o = { t: Date.now(), e: e }; if (d) for (var k in d) o[k] = d[k]; ST.ev.push(o); if (ST.ev.length > 1500) ST.ev.splice(0, 300); store('dw_stats', ST); }

function newState(lv, daily) {
  return {
    lv: lv, daily: !!daily,
    cols: lv.cols.map(function (c) { return c.slice(); }),
    slots: lv.cats.map(function () { return { cat: -1, ids: [], done: false }; }),
    sel: null, misses: 0, moves: 0, hints: 3, hint: null, t0: Date.now(), used: 0, won: false
  };
}
function snap() { return JSON.stringify({ c: S.cols, s: S.slots, m: S.moves }); }
function pushHist() { hist.push(snap()); if (hist.length > 400) hist.shift(); }
function persistCur() { if (!S) return; store('dw_cur', { n: S.lv.n, seed: S.lv.seed, daily: S.daily, cols: S.cols, slots: S.slots, misses: S.misses, moves: S.moves, hints: S.hints, t0: S.t0 }); }

function startLevel(n, opts) {
  opts = opts || {};
  var seed = opts.seed || (n * 7919 + 13);
  var lv = makeLevel(n, seed, opts.cfg);
  S = newState(lv, opts.daily);
  hist = [];
  if (!opts.daily) { P.cur = n; saveP(); }
  log('level_start', { n: n, daily: !!opts.daily });
  persistCur(); closeModal(); render(); toast(n <= 2 && !opts.daily ? 'Tap a bottom card, then tap a box above.' : '');
}

// ---------- actions ----------
function ends() { // playable card ids
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
  if (S.sel) { // tapping another bottom card while holding one: treat as park / drop onto that column
    if (from === 'col') return tapColumn(i);
    return tapSlot(i);
  }
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
  if (s.ids.length && s.cat !== card.cat) { // miss
    S.misses++; S.used = 1; sfx('miss'); log('miss', { n: S.lv.n }); shake(i); toast('Does not fit that group'); S.sel = null; persistCur(); render(); return;
  }
  pushHist();
  takeSel(); s.cat = card.cat; s.ids.push(id); S.moves++; S.sel = null; S.hint = null;
  var done = s.ids.length === S.lv.per;
  if (done) { s.done = true; sfx('clear'); toast(S.lv.cats[s.cat] + '!'); } else sfx('ok');
  persistCur(); render();
  if (S.slots.every(function (x) { return x.done; })) win();
}

function undo() {
  unlock();
  if (!hist.length || S.won) { toast('Nothing to undo'); return; }
  var o = JSON.parse(hist.pop()); S.cols = o.c; S.slots = o.s; S.moves = o.m; S.sel = null; S.hint = null;
  log('undo'); persistCur(); sfx('tick'); render();
}

function giveHint() {
  unlock();
  if (S.won) return;
  if (S.hints <= 0) { toast('No hints left'); return; }
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
  if (!h) { // a playable card and its closest group-mate (even if that one is buried)
    var bd = 99;
    colEnds.forEach(function (ce) {
      S.cols.forEach(function (c, ci) {
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
  if (!h) return;
  S.hints--; S.hint = h; log('hint', { n: S.lv.n }); toast(msg); render();
}

function win() {
  S.won = true;
  var secs = Math.round((Date.now() - S.t0) / 1000);
  var allowed = Math.ceil(S.lv.cards.length / 6);
  var stars = S.misses <= allowed ? 3 : S.misses <= allowed * 2 ? 2 : 1;
  var key = S.daily ? 'd' : String(S.lv.n);
  if (!S.daily) { P.stars[key] = Math.max(P.stars[key] || 0, stars); P.cur = S.lv.n + 1; }
  var today = dstr();
  if (S.daily && P.daily.date !== today) {
    P.daily = { date: today, stars: stars };
    var y = new Date(Date.now() - 864e5); var ystr = dstr(y);
    P.streak.count = (P.streak.last === ystr) ? P.streak.count + 1 : 1; P.streak.last = today;
  }
  saveP(); store('dw_cur', null);
  log('level_done', { n: S.lv.n, daily: S.daily, misses: S.misses, moves: S.moves, secs: secs, stars: stars, hints: 3 - S.hints });
  sfx('win');
  var done = Object.keys(P.stars).length;
  setTimeout(function () { showWin(stars, secs, done); }, 600);
}

// ---------- rendering ----------
var PAL = ['#e8735a', '#4f9d8f', '#d9a441', '#6f7fc7', '#b56fa8'];
function dstr(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

function cardEl(id, cls, w) {
  var word = S.lv.cards[id].w;
  var fs = Math.max(12, Math.min(19, Math.floor(w * 0.82 / (word.length * 0.56)))) * P.fs;
  return '<div class="card ' + cls + '" data-id="' + id + '" style="font-size:' + fs.toFixed(1) + 'px">' + esc(cap(word)) + '</div>';
}

function render() {
  if (!S) return;
  var W = Math.min(window.innerWidth, 480) - 24;
  var nc = S.cols.length, gap = 8, cw = (W - gap * (nc - 1)) / nc;
  var h = S.hint, sid = selId();
  // header
  $('lvl').textContent = S.daily ? 'Daily deck' : 'Level ' + S.lv.n;
  $('miss').textContent = 'Misses ' + S.misses;
  $('bUndo').textContent = 'Undo';
  $('bHint').textContent = S.hints > 0 ? 'Hint (' + S.hints + ')' : 'More hints';
  // slots
  var ns = S.slots.length;
  var sl = $('slots'); sl.className = 'slots n' + ns;
  var html = '';
  S.slots.forEach(function (s, i) {
    var col = s.cat >= 0 ? PAL[s.cat % PAL.length] : '#cdbfae';
    var hit = h && h.slot === i;
    html += '<div class="slot' + (s.done ? ' done' : '') + (hit ? ' hint' : '') + (S.sel && !s.done ? ' target' : '') + '" data-slot="' + i + '" style="--c:' + col + '">';
    html += '<div class="sh">' + (s.done ? esc(S.lv.cats[s.cat]) : s.ids.length ? 'Group ' + s.ids.length + '/' + S.lv.per : 'Empty') + '</div>';
    s.ids.forEach(function (id, k) {
      var last = k === s.ids.length - 1 && !s.done;
      html += '<div class="sw' + (last && sid === id ? ' sel' : '') + '" ' + (last ? 'data-top="1"' : '') + '>' + esc(cap(S.lv.cards[id].w)) + '</div>';
    });
    html += '</div>';
  });
  sl.innerHTML = html;
  // columns
  var ch = '';
  S.cols.forEach(function (c, i) {
    ch += '<div class="col" data-col="' + i + '" style="width:' + cw + 'px">';
    if (!c.length) ch += '<div class="empty">' + (S.sel ? 'Tap to park here' : '') + '</div>';
    c.forEach(function (id, k) {
      var last = k === c.length - 1;
      var cls = last ? 'play' : 'locked';
      if (last && sid === id) cls += ' sel';
      if (h && (h.id === id || h.id2 === id)) cls += ' hint';
      ch += cardEl(id, cls, cw);
    });
    ch += '</div>';
  });
  $('cols').innerHTML = ch;
  persistCur();
}

function shake(i) { var el = document.querySelector('[data-slot="' + i + '"]'); if (el) { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 400); } }
var tt = 0;
function toast(m) { var t = $('toast'); if (!m) { t.classList.remove('on'); return; } t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2200); }

// ---------- modals ----------
function modal(html) { var m = $('modal'); m.innerHTML = '<div class="sheet">' + html + '</div>'; m.classList.add('on'); }
function closeModal() { $('modal').classList.remove('on'); $('modal').innerHTML = ''; }

function showWin(stars, secs, done) {
  var names = S.lv.cats.map(function (c, i) { return '<span class="chip" style="background:' + PAL[i % PAL.length] + '">' + esc(c) + '</span>'; }).join('');
  var fun = '';
  var ask = [5, 15, 30].filter(function (x) { return done >= x && P.funAsked.indexOf(x) < 0; })[0];
  if (ask && !S.daily) {
    fun = '<div class="fun"><p>Be honest: is this game fun?</p><div class="row"><button data-act="fun" data-v="yes">Yes</button><button data-act="fun" data-v="ok">It\'s OK</button><button data-act="fun" data-v="no">Not really</button></div></div>';
    P.funAsked.push(ask); saveP();
  }
  modal('<h2>' + (stars === 3 ? 'Wonderful!' : stars === 2 ? 'Well done!' : 'Solved!') + '</h2><div class="stars">' + '★'.repeat(stars) + '<span>' + '★'.repeat(3 - stars) + '</span></div>' +
    '<p class="sub">' + S.misses + ' miss' + (S.misses === 1 ? '' : 'es') + ' · ' + S.moves + ' moves · ' + secs + ' sec</p><div class="chips">' + names + '</div>' + fun +
    '<div class="row"><button class="pri" data-act="' + (S.daily ? 'menu' : 'next') + '">' + (S.daily ? 'Done' : 'Next level') + '</button>' +
    '<button data-act="replay">Play again</button></div>');
}

function menu() {
  var st = P.streak, today = dstr();
  var dailyDone = P.daily.date === today;
  modal('<h2>Deckword</h2><div class="grid1">' +
    '<button class="pri" data-act="resume">Back to the game</button>' +
    '<button data-act="daily">Daily deck ' + (dailyDone ? '✓' : '') + '<small>Streak: ' + (st.last === today || st.last === dstr(new Date(Date.now() - 864e5)) ? st.count : 0) + ' day(s)</small></button>' +
    '<button data-act="levels">All levels</button>' +
    '<button data-act="how">How to play</button>' +
    '<button data-act="settings">Settings</button>' +
    '<button data-act="stats">My results (for the test)</button>' +
    '<button data-act="remove">Remove ads: $3.99</button></div>');
}
function levels() {
  var h = '<h2>All levels</h2><div class="lgrid">';
  for (var n = 1; n <= 100; n++) {
    var s = P.stars[n] || 0;
    h += '<button class="lv' + (n === (S && !S.daily ? S.lv.n : -1) ? ' cur' : '') + '" data-act="go" data-n="' + n + '">' + n + '<i>' + (s ? '★'.repeat(s) : '·') + '</i></button>';
  }
  modal(h + '</div><div class="row"><button data-act="menu">Back</button></div>');
}
function how() {
  modal('<h2>How to play</h2><ol class="how"><li>The words belong to hidden groups, like <b>Fruits</b> or <b>Dog breeds</b>.</li>' +
    '<li>You can only use the <b>bottom card</b> of each column. Tap it, then tap a group box at the top.</li>' +
    '<li>An empty box takes any card. After that, only words from the same group fit. A wrong try is a <b>miss</b>.</li>' +
    '<li>Fill a box to reveal the group name and clear the cards.</li>' +
    '<li>Tap a column instead to <b>park</b> a card there and uncover the ones under it.</li>' +
    '<li>Undo is free and unlimited. Some words fit two groups, so count carefully!</li></ol>' +
    '<div class="row"><button class="pri" data-act="resume">Got it</button></div>');
}
function settings() {
  modal('<h2>Settings</h2><div class="grid1"><button data-act="fs">Text size: ' + ['Medium', 'Large', 'Extra large'][[1, 1.15, 1.3].indexOf(P.fs)] + '</button>' +
    '<button data-act="snd">Sound: ' + (P.sound ? 'On' : 'Off') + '</button>' +
    '<button data-act="reset">Erase my progress</button><button data-act="menu">Back</button></div>');
}
function stats() {
  var ev = ST.ev, done = ev.filter(function (e) { return e.e === 'level_done' && !e.daily; });
  var u = {}; done.forEach(function (e) { u[e.n] = 1; });
  var days = {}; ev.forEach(function (e) { days[new Date(e.t).toDateString()] = 1; });
  function cnt(x) { return ev.filter(function (e) { return e.e === x; }).length; }
  var fun = ev.filter(function (e) { return e.e === 'fun'; }).map(function (e) { return e.v; });
  var avgM = done.length ? (done.reduce(function (a, e) { return a + e.misses; }, 0) / done.length).toFixed(1) : '0';
  var avgS = done.length ? Math.round(done.reduce(function (a, e) { return a + e.secs; }, 0) / done.length) : 0;
  var rep = 'DECKWORD TEST RESULTS\nLevels finished: ' + done.length + ' (' + Object.keys(u).length + ' different)\nDaily decks finished: ' + ev.filter(function (e) { return e.e === 'level_done' && e.daily; }).length +
    '\nDays played: ' + Object.keys(days).length + '\nAverage misses per level: ' + avgM + '\nAverage seconds per level: ' + avgS + '\nHints used: ' + cnt('hint') + '\nUndos: ' + cnt('undo') +
    '\nTapped "More hints / watch an ad": ' + cnt('adhint_tap') + '\nTapped "Remove ads $3.99": ' + cnt('removeads_tap') + '\nFun answers: ' + (fun.join(', ') || 'none') + '\nHighest level reached: ' + (Math.max.apply(null, [0].concat(Object.keys(P.stars).map(Number))) || 0) +
    '\nStars (3/2/1): ' + [3, 2, 1].map(function (s) { return Object.keys(P.stars).filter(function (k) { return P.stars[k] === s; }).length; }).join('/') + '\nStreak: ' + P.streak.count;
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
document.addEventListener('click', function (e) {
  var t = e.target;
  var b = t.closest('[data-act]');
  if (b) return act(b.getAttribute('data-act'), b);
  if (!S) return;
  var cd = t.closest('.card.play'); if (cd) { var ci = +cd.parentNode.getAttribute('data-col'); return tapCard('col', ci); }
  var sw = t.closest('.slot'); if (sw) { return tapSlot(+sw.getAttribute('data-slot')); }
  var col = t.closest('.col'); if (col) { return tapColumn(+col.getAttribute('data-col')); }
});

function act(a, el) {
  unlock();
  var n = el && +el.getAttribute('data-n');
  if (a === 'menu') menu();
  else if (a === 'resume') closeModal();
  else if (a === 'next') startLevel(S.lv.n + 1);
  else if (a === 'replay') { if (S.daily) startLevel(S.lv.n, { daily: true, seed: S.lv.seed, cfg: cfg(45) }); else startLevel(S.lv.n); }
  else if (a === 'levels') levels();
  else if (a === 'go') startLevel(n);
  else if (a === 'how') how();
  else if (a === 'settings') settings();
  else if (a === 'stats') stats();
  else if (a === 'daily') { var ds = +dstr().replace(/-/g, ''); startLevel(45, { daily: true, seed: ds, cfg: { cats: 4, per: 5, tricks: 1 } }); }
  else if (a === 'fs') { P.fs = P.fs === 1 ? 1.15 : P.fs === 1.15 ? 1.3 : 1; saveP(); applyFs(); settings(); render(); }
  else if (a === 'snd') { P.sound = !P.sound; saveP(); settings(); }
  else if (a === 'reset') { if (confirm('Erase all progress and results on this phone?')) { P = { stars: {}, cur: 1, fs: 1, sound: true, first: true, streak: { last: '', count: 0 }, daily: {}, funAsked: [] }; ST = { ev: [] }; saveP(); store('dw_stats', ST); store('dw_cur', null); startLevel(1); } }
  else if (a === 'fun') { log('fun', { v: el.getAttribute('data-v') }); el.parentNode.parentNode.innerHTML = '<p>Thank you!</p>'; }
  else if (a === 'copy') { var r = $('rep'); r.select(); try { document.execCommand('copy'); toast('Copied'); } catch (x) { } }
  else if (a === 'remove') { log('removeads_tap'); modal('<h2>Remove ads</h2><p class="sub">This test version has no ads at all, and nothing is for sale yet. Thank you for telling us you would want this.</p><div class="row"><button class="pri" data-act="menu">OK</button></div>'); }
}
$('bUndo').onclick = undo;
$('bHint').onclick = function () {
  if (S && S.hints <= 0) { log('adhint_tap'); S.hints += 3; toast('Test version: no real ad. Here are 3 more hints!'); render(); return; }
  giveHint();
};
$('bMenu').onclick = function () { unlock(); menu(); };
$('bRestart').onclick = function () { if (S && !S.won) { startLevel(S.lv.n, S.daily ? { daily: true, seed: S.lv.seed, cfg: cfg(45) } : null); } };
window.addEventListener('resize', render);

function applyFs() { document.documentElement.style.setProperty('--fs', P.fs); }
applyFs();

// ---------- start ----------
var cur = store('dw_cur');
try {
  if (cur && cur.cols) {
    var lv = makeLevel(cur.n, cur.seed, cur.daily ? { cats: 4, per: 5, tricks: 1 } : null);
    S = newState(lv, cur.daily); S.cols = cur.cols; S.slots = cur.slots; S.misses = cur.misses; S.moves = cur.moves; S.hints = cur.hints; S.t0 = cur.t0;
    render();
  } else startLevel(P.cur || 1);
} catch (e) { store('dw_cur', null); startLevel(1); }
if (P.first) { P.first = false; saveP(); how(); }

// test hooks
window.DW = {
  makeLevel: makeLevel, cfg: cfg, state: function () { return S; }, BANK: BANK, start: startLevel,
  autoplay: function () { // plays the current level perfectly using the real actions
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
