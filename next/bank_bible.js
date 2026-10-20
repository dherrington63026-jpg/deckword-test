// Bible mode: sort Bible books, people, places and stories. A name in two lists (John, Samuel, Ruth...) is a deliberate
// "trick" card for later levels. Underscores = spaces. tier 1 = well-known, tier 2 = a bit harder.
window.BIBANK = [
["b-moses","Books of Moses","Genesis Exodus Leviticus Numbers Deuteronomy",1],
["b-gospels","Gospels","Matthew Mark Luke John",1],
["b-apostles","Apostles","Peter Andrew James John Philip Thomas Matthew Bartholomew Simon Judas Thaddaeus",1],
["b-women","Women of the Bible","Eve Sarah Rebekah Rachel Leah Ruth Esther Mary Martha Hannah Miriam Deborah",1],
["b-genesis","Men of Genesis","Adam Noah Abraham Isaac Jacob Joseph Cain Abel Esau",1],
["b-places","Places","Bethlehem Nazareth Jerusalem Jericho Galilee Eden Babel Sinai Egypt Damascus",1],
["b-animals","Animals in the Bible","Lion Lamb Serpent Dove Donkey Raven Ram Camel Frogs Locusts",1],
["b-history","History books","Joshua Judges Ruth Samuel Kings Chronicles Ezra Nehemiah Esther",2],
["b-wisdom","Wisdom books","Job Psalms Proverbs Ecclesiastes",2],
["b-prophetbooks","Books of the Prophets","Isaiah Jeremiah Ezekiel Daniel Hosea Joel Amos Jonah Micah Malachi",2],
["b-letters","Letters","Romans Corinthians Galatians Ephesians Philippians Colossians Timothy Titus Philemon Hebrews James Peter John",2],
["b-kings","Kings of Israel and Judah","Saul David Solomon Ahab Hezekiah Josiah Jeroboam",2],
["b-prophets","Prophets (the men)","Elijah Elisha Samuel Nathan Moses John_the_Baptist Isaiah Jonah",2],
["b-parables","Parables of Jesus","Good_Samaritan Prodigal_Son Sower Lost_Sheep Mustard_Seed Talents Lost_Coin Wise_Builders",2],
["b-plagues","Plagues of Egypt","Blood Frogs Lice Flies Boils Hail Locusts Darkness Livestock Firstborn",2],
["b-fruit","Fruit of the Spirit","Love Joy Peace Patience Kindness Goodness Faithfulness Gentleness",2]
].map(function (r) { return { g: r[0], name: r[1], words: r[2].split(" "), tier: r[3] }; });
