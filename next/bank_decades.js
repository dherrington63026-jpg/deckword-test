// Remember When: sort events, inventions, films and toys by the decade they arrived. Underscores = spaces.
// pos = how far apart the decades are; easy levels keep chosen decades at least 2 apart.
window.DBANK = [
["d30","1930s","Empire_State Golden_Gate Hindenburg Monopoly Social_Security Wizard_of_Oz Snow_White Superman Hoover_Dam Spam",1,0],
["d40","1940s","Pearl_Harbor D-Day Slinky Polaroid_camera Tupperware LP_records Transistor UN_founded Bikini Casablanca Bambi Jackie_Robinson",1,1],
["d50","1950s","Polio_vaccine Disneyland Sputnik Hula_hoop Frisbee I_Love_Lucy Mr_Potato_Head Rosa_Parks Barbie Peanuts Cat_in_the_Hat Hawaii_statehood Everest_climbed Interstate_highways",1,2],
["d60","1960s","Moon_landing Beatles_in_US Mustang_car Etch_A_Sketch Easy-Bake_Oven Berlin_Wall_built Star_Trek Hot_Wheels Sesame_Street Woodstock Mary_Poppins_film Super_Bowl_I Batman_TV",1,3],
["d70","1970s","Star_Wars Pong Jaws Pet_Rock Mood_rings Walkman Apple_founded Microsoft_founded Happy_Days Grease Skylab Space_Invaders Watergate Roots Rocky",1,4],
["d80","1980s","IBM_PC MTV Pac-Man Rubik’s_Cube Thriller Cabbage_Patch_Kids CD_players Challenger Chernobyl Back_to_the_Future Berlin_Wall_falls Game_Boy Nintendo_NES Cheers Live_Aid Top_Gun Ghostbusters",1,5],
["d90","1990s","World_Wide_Web Windows_95 Titanic_film Dolly_the_sheep Friends_TV Tamagotchi Furby Beanie_Babies Amazon_founded Google_founded Toy_Story Jurassic_Park Pokémon iMac Spice_Girls Hubble_launched DVD_players",1,6],
["d00","2000s","iPod Wikipedia Facebook YouTube iPhone Twitter Nintendo_Wii Kindle Shrek Netflix_streaming Obama_elected Google_Maps Android_phones Avatar_film Guitar_Hero Euro_coins Pluto_demoted Mars_rover_Spirit",1,7],
["d10","2010s","iPad Instagram Snapchat Game_of_Thrones Frozen_film Pokémon_Go Fortnite Apple_Watch Amazon_Echo Black_Panther_film Disney_Plus Tesla_Model_S Higgs_boson Avengers_Endgame",1,8]
].map(function (r) { return { g: r[0], name: r[1], words: r[2].split(" "), tier: r[3], pos: r[4] }; });
