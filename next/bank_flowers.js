// Flowers: sort flower photos by type or by color. Lists are derived from a table (each flower has one type and one color).
window.FLBANK = [
["fl-t-bulb","Spring bulbs","tulip daffodil crocus hyacinth snowdrop amaryllis",1],
["fl-t-wild","Wildflowers","dandelion daisy buttercup bluebell cornflower poppy foxglove lupine forgetmenot",1],
["fl-t-tropical","Tropical flowers","hibiscus orchid birdofparadise plumeria anthurium",1],
["fl-t-garden","Garden favorites","rose peony hydrangea lavender marigold sunflower lily carnation iris geranium petunia tigerlily",1],
["fl-t-tree","Blossoming trees and shrubs","cherryblossom magnolia azalea lilac dogwood camellia wisteria jasmine gardenia",1],
["fl-c-red","Red flowers","tulip amaryllis poppy hibiscus anthurium rose geranium",1],
["fl-c-yellow","Yellow flowers","daffodil dandelion buttercup sunflower",1],
["fl-c-purple","Purple flowers","crocus hyacinth foxglove lupine lavender iris petunia lilac wisteria",1],
["fl-c-white","White flowers","snowdrop daisy plumeria lily magnolia dogwood jasmine gardenia",1],
["fl-c-pink","Pink flowers","orchid peony carnation cherryblossom azalea camellia",1],
["fl-c-blue","Blue flowers","bluebell cornflower forgetmenot hydrangea",1],
["fl-c-orange","Orange flowers","birdofparadise marigold tigerlily",1]
].map(function (r) { return { g: r[0], name: r[1], words: r[2].split(" "), tier: r[3] }; });
