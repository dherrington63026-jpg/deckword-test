// Famous Places: sort landmark photos by what they are or which continent they are on. Lists derived from a table.
window.PLBANK = [
["pl-t-tower","Famous towers","eiffel bigben pisa burjkhalifa empire spaceneedle cntower",1],
["pl-t-bridge","Famous bridges","towerbridge goldengate brooklyn harbourbridge",1],
["pl-t-ancient","Ancient wonders","colosseum parthenon stonehenge greatwall angkorwat petra chichen machu pyramids",1],
["pl-t-nature","Natural wonders","matterhorn fuji halong niagara grandcanyon iguazu victoria kilimanjaro tablemountain uluru",1],
["pl-t-building","Palaces and famous buildings","brandenburg sagrada versailles tajmahal forbiddencity whitehouse opera",1],
["pl-t-statue","Statues and monuments","liberty rushmore gatewayarch christ sphinx",1],
["pl-c-Europe","Landmarks of Europe","eiffel bigben pisa colosseum parthenon stonehenge towerbridge brandenburg sagrada versailles matterhorn",1],
["pl-c-Asia","Landmarks of Asia","tajmahal greatwall fuji angkorwat petra forbiddencity burjkhalifa halong",1],
["pl-c-NorthAmerica","Landmarks of North America","liberty goldengate rushmore niagara grandcanyon whitehouse empire spaceneedle gatewayarch brooklyn chichen cntower",1],
["pl-c-SouthAmerica","Landmarks of South America","christ machu iguazu",1],
["pl-c-Africa","Landmarks of Africa","pyramids sphinx victoria kilimanjaro tablemountain",1],
["pl-c-Oceania","Landmarks of Australia","opera uluru harbourbridge",1]
].map(function (r) { return { g: r[0], name: r[1], words: r[2].split(" "), tier: r[3] }; });
