// Numbers mode: sort the numbers 1-100 by what they have in common. Lists are computed, so they are complete
// (a number that fits two chosen groups is never dealt unless it is a deliberate "trick" card).
window.NBANK = (function () {
  function R(a, b, s) { var r = []; s = s || 1; for (; a <= b; a += s) r.push(String(a)); return r; }
  var primes = [];
  for (var n = 2; n <= 100; n++) { var p = true; for (var d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; } if (p) primes.push(String(n)); }
  var sq = [], cu = [], tri = [], t = 0, i;
  for (i = 1; i * i <= 100; i++) sq.push(String(i * i));
  for (i = 1; i * i * i <= 100; i++) cu.push(String(i * i * i));
  for (i = 1; t + i <= 100; i++) { t += i; tri.push(String(t)); }
  var rows = [
    // tier 1 (levels 1-10): everyday ideas
    ['n-even', 'Even numbers', R(2, 100, 2), 1],
    ['n-odd', 'Odd numbers', R(1, 99, 2), 1],
    ['n-m5', 'Multiples of 5', R(5, 100, 5), 1],
    ['n-d1', 'Single digits', R(1, 9), 1],
    ['n-20', 'In the 20s', R(20, 29), 1],
    ['n-30', 'In the 30s', R(30, 39), 1],
    ['n-40', 'In the 40s', R(40, 49), 1],
    ['n-60', 'In the 60s', R(60, 69), 1],
    ['n-80', 'In the 80s', R(80, 89), 1],
    // tier 2 (levels 11-25): times tables and shapes
    ['n-m3', 'Multiples of 3', R(3, 99, 3), 2],
    ['n-m4', 'Multiples of 4', R(4, 100, 4), 2],
    ['n-m10', 'Multiples of 10', R(10, 100, 10), 2],
    ['n-sq', 'Square numbers', sq, 2],
    ['n-teen', 'Teens', R(13, 19), 2],
    ['n-50', 'In the 50s', R(50, 59), 2],
    ['n-70', 'In the 70s', R(70, 79), 2],
    ['n-90', 'In the 90s', R(90, 99), 2],
    // tier 3 (levels 26+): number patterns
    ['n-prime', 'Prime numbers', primes, 3],
    ['n-m7', 'Multiples of 7', R(7, 98, 7), 3],
    ['n-m9', 'Multiples of 9', R(9, 99, 9), 3],
    ['n-p2', 'Doubling numbers', ['2', '4', '8', '16', '32', '64'], 3],
    ['n-tri', 'Triangular numbers', tri, 3],
    ['n-fib', 'Fibonacci numbers', ['1', '2', '3', '5', '8', '13', '21', '34', '55', '89'], 3],
    ['n-cube', 'Cube numbers', cu, 3]
  ];
  return rows.map(function (r) { return { g: r[0], name: r[1], words: r[2], tier: r[3] }; });
})();
