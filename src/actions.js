const UserActions = {
    changeRoute: function(newRouteId, force = false) {
        if (!force && player.alivePokeIndexes().length == 0) {
            dom.gameConsoleLog('It is too dangerous to travel without a pokemon.', 'red');
            return false;
        }
        player.settings.currentRouteId = newRouteId;
        if (ROUTES[player.settings.currentRegionId][player.settings.currentRouteId]['town']) {
            combatLoop.pause();
        } else {
            combatLoop.unpause();
        }
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
            // you must keep at least one active pokemon
            if (from !== 'roster' || pokeList.length > 1) {
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
                dom.showPopup('You must have one active pokemon!');
            }
        } else {
            alert('Hold shift while clicking the X to release a pokemon');
        }
    },
    changeRegion: function() {
        const regionSelect = document.getElementById('regionSelect');
        const regionId = regionSelect.options[regionSelect.selectedIndex].value;
        if (player.regionUnlocked(regionId)) {
            player.settings.currentRegionId = regionId;
            if (Object.keys(ROUTES[player.settings.currentRegionId])[0].charAt(0) !== '_') {
                this.changeRoute(Object.keys(ROUTES[player.settings.currentRegionId])[0]);
            } else if (Object.keys(ROUTES[player.settings.currentRegionId])[1].charAt(0) !== '_') {
                this.changeRoute(Object.keys(ROUTES[player.settings.currentRegionId])[1]);
            } else {
                this.changeRoute(Object.keys(ROUTES[player.settings.currentRegionId])[2]);
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
            player.purgeData = true;
            window.location.reload(true);
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
            player.reorderPokes(newPokemonList, from);
            if (from === 'roster') {
                combatLoop.changePlayerPoke(player.activePoke());
                dom.renderPokeList();
            } else {
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
            player.reorderPokes(newPokemonList, from);
            if (from === 'roster') {
                combatLoop.changePlayerPoke(player.activePoke());
                dom.renderPokeList();
            } else {
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
        // you must keep at least one active pokemon
        if (player.pokemons.length > 1) {
            const poke = player.getPokemon()[pokemonIndex];
            player.pokemons.splice(pokemonIndex, 1);
            player.storage.push(poke);
            dom.renderPokeList();
        } else {
            dom.showPopup('You must have at least one active pokemon!');
        }
    },
    moveToRoster: function(pokemonIndex) {
        // check you have space
        if (player.pokemons.length < 6) {
            const poke = player.storage[pokemonIndex];
            player.storage.splice(pokemonIndex, 1);
            player.pokemons.push(poke);
            dom.renderStorage();
        } else {
            dom.showPopup('You can only have six active pokemon!');
        }
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
            // reload everything
            renderView(dom, enemy, player);
            dom.renderListBox();
            dom.renderPokeSort();
            dom.renderBalls();
            dom.renderCurrency();
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
        dom.renderStorage();
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
            'totalCurrency':'Total Coin Obtained',
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
        for (let i = 0, count = ACHIEVEMENTS['dex']['caught'].length; i < count; i++) {
            let progress = 0;
            let needed = ACHIEVEMENTS['dex']['caught'][i]['pokes'].length;
            let string = '';
            for (let j = 0; j < needed; j++) {
                let pokeName = ACHIEVEMENTS['dex']['caught'][i]['pokes'][j];
                string += (j > 0) ? ', ' : '';
                if (player.hasDexEntry(pokeName, POKEDEXFLAGS.releasedNormal)) {
                    string += '<s>' + pokeName + '</s>';
                    progress++;
                } else {
                    string += pokeName;
                }
            }
            complete = (progress >= needed);
            completeState = complete ? needed : progress;
            achievementHTML += '<li' + (complete ? ' class="complete"' : '') + '><b>' + ACHIEVEMENTS['dex']['caught'][i].name + '</b>: Catch ' + string  + '</li>';
        }
        document.getElementById('achievementsList').innerHTML = achievementHTML;
        document.getElementById('achievementsContainer').style.display = 'block';
    },
    viewTown: function() {
        town.renderShop();
        town.renderTrader();
        document.getElementById('townContainer').style.display = 'block';
    },
    trainerBattle: function() {
        const routeData = ROUTES[player.settings.currentRegionId][player.settings.currentRouteId];
        if (routeData['trainer']) {
            combatLoop.trainer = true;
            combatLoop.trainerPoke = routeData['trainer'];
            combatLoop.unpause();
            combatLoop.refresh();
        }
    },
    closeStory: function() {
        if (story.canClose) {
            $(`#storyContainer`).style.display = 'none';
        }
    }
};