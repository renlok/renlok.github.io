'use strict';

const pokeById = (id) => POKEDEX[id - 1];
const pokeByName = (name) => POKEDEX.filter((el) => el.pokemon[0].Pokemon === name)[0];

const EXP_TABLE = {};
EXP_TABLE["Slow"] = [1, 2, 10, 33, 80, 156, 270, 428, 640, 911, 1250, 1663, 2160, 2746, 3430, 4218, 5120, 6141, 7290, 8573, 10000, 11576, 13310, 15208, 17280, 19531, 21970, 24603, 27440, 30486, 33750, 37238, 40960, 44921, 49130, 53593, 58320, 63316, 68590, 74148, 80000, 86151, 92610, 99383, 106480, 113906, 121670, 129778, 138240, 147061, 156250, 165813, 175760, 186096, 196830, 207968, 219520, 231491, 243890, 256723, 270000, 283726, 297910, 312558, 327680, 343281, 359370, 375953, 393040, 410636, 428750, 447388, 466560, 486271, 506530, 527343, 548720, 570666, 593190, 616298, 640000, 664301, 689210, 714733, 740880, 767656, 795070, 823128, 851840, 881211, 911250, 941963, 973360, 1005446, 1038230, 1071718, 1105920, 1140841, 1176490, 1212873, 999999999999999999];
EXP_TABLE["Medium Slow"] = [1, 2, 9, 57, 96, 135, 179, 236, 314, 419, 560, 742, 973, 1261, 1612, 2035, 2535, 3120, 3798, 4575, 5460, 6458, 7577, 8825, 10208, 11735, 13411, 15244, 17242, 19411, 21760, 24294, 27021, 29949, 33084, 36435, 40007, 43808, 47846, 52127, 56660, 61450, 66505, 71833, 77440, 83335, 89523, 96012, 102810, 109923, 117360, 125126, 133229, 141677, 150476, 159635, 169159, 179056, 189334, 199999, 211060, 222522, 234393, 246681, 259392, 272535, 286115, 300140, 314618, 329555, 344960, 360838, 377197, 394045, 411388, 429235, 447591, 466464, 485862, 505791, 526260, 547274, 568841, 590969, 613664, 636935, 660787, 685228, 710266, 735907, 762160, 789030, 816525, 844653, 873420, 902835, 932903, 963632, 995030, 1027103, 999999999999999999];
EXP_TABLE["Medium Fast"] = [1, 2, 8, 27, 64, 125, 216, 343, 512, 729, 1000, 1331, 1728, 2197, 2744, 3375, 4096, 4913, 5832, 6859, 8000, 9261, 10648, 12167, 13824, 15625, 17576, 19683, 21952, 24389, 27000, 29791, 32768, 35937, 39304, 42875, 46656, 50653, 54872, 59319, 64000, 68921, 74088, 79507, 85184, 91125, 97336, 103823, 110592, 117649, 125000, 132651, 140608, 148877, 157464, 166375, 175616, 185193, 195112, 205379, 216000, 226981, 238328, 250047, 262144, 274625, 287496, 300763, 314432, 328509, 343000, 357911, 373248, 389017, 405224, 421875, 438976, 456533, 474552, 493039, 512000, 531441, 551368, 571787, 592704, 614125, 636056, 658503, 681472, 704969, 729000, 753571, 778688, 804357, 830584, 857375, 884736, 912673, 941192, 970299, 999999999999999999];
EXP_TABLE["Fast"] = [1, 2, 6, 21, 51, 100, 172, 274, 409, 583, 800, 1064, 1382, 1757, 2195, 2700, 3276, 3930, 4665, 5487, 6400, 7408, 8518, 9733, 11059, 12500, 14060, 15746, 17561, 19511, 21600, 23832, 26214, 28749, 31443, 34300, 37324, 40522, 43897, 47455, 51200, 55136, 59270, 63605, 68147, 72900, 77868, 83058, 88473, 94119, 100000, 106120, 112486, 119101, 125971, 133100, 140492, 148154, 156089, 164303, 172800, 181584, 190662, 200037, 209715, 219700, 229996, 240610, 251545, 262807, 274400, 286328, 298598, 311213, 324179, 337500, 351180, 365226, 379641, 394431, 409600, 425152, 441094, 457429, 474163, 491300, 508844, 526802, 545177, 563975, 583200, 602856, 622950, 643485, 664467, 685900, 707788, 730138, 752953, 776239, 999999999999999999];

const COLORS = {};
COLORS['route'] = {};
COLORS['route']['locked'] = 'rgb(167, 167, 167)';
COLORS['route']['unlocked'] = 'rgb(53, 50, 103)';
COLORS['route']['current'] = 'rgb(51, 111, 22)';

const POKEDEXFLAGS = {};
POKEDEXFLAGS['unseen'] = 0;
POKEDEXFLAGS['seenNormal'] = 1;
POKEDEXFLAGS['seenShiny'] = 2;
POKEDEXFLAGS['releasedNormal'] = 3; // from releasing into wild
POKEDEXFLAGS['releasedShiny'] = 4; // from releasing into wild
POKEDEXFLAGS['ownedNormal'] = 5; // from evolution
POKEDEXFLAGS['ownNormal'] = 6; // in current rosta
POKEDEXFLAGS['ownedShiny'] = 7; // from evolution
POKEDEXFLAGS['ownShiny'] = 8; // in current rosta

const BALLRNG = {
    pokeball: 1,
    greatball: 1.5,
    ultraball: 2
};

const gameVersionMajor = '0';
const gameVersionMinor = '0';
const gameVersionPatch = '2';
const gameVersion = gameVersionMajor + '.' + gameVersionMinor + '.' + gameVersionPatch;
$('#version').innerHTML = 'Version ' + gameVersion;

const makeEnemy = (starter) => {
    let active = starter;

    const generateNew = (routeData) => {
        let pokemonList = [];
        if (routeData.fishing) {
            for (let i = player.unlocked.fishing; i > 0; i--) {
                if (routeData.pokes[i]) {
                    pokemonList = mergeArray(pokemonList, routeData.pokes[i]);
                }
            }
        } else {
            pokemonList = routeData.pokes;
        }
        const poke = pokeByName(randomArrayElement(pokemonList));
        return new Poke(
            poke,
            routeData.minLevel + Math.round((Math.random() * (routeData.maxLevel - routeData.minLevel))),
            false,
            Math.random() < (1 / (1 << 5 << 8))
        )
    };

    return {
        activePoke: () => active,
        generateNew: (recipe) => active = generateNew(recipe)
    }
};

// load everything we need
let player = Player;
let enemy = makeEnemy();
const town = Town;
const dom = Display;
const combatLoop = Combat;
const userInteractions = UserActions;
// load old save data
if (localStorage.getItem(`totalPokes`) !== null) {
    player.loadPokes();
    dom.refreshCatchOption(player.settings.catching);
} else {
    let starterPoke = new Poke(pokeById(randomArrayElement([1, 4, 7])), 5);
    player.addPoke(starterPoke);
    player.addPokedex(starterPoke.pokeName(), POKEDEXFLAGS.ownNormal);
    dom.gameConsoleLog('You received a ' + player.activePoke().pokeName(), 'purple');
}

enemy.generateNew(ROUTES[player.settings.currentRegionId][player.settings.currentRouteId]);

if (player.settings.spriteChoice === 'front') {
    document.getElementById('spriteChoiceFront').checked = true;
    document.getElementById('player').className += ' frontSprite'
} else {
    document.getElementById('spriteChoiceBack').checked = true
}

dom.bindEvents();
dom.renderBalls();
dom.renderCurrency();

renderView(dom, enemy, player);
dom.renderListBox();
dom.renderRegionSelect();
dom.renderPokeSort();

combatLoop.init();

requestAnimationFrame(function renderTime() {
    dom.renderHeal(player.canHeal());
    requestAnimationFrame(renderTime)
});
