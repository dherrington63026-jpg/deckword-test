// Birds: sort bird photos by kind. Lists are derived from a table (blue jay is also in the crow family on purpose).
window.BIBANK2 = [
["bi-prey","Birds of prey","eagle hawk falcon owl osprey vulture condor kestrel",1],
["bi-water","Waterbirds","duck swan goose heron flamingo loon stork crane egret",1],
["bi-sea","Seabirds","seagull puffin albatross pelican penguin tern gannet frigatebird",1],
["bi-yard","Backyard birds","robin cardinal bluejay sparrow chickadee goldfinch woodpecker hummingbird dove",1],
["bi-tropical","Tropical birds","parrot macaw toucan cockatoo peacock lovebird hornbill quetzal",1],
["bi-flightless","Birds that cannot fly","ostrich emu penguin kiwibird cassowary rhea kakapo",1],
["bi-farm","Farm and game birds","chicken turkey pheasant quail duck goose guineafowl",1],
["bi-crow","Crow family","crow raven magpie bluejay jackdaw rook",1]
].map(function (r) { return { g: r[0], name: r[1], words: r[2].split(" "), tier: r[3] }; });
