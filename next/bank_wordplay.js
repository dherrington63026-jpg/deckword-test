// Word Play: sort words by sound or spelling instead of meaning. One group per "kind" per level (g = kind), and every
// word that also fits another kind's rule is listed in both lists (checked by tools/check_wordplay.js).
window.WBANK = [
// rhymes (kind "rhyme")
["rhyme","Rhymes with CAT","bat hat mat rat sat flat chat that pat spat vat brat",1],
["rhyme","Rhymes with BEE","tree sea key free knee flea ski tea three",1],
["rhyme","Rhymes with LIGHT","night fight kite bite right white flight sight height tight write",1],
["rhyme","Rhymes with CAKE","lake bake snake shake brake steak make wake rake flake snowflake",1],
["rhyme","Rhymes with BALL","wall tall fall call small hall mall crawl football baseball basketball snowball meatball eyeball fireball",1],
["rhyme","Rhymes with DAY","hay way play gray may say stay tray sleigh weigh",2],
["rhyme","Rhymes with LOW","toe blow mow go show grow slow flow throw crow dough",2],
["rhyme","Rhymes with TRAIN","rain plane brain chain lane pain cane vein",2],
// how a word starts (kind "start")
["start","Start with ST","star stone story stamp storm stick stem steam stove stairs stay steak",1],
["start","Start with BR","bread brick brush brain brave bridge branch broom brat brake",1],
["start","Start with CH","chair chain chalk cheese cherry chicken child chin chat",1],
["start","Start with SH","ship shoe shell shark shirt shade sheep shelf shake show",1],
["start","Start with TH","thumb thorn three throne thread thick thistle that throw",1],
// how a word ends (kind "end")
["end","End with -ING","singing jumping reading painting dancing baking sailing hiking",1],
["end","End with -ED","jumped painted played danced wanted helped",1],
["end","End with -LY","quickly slowly softly gladly quietly badly gently boldly kindly firefly",1],
// compound words (kind "comp")
["comp","Words with SUN","sunflower sunset sunshine sunburn sunglasses sunrise sunbeam",2],
["comp","Words with FIRE","fireplace firefly firework fireman firewood firetruck fireball",2],
["comp","Words with SNOW","snowman snowflake snowball snowstorm snowboard snowshoe",2],
["comp","Words with WATER","watermelon waterproof waterfront watercolor waterslide waterwheel",2],
["comp","Words ending in BALL","football baseball basketball snowball meatball eyeball fireball",2],
["comp","Words ending in HOUSE","greenhouse lighthouse farmhouse doghouse treehouse warehouse birdhouse",2],
// spelling (kind "spell")
["spell","Double letters","coffee balloon button summer happy kitten ladder apple tennis bubble carrot knee tree free wall tall fall call small hall mall football baseball basketball snowball meatball eyeball fireball greenhouse firewood waterproof treehouse sheep cheese broom noon three cherry shell sunglasses waterwheel",2],
["spell","Silent letters (not E)","knee knife write gnome wrist lamb comb island listen castle hour night fight right sight height tight flight thumb chalk thistle lighthouse white sleigh weigh dough",2],
["spell","Palindromes","level radar kayak civic madam racecar noon refer",2]
].map(function (r) { return { g: r[0], name: r[1], words: r[2].split(" "), tier: r[3] }; });
