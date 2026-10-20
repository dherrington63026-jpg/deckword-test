// Foods of the World: sort dishes by the country they come from (real photos made on this PC, pics/<id>.webp).
// Only dishes that are clearly "from" one country; dishes that belong to many cuisines are left out.
window.FBANK = [
["f-it","Italian","lasagna spaghetti risotto tiramisu gnocchi bruschetta ravioli",1],
["f-jp","Japanese","sushi ramen tempura misosoup onigiri takoyaki mochi",1],
["f-mx","Mexican","enchiladas guacamole tamales quesadilla nachos tostada tacos",1],
["f-fr","French","croissant baguette crepes macarons escargot quiche eclair",1],
["f-in","Indian","butterchicken naan samosa biryani tandoori dosa gulabjamun",2],
["f-cn","Chinese","dumplings friedrice springrolls chowmein dimsum pekingduck wontonsoup",2],
["f-gr","Greek","gyro souvlaki baklava moussaka spanakopita greeksalad tzatziki",2],
["f-de","German","bratwurst spaetzle sauerkraut sauerbraten pretzel currywurst blackforest",2]
].map(function (r) { return { g: r[0], name: r[1], words: r[2].split(" "), tier: r[3] }; });
