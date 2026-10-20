// Colors mode: group the shades by color family. Same shade in two lists = a "between" shade (trick card).
window.COLORS = {
crimson:"#dc143c",scarlet:"#ff2400",ruby:"#9b111e",brick:"#b22222",maroon:"#800000",cardinal:"#c41e3a",burgundy:"#800020",cherry:"#d2042d",mahogany:"#c04000",
tangerine:"#f28500",pumpkin:"#ff7518",carrot:"#ed9121",apricot:"#f8a65a",marigold:"#eaa221",copper:"#b87333",amber:"#ffbf00",coral:"#ff7f50",rust:"#b7410e",
lemon:"#fff44f",banana:"#ffe135",gold:"#ffd700",canary:"#ffef00",mustard:"#ffdb58",butter:"#fffd8d",daffodil:"#ffff31",
emerald:"#50c878",lime:"#32cd32",forest:"#228b22",olive:"#808000",mint:"#98ff98",sage:"#9caf88",moss:"#8a9a5b",jade:"#00a86b",shamrock:"#009e60",teal:"#008080",turquoise:"#40e0d0",
navy:"#000080",sky:"#87ceeb",royal:"#4169e1",cobalt:"#0047ab",azure:"#007fff",denim:"#1560bd",sapphire:"#0f52ba",cerulean:"#2a52be",powder:"#b0e0e6",indigo:"#4b0082",
violet:"#8f00ff",lavender:"#b57edc",plum:"#8e4585",grape:"#6f2da8",amethyst:"#9966cc",lilac:"#c8a2c8",mauve:"#e0b0ff",eggplant:"#3e1f47",magenta:"#ff00ff",orchid:"#da70d6",
blush:"#de5d83",bubblegum:"#ffc1cc",flamingo:"#fc8eac",carnation:"#ffa6c9",candy:"#ffbcd9",salmon:"#fa8072",rose:"#ff6fa5",
chocolate:"#7b3f00",coffee:"#6f4e37",chestnut:"#954535",caramel:"#af6e4d",tan:"#d2b48c",walnut:"#5d432c",mocha:"#967969",hazel:"#8b5a2b",sand:"#c2b280",
silver:"#c0c0c0",charcoal:"#36454f",slate:"#708090",ash:"#b2beb5",pewter:"#8e9196",steel:"#71797e",smoke:"#738276",graphite:"#383428",stone:"#928e85",fog:"#cfd0cf"
};
window.CBANK = [
["warm","Reds","crimson scarlet ruby brick maroon cardinal burgundy cherry mahogany"],
["warm","Oranges","tangerine pumpkin carrot apricot marigold copper amber coral rust"],
["warm","Pinks","blush bubblegum flamingo carnation candy salmon rose magenta coral orchid"],
["yel","Yellows","lemon banana gold canary mustard butter daffodil amber"],
["yel","Browns","chocolate coffee chestnut caramel tan walnut mocha hazel sand rust mahogany"],
["cool","Greens","emerald lime forest olive mint sage moss jade shamrock teal turquoise"],
["cool","Blues","navy sky royal cobalt azure denim sapphire cerulean powder teal turquoise indigo"],
["purp","Purples","violet lavender plum grape amethyst lilac mauve eggplant indigo magenta orchid"],
["gray","Grays","silver charcoal slate ash pewter steel smoke graphite stone fog"]
].map(function (r) { return { g: r[0], name: r[1], words: r[2].split(" ") }; });
