// Connects the game's fair-ad rules (game.js: betweenAdOK, moreHints) to Google AdMob inside the phone app.
// On the web it does nothing, so the web test never shows ads. Sets window.ABAds = { between(), reward() }.
// David's fair ads standard (WebsiteStudio\FAIR-ADS-STANDARD.md): only a rewarded "Watch an ad" for hints and an
// occasional between-puzzle ad; no banners, no app-open ads. The game decides WHEN; this file only shows them.
(function () {
  // LIVE = false shows Google's test ads (required while we build and test: tapping our own real ads breaks AdMob rules).
  // Switch to true only for the store release build.
  var LIVE = false;
  var UNITS = {
    android: { reward: 'ca-app-pub-5865120493583018/2309777523', between: 'ca-app-pub-5865120493583018/3385599205' },
    ios: { reward: 'ca-app-pub-5865120493583018/2072517531', between: 'ca-app-pub-5865120493583018/8683614180' }
  };
  var TEST = {
    android: { reward: 'ca-app-pub-3940256099942544/5224354917', between: 'ca-app-pub-3940256099942544/1033173712' },
    ios: { reward: 'ca-app-pub-3940256099942544/1712485313', between: 'ca-app-pub-3940256099942544/4411468910' }
  };
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var plat = C.getPlatform(), A = (C.Plugins && C.Plugins.AdMob) || (C.registerPlugin && C.registerPlugin('AdMob'));
  if (!A || !UNITS[plat]) return;
  var ID = (LIVE ? UNITS : TEST)[plat];
  // 1. start AdMob, 2. Google's consent form where the law needs one (Europe, UK, some US states),
  // 3. on iPhone, Apple's "Allow tracking?" question. Saying no still shows ads, just not personalized ones.
  var ready = A.initialize({ initializeForTesting: !LIVE, tagForChildDirectedTreatment: false, tagForUnderAgeOfConsent: false })
    .then(function () { return A.requestConsentInfo({ tagForUnderAgeOfConsent: false }); })
    .then(function (info) { return info.status === 'REQUIRED' && info.isConsentFormAvailable ? A.showConsentForm() : info; })
    .catch(function () { })
    .then(function () {
      if (plat !== 'ios') return;
      return A.trackingAuthorizationStatus().then(function (t) { if (t.status === 'notDetermined') return A.requestTrackingAuthorization(); }).catch(function () { });
    });
  // keep one of each ad loaded so it starts right away when the player asks
  var have = { between: false, reward: false };
  function load(kind) {
    if (have[kind]) return Promise.resolve();
    var p = kind === 'between' ? A.prepareInterstitial({ adId: ID.between, isTesting: !LIVE }) : A.prepareRewardVideoAd({ adId: ID.reward, isTesting: !LIVE });
    return p.then(function () { have[kind] = true; });
  }
  ready.then(function () { return load('reward'); }).catch(function () { }).then(function () { return load('between'); }).catch(function () { });
  // show an ad and resolve when its screen closes (or right away if it could not show), so the game never
  // continues under an ad and never waits forever. Rewarded: the store's call only finishes when the reward is earned.
  function run(show, closeEvent) {
    return new Promise(function (res) { // a failed ad rejects: the game then gives the hints anyway
      var h, over = false, earned = false, failed = false;
      var finish = function () { if (over) return; over = true; if (h) h.remove(); setTimeout(function () { res(failed ? Promise.reject(new Error('ad did not show')) : earned); }, 150); };
      A.addListener(closeEvent, finish).then(function (x) { h = x; if (over) x.remove(); });
      show().then(function () { earned = true; }, function () { failed = true; finish(); });
    });
  }
  window.ABAds = {
    between: function () {
      return ready.then(function () { return load('between'); }).then(function () {
        have.between = false;
        return run(function () { return A.showInterstitial(); }, 'interstitialAdDismissed');
      }).then(function () { load('between').catch(function () { }); });
    },
    reward: function () {
      return ready.then(function () { return load('reward'); }).then(function () {
        have.reward = false;
        return run(function () { return A.showRewardVideoAd(); }, 'onRewardedVideoAdDismissed');
      }).then(function (earned) { load('reward').catch(function () { }); return earned; });
    }
  };
})();
