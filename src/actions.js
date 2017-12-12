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
    deletePokemon: function(event, index, from = 'roster') {
        const pokeList = (from === 'roster') ? player.getPokemon() : player.storage;
        if (event.shiftKey) {
            const pokemon = pokeList[index];
            player.deletePoke(index, from);
            const hasPoke = player.hasPokemon(pokemon.pokeName(), pokemon.shiny());
            if (!hasPoke) {
                player.addPokedex(pokemon.pokeName(), (pokemon.shiny() ? POKEDEXFLAGS.releasedShiny : POKEDEXFLAGS.releasedNormal));
            }
            if (from === 'roster') {
                combatLoop.changePlayerPoke(player.activePoke());
                renderView(dom, enemy, player);
            } else {
                dom.renderStorage();
            }
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
        if (player.regionUnlocked(regionId)) {
            player.settings.currentRegionId = regionId;
            if (Object.keys(ROUTES[player.settings.currentRegionId])[0] !== '_unlock') {
                this.changeRoute(Object.keys(ROUTES[player.settings.currentRegionId])[0]);
            } else {
                this.changeRoute(Object.keys(ROUTES[player.settings.currentRegionId])[1]);
            }
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
    pokemonToFirst: function(pokemonIndex, from = 'roster') {
        const pokeList = (from === 'roster') ? player.getPokemon() : player.storage;
        const moveToFirst = (index, arr) => {
            arr.splice(0, 0, arr.splice(index, 1)[0])
        };

        moveToFirst(pokemonIndex, pokeList);
        player.savePokes();
        if (from === 'roster') {
            combatLoop.changePlayerPoke(player.activePoke());
            dom.renderPokeList();
        } else {
            dom.renderStorage();
        }
    },
    pokemonToDown: function(pokemonIndex, from = 'roster') {
        const pokeList = (from === 'roster') ? player.getPokemon() : player.storage;
        const moveToDown = index => arr => [
            ...arr.slice(0,parseInt(index)),
            arr[parseInt(index)+1],
            arr[parseInt(index)],
            ...arr.slice(parseInt(index)+2)
        ];
        if (pokeList[pokemonIndex + 1]) {
            const newPokemonList = moveToDown(pokemonIndex)(pokeList);
            if (from === 'roster') {
                player.reorderPokes(newPokemonList);
                combatLoop.changePlayerPoke(player.activePoke());
                dom.renderPokeList();
            } else {
                player.storage = newPokemonList;
                dom.renderStorage();
            }
            player.savePokes();
        }
    },
    pokemonToUp: function(pokemonIndex, from = 'roster') {
        const pokeList = (from === 'roster') ? player.getPokemon() : player.storage;
        const moveToUp = index => arr => [
            ...arr.slice(0,parseInt(index)-1),
            arr[parseInt(index)],
            arr[parseInt(index)-1],
            ...arr.slice(parseInt(index)+1)
        ];
        if (pokeList[pokemonIndex - 1]) {
            const newPokemonList = moveToUp(pokemonIndex)(pokeList);
            if (from === 'roster') {
                player.reorderPokes(newPokemonList);
                combatLoop.changePlayerPoke(player.activePoke());
                dom.renderPokeList();
            } else {
                player.storage = newPokemonList;
                dom.renderStorage();
            }
            player.savePokes();
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
            'sold':'Pokemon Sold',
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
            'totalCurrency':'Total Currency Obtained',
            'totalExp':'Total Experience Earned'
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
        let achievementHTML = '';
        let completeState, complete;
        for (let subgroup in ACHIEVEMENTS['statistics']) {
            for (let i = 0, count = ACHIEVEMENTS['statistics'][subgroup].length; i < count; i++) {
                complete = (player['statistics'][subgroup] >= ACHIEVEMENTS['statistics'][subgroup][i].value);
                completeState = complete ? ACHIEVEMENTS['statistics'][subgroup][i].value : player['statistics'][subgroup];
                achievementHTML += '<li' + (complete ? ' class="complete"' : '') + '><b>' + ACHIEVEMENTS['statistics'][subgroup][i].name + '</b>: ' + camalCaseToString(subgroup) + ' ' + completeState + '/' + ACHIEVEMENTS['statistics'][subgroup][i].value  + '</li>';
            }
        }
        for (let i = 0, count = ACHIEVEMENTS['dex']['caughtCount'].length; i < count; i++) {
            let progress = player.countPokedex(POKEDEXFLAGS.releasedNormal);
            complete = (progress >= ACHIEVEMENTS['dex']['caughtCount'][i].value);
            completeState = complete ? ACHIEVEMENTS['dex']['caughtCount'][i].value : progress;
            achievementHTML += '<li' + (complete ? ' class="complete"' : '') + '><b>' + ACHIEVEMENTS['dex']['caughtCount'][i].name + '</b>: Unique Caught ' + completeState + '/' + ACHIEVEMENTS['dex']['caughtCount'][i].value  + '</li>';
        }
        document.getElementById('achievementsList').innerHTML = achievementHTML;
        document.getElementById('achievementsContainer').style.display = 'block';
    },
    viewTown: function() {
        town.renderShop();
        town.renderTrader();
        document.getElementById('townContainer').style.display = 'block';
    }
};