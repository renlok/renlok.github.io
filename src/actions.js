const UserActions = {
    changeRoute: function(newRouteId) {
        player.settings.currentRouteId = newRouteId;
        enemy.generateNew(ROUTES[player.settings.currentRegionId][newRouteId]);
        player.addPokedex(enemy.activePoke().pokeName(), (enemy.activePoke().shiny() ? POKEDEXFLAGS.seenShiny : POKEDEXFLAGS.seenNormal));
        if (enemy.activePoke().shiny()) {
            player.statistics.shinySeen++;
        } else {
            player.statistics.seen++;
        }
        combatLoop.changeEnemyPoke(enemy.activePoke());
        renderView(dom, enemy, player);
        player.savePokes();
        dom.renderRouteList();
    },
    changePokemon: function(newActiveIndex) {
        player.setActive(newActiveIndex);
        combatLoop.changePlayerPoke(player.activePoke());
        renderView(dom, enemy, player)
    },
    deletePokemon: function(event, index) {
        if (event.shiftKey) {
            const pokemon = player.getPokemon()[index];
            player.deletePoke(index);
            const hasPoke = player.hasPokemon(pokemon.pokeName(), pokemon.shiny());
            if (!hasPoke) {
                player.addPokedex(pokemon.pokeName(), (pokemon.shiny() ? POKEDEXFLAGS.releasedShiny : POKEDEXFLAGS.releasedNormal));
            }
            combatLoop.changePlayerPoke(player.activePoke());
            renderView(dom, enemy, player);
            player.savePokes();
            if (pokemon.shiny()) {
                player.settings.releasedShiny++;
            } else {
                player.settings.releasedNormal++;
            }
        } else {
            alert('Hold shift while clicking the X to release a pokemon');
        }
    },
    healAllPlayerPokemons: function() {
        if (player.healAllPokemons() === "healed") {
            dom.gameConsoleLog('Full heal!', 'white');
            combatLoop.refresh();
            renderView(dom, enemy, player)
        }
    },
    changeRegion: function() {
        const regionSelect = document.getElementById('regionSelect');
        const regionId = regionSelect.options[regionSelect.selectedIndex].value;
        if (player.unlocked.regions[regionId]) {
            player.settings.currentRegionId = regionId;
            this.changeRoute(Object.keys(ROUTES[player.settings.currentRegionId])[0]);
        }
        return false;
    },
    enablePokeListDelete: function() {
        player.settings.listView = 'roster';
        dom.renderListBox();
    },
    enablePokeListAutoSort: function() {
        player.settings.autoSort = $('#autoSort').checked;
        // hide or show sort dropdowns
        dom.renderPokeSort();
        dom.renderListBox();
    },
    changeDexView: function() {
        const regionSelect = document.getElementById('dexView');
        player.settings.dexView = regionSelect.options[regionSelect.selectedIndex].value;
        dom.renderPokeDex();
    },
    changeCatchOption: function(newCatchOption) {
        combatLoop.changeCatch(newCatchOption)
    },
    changeListView: function(view) {
        player.settings.listView = view;
        dom.renderListBox();
    },
    clearGameData: function() {
        if (dom.checkConfirmed('#confirmClearData')) {
            localStorage.clear();
            window.location.reload(true)
        }
    },
    clearConsole: function() {
        dom.gameConsoleClear();
    },
    changeSelectedBall: function(newBall) {
        player.changeSelectedBall(newBall)
    },
    pokemonToFirst: function(pokemonIndex) {
        const moveToFirst = (index, arr) => {
            arr.splice(0, 0, arr.splice(index, 1)[0])
        };

        moveToFirst(pokemonIndex, player.getPokemon());
        player.savePokes();
        combatLoop.changePlayerPoke(player.activePoke());
        dom.renderPokeList();
    },
    pokemonToDown: function(pokemonIndex) {
        const moveToDown = index => arr => [
            ...arr.slice(0,parseInt(index)),
            arr[parseInt(index)+1],
            arr[parseInt(index)],
            ...arr.slice(parseInt(index)+2)
        ];
        if (player.getPokemon()[pokemonIndex + 1]) {
            const newPokemonList = moveToDown(pokemonIndex)(player.getPokemon());
            player.reorderPokes(newPokemonList);
            player.savePokes();
            combatLoop.changePlayerPoke(player.activePoke());
            dom.renderPokeList();
        }
    },
    pokemonToUp: function(pokemonIndex) {
        const moveToUp = index => arr => [
            ...arr.slice(0,parseInt(index)-1),
            arr[parseInt(index)],
            arr[parseInt(index)-1],
            ...arr.slice(parseInt(index)+1)
        ];
        if (player.getPokemon()[pokemonIndex - 1]) {
            const newPokemonList = moveToUp(pokemonIndex)(player.getPokemon());
            player.reorderPokes(newPokemonList);
            player.savePokes();
            combatLoop.changePlayerPoke(player.activePoke());
            dom.renderPokeList();
        }
    },
    evolvePokemon: function(pokemonIndex) {
        player.getPokemon()[pokemonIndex].tryEvolve(player.getPokemon()[pokemonIndex].shiny());
        renderView(dom, enemy, player);
    },
    moveToStorage: function(pokemonIndex) {
        const poke = player.getPokemon()[pokemonIndex];
        player.pokemons.splice(pokemonIndex, 1);
        player.storage.push(poke);
        dom.renderPokeList();
    },
    moveToRoster: function(pokemonIndex) {
        const poke = player.storage[pokemonIndex];
        player.storage.splice(pokemonIndex, 1);
        player.pokemons.push(poke);
        dom.renderStorage();
    },
    forceSave: function() {
        player.savePokes();
        $(`#forceSave`).style.display = 'inline';
    },
    exportSaveDialog: function() {
        document.getElementById('saveDialogTitle').innerHTML = 'Export your save';
        if (document.queryCommandSupported('copy')) {
            document.getElementById('copySaveText').style.display = 'initial';
        }
        document.getElementById('saveText').value = player.saveToString();
        document.getElementById('loadButtonContainer').style.display = 'none';
        document.getElementById('saveDialogContainer').style.display = 'block';
        $(`#settingsContainer`).style.display = 'none';
    },
    importSaveDialog: function() {
        document.getElementById('saveDialogTitle').innerHTML = 'Import a save';
        document.getElementById('copySaveText').style.display = 'none';
        document.getElementById('saveText').value = '';
        document.getElementById('loadButtonContainer').style.display = 'block';
        document.getElementById('saveDialogContainer').style.display = 'block';
        $(`#settingsContainer`).style.display = 'none';
    },
    importSave: function() {
        if (window.confirm('Loading a save will overwrite your current progress, are you sure you wish to continue?')) {
            player.loadFromString(document.getElementById('saveText').value.trim());
            document.getElementById('saveDialogContainer').style.display = 'none';
            renderView(dom, enemy, player)
        }
    },
    copySaveText: function() {
        document.getElementById('saveText').select();
        document.execCommand('copy');
        window.getSelection().removeAllRanges()
    },
    changePokeSortOrder: function() {
        player.sortPokemon();
        player.savePokes();
        combatLoop.changePlayerPoke(player.activePoke());
        renderView(dom, enemy, player);
    },
    changeSpriteChoice: function() {
        if (document.getElementById('spriteChoiceFront').checked) {
            player.settings.spriteChoice = 'front';
            document.getElementById('player').className = 'container poke frontSprite'
        } else {
            player.settings.spriteChoice = 'back';
            document.getElementById('player').className = 'container poke'
        }
        player.savePokes();
        renderView(dom, enemy, player)
    },
    viewStatistics: function() {
        let statisticStrings = {
            'seen':'Pokemon Seen',
            'caught':'Pokemon Caught',
            'released':'Pokemon Released',
            'beaten':'Pokemon Beaten',
            'shinySeen':'Shiny Pokemon Seen',
            'shinyCaught':'Shiny Pokemon Caught',
            'shinyReleased':'Shiny Pokemon Released',
            'shinyBeaten':'Shiny Pokemon Beaten',
            'totalDamage':'Total Damage Dealt',
            'totalThrows':'Total Catch Attempts',
            'successfulThrows':'Successfully Caught',
            'pokeballThrows':'Pokeball Throws',
            'pokeballSuccessfulThrows':'Caught with Pokeball',
            'greatballThrows':'Greatball Throws',
            'greatballSuccessfulThrows':'Caught with Greatball',
            'ultraballThrows':'Ultraball Throws',
            'ultraballSuccessfulThrows':'Caught with Ultraball',
        };
        let statList = '';
        for (let statValue in player.statistics) {
            statList += '<li>' + statisticStrings[statValue] + ': ' + player.statistics[statValue] + '</li>';
        }
        document.getElementById('statisticsList').innerHTML = statList;
        document.getElementById('statisticsContainer').style.display = 'block'
    },
    viewSettings: function() {
        document.getElementById('settingsContainer').style.display = 'block';
        $(`#forceSave`).style.display = 'none';
    },
    viewAchievements: function() {
        document.getElementById('achievementsContainer').style.display = 'block';
    },
    shopItems: [
        {
            name: 'Complete Pokedex',
            cost: 100000,
            unlockable: 'completeDex'
        },
        {
            name: 'Pokeball',
            cost: 10,
            ball: 'pokeball'
        },
        {
            name: 'Greatball',
            cost: 100,
            ball: 'greatball'
        },
        {
            name: 'Ultraball',
            cost: 1000,
            ball: 'ultraball'
        },
        {
            name: 'Razz Berry',
            cost: 250000,
            unlockable: 'razzBerry'
        },
        {
            name: 'Old Rod',
            cost: 1000,
            fishing: 1
        },
        {
            name: 'Good Rod',
            cost: 10000,
            fishing: 2
        },
        {
            name: 'Super Rod',
            cost: 100000,
            fishing: 3
        }
    ],
    viewTown: function() {
        let shopHTML = '';
        for (let i = 0; i < this.shopItems.length; i++) {
            let canBuy = true;
            let own = false;
            if (player.currency < this.shopItems[i].cost)
                canBuy = false;
            if (this.shopItems[i].unlockable && player.unlocked[this.shopItems[i].unlockable]) {
                canBuy = false;
                own = true;
            }
            if (this.shopItems[i].fishing && player.unlocked.fishing >= this.shopItems[i].fishing) {
                canBuy = false;
                own = true;
            }
            const disableButton = (!canBuy || own) ? ' disabled="true"' : '';
            const buttonText = (own) ? 'Own' : 'Buy';
            const buttonHTML = ' <button onclick="userInteractions.buyItem(\'' + i + '\')"' + disableButton + '>' + buttonText + '</button>';
            shopHTML += '<li>' + this.shopItems[i].name + ': ¤' + this.shopItems[i].cost + buttonHTML + '</li>';
        }
        $('#shopItems').innerHTML = shopHTML;
        document.getElementById('townContainer').style.display = 'block';
    },
    buyItem: function(index) {
        const item = this.shopItems[index];
        if (player.currency < item.cost) {
            return false;
        } else {
            player.currency -= item.cost;
            if (item.ball) {
                player.ballsAmount[item.ball]++;
                dom.renderBalls();
            }
            if (item.unlockable) {
                player.unlocked[item.unlockable] = 1;
                dom.renderListBox();
            }
            if (item.fishing && item.fishing > player.unlocked.fishing) {
                player.unlocked.fishing = item.fishing;
                dom.renderListBox();
            }
            this.viewTown(); // force refresh of shop
            dom.renderCurrency();
            return true;
        }
    }
};