// Connects the game's purchase screens to RevenueCat inside the phone app. On the web it does nothing.
// Sets window.ABStore before game.js runs; game.js then asks it what the player owns at every start.
// The keys below are RevenueCat's PUBLIC app keys (appl_... for iPhone, goog_... for Android), safe to ship in the app.
(function () {
  var KEYS = { ios: '', android: '' };
  var IDS = ['remove_ads', 'all_modes', 'bundle', 'theme_beach', 'theme_cabin', 'theme_rainy', 'theme_starry', 'themes_all'];
  var PRE = 'alikeberry_';
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var key = KEYS[C.getPlatform()];
  var RC = (C.Plugins && C.Plugins.Purchases) || (C.registerPlugin && C.registerPlugin('Purchases'));
  if (!key || !RC) return; // no key yet: the game says "store not available" instead of selling anything
  var ready = RC.configure({ apiKey: key });
  // store product ids -> the game's ids (alikeberry_remove_ads -> remove_ads)
  function owned(res) {
    var ci = res && (res.customerInfo || res);
    return ((ci && ci.allPurchasedProductIdentifiers) || []).map(function (p) { return p.indexOf(PRE) === 0 ? p.slice(PRE.length) : p; })
      .filter(function (p) { return IDS.indexOf(p) >= 0; });
  }
  var cache = {};
  function products(ids) {
    return RC.getProducts({ productIdentifiers: ids.map(function (i) { return PRE + i; }), type: 'NON_SUBSCRIPTION' }).then(function (r) {
      (r.products || []).forEach(function (p) { cache[p.identifier.replace(PRE, '')] = p; });
      return cache;
    });
  }
  window.ABStore = {
    owned: function () { return ready.then(function () { return RC.getCustomerInfo(); }).then(owned); },
    restore: function () { return ready.then(function () { return RC.restorePurchases(); }).then(owned); },
    buy: function (id) {
      return ready.then(function () { return cache[id] ? cache : products([id]); }).then(function (c) {
        if (!c[id]) throw new Error('product not found: ' + id);
        return RC.purchaseStoreProduct({ product: c[id] });
      }).then(owned);
    },
    prices: function () {
      return ready.then(function () { return products(IDS); }).then(function (c) {
        var out = {}; Object.keys(c).forEach(function (i) { out[i] = c[i].priceString; }); return out;
      });
    }
  };
})();
