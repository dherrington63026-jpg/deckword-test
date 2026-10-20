// Birds: sort bird photos by kind. Lists are derived from a table (blue jay is also in the crow family on purpose).
window.BIBANK2 = [
["bi-prey","Birds of prey","eagle hawk falcon owl osprey vulture",1],
["bi-water","Waterbirds","duck swan goose heron flamingo",1],
["bi-sea","Seabirds","seagull puffin albatross pelican penguin",1],
["bi-yard","Backyard birds","robin cardinal bluejay sparrow chickadee goldfinch woodpecker hummingbird dove",1],
["bi-tropical","Tropical birds","parrot macaw toucan cockatoo peacock",1],
["bi-flightless","Birds that cannot fly","ostrich emu penguin kiwibird",1],
["bi-farm","Farm and game birds","chicken turkey pheasant quail duck goose",1],
["bi-crow","Crow family","crow raven magpie bluejay",1]
].map(function (r) { return { g: r[0], name: r[1], words: r[2].split(" "), tier: r[3] }; });
