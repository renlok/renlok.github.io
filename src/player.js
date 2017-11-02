let Player = {
    pokemons: [],
    pokedexData: [],
    activePokeID: 0,
    lastHeal: Date.now(),
    selectedBall: "pokeball",
    ballsAmount: {
        pokeball: 20,
        greatball: 0,
        ultraball: 0
    },
    settings: {
        currentRegionId: 'Kanto',
        currentRouteId: 'starter',
        dexView: 'all',
        dexVersion: 194, // check if users dex is out of date
        spriteChoice: 'back',
        catching: false
    },
    statistics: {
        'seen':0,
        'caught':0,
        'released':0,
        'beaten':0,
        'shinySeen':0,
        'shinyCaught':0,
        'shinyReleased':0,
        'shinyBeaten':0,
        'totalDamage':0,
        'totalThrows':0,
        'successfulThrows':0,
        'pokeballThrows':0,
        'pokeballSuccessfulThrows':0,
        'greatballThrows':0,
        'greatballSuccessfulThrows':0,
        'ultraballThrows':0,
        'ultraballSuccessfulThrows':0,
    },
    canHeal: function() {
        if ((Date.now() - this.lastHeal) > 30000) {
            return true;
        }
        else {
            return Date.now() - this.lastHeal;
        }
    },
    checksum: function(s) {
        let chk = 0x12345678;
        const len = s.length;
        for (let i = 0; i < len; i++) {
            chk += (s.charCodeAt(i) * (i + 1));
        }
        return (chk & 0xffffffff).toString(16);
    },
    addPoke: function(poke) {
        this.pokemons.push(poke);
    },
    addPokedex: function(pokeName, flag) {
        // helper to search dex array for a string
        function findFlag(obj){ return (this == obj.name) }
        const dexEntry = this.pokedexData.find(findFlag, pokeName);
        if (typeof dexEntry === 'object') {
            if (dexEntry.flag < flag ||
                (dexEntry.flag == POKEDEXFLAGS.ownShiny && flag == POKEDEXFLAGS.releasedShiny) || // own can be released
                (dexEntry.flag == POKEDEXFLAGS.ownNormal && flag == POKEDEXFLAGS.releasedNormal) ||
                (dexEntry.flag == POKEDEXFLAGS.ownShiny && flag == POKEDEXFLAGS.ownedShiny) || // own can be come owned
                (dexEntry.flag == POKEDEXFLAGS.ownNormal && flag == POKEDEXFLAGS.ownedNormal)) {
                this.pokedexData[this.pokedexData.indexOf(dexEntry)].flag = flag
            }
        } else {
            this.pokedexData.push({name: pokeName, flag: flag})
        }
    },
    setActive: function(index) {
        this.activePokeID = index;
    },
    activePoke: function() { return this.pokemons[this.activePokeID] },
    getPokemon: function() { return this.pokemons },
    getPokedexData: function() { return this.pokedexData },
    reorderPokes: function(newList) {
        this.pokemons = newList;
    },
    cmpFunctions: {
        lvl: (lhs, rhs) => {
            return lhs.level() - rhs.level()
        },
        dex: (lhs, rhs) => {
            let index = p => POKEDEX.findIndex(x=>x.pokemon[0].Pokemon == p.pokeName());
            return index(lhs) - index(rhs)
        },
        vlv: (lhs, rhs) => {
            return lhs.level() - rhs.level() || lhs.avgAttack() - rhs.avgAttack();
        },
        time: (lhs, rhs) => {
            return lhs.caughtAt - rhs.caughtAt;
        },
    },
    inverseCmp: function(cmpFunc) {
        return (lhs, rhs) => -cmpFunc(lhs, rhs);
    },
    sortPokemon: function() {
        const dirSelect = document.getElementById('pokeSortDirSelect');
        const direction = dirSelect.options[dirSelect.selectedIndex].value;
        const orderSelect = document.getElementById('pokeSortOrderSelect');
        const sortOrder = orderSelect.options[orderSelect.selectedIndex].value;
        let cmpFunc = this.cmpFunctions[sortOrder];
        if (direction === 'desc') {
            cmpFunc = this.inverseCmp(cmpFunc)
        }
        player.reorderPokes(player.getPokemon().sort(cmpFunc));
    },
    healAllPokemons: function() {
        if (this.canHeal() === true) {
            this.pokemons.forEach((poke) => poke.heal());
            this.lastHeal = Date.now();
            return "healed"
        }
        return this.canHeal()
    },
    hasPokemon: function(pokemonName, shiny) {
        return typeof this.pokemons.find(function(obj){ return (this[0] == obj.pokeName() && this[1] == obj.shiny()); }, [pokemonName, shiny]) != 'undefined';
    },
    deletePoke: function(index) {
        if (index !== this.activePokeID) {
            this.pokemons.splice(index, 1);
            if (index < this.activePokeID) {
                this.activePokeID -= 1;
            }
        }
    },
    ballRNG: function(ballName) {
        return BALLRNG[ballName];
    },
    changeSelectedBall: function(newBall) {
        this.selectedBall = newBall
    },
    consumeBall: function(ballName) {
        if (this.ballsAmount[ballName] > 0) {
            this.ballsAmount[ballName] -= 1;
            return true;
        }
        return false;
    },
    bestAvailableBall: function() {
        const ballsFromBestToWorst = ['ultraball', 'greatball', 'pokeball'];
        for (let i = 0; i < ballsFromBestToWorst.length; i++) {
            if (this.ballsAmount[ballsFromBestToWorst[i]] > 0) {
                return ballsFromBestToWorst[i];
            }
        }
    },
    addBalls: function(ballName, amount) {
        this.ballsAmount[ballName] += amount;
    },
    // Load and Save functions
    savePokes: function() {
        localStorage.setItem(`totalPokes`, this.pokemons.length);
        this.pokemons.forEach((poke, index) => {
            localStorage.setItem(`poke${index}`, JSON.stringify(poke.save()))
        });
        localStorage.setItem(`ballsAmount`, JSON.stringify(this.ballsAmount));
        localStorage.setItem(`pokedexData`, JSON.stringify(this.pokedexData));
        localStorage.setItem(`statistics`, JSON.stringify(this.statistics));
        localStorage.setItem(`settings`, JSON.stringify(this.settings));
    },
    saveToString: function() {
        const saveData = JSON.stringify({
            pokes: this.pokemons.map((poke) => poke.save()),
            pokedexData: this.pokedexData,
            statistics: this.statistics,
            settings: this.settings,
            ballsAmount: this.ballsAmount
        });
        return btoa(this.checksum(saveData) + '|' + saveData)
    },
    loadPokes: function() {
        // reset pokemon array
        this.pokemons = [];
        Array(Number(localStorage.getItem(`totalPokes`))).fill(0).forEach((el, index) => {
            const loadedPoke = JSON.parse(localStorage.getItem('poke'+index));
            if (loadedPoke) {
                const pokeName = loadedPoke[0];
                const exp = loadedPoke[1];
                const shiny = (loadedPoke[2] === true);
                const caughtAt = loadedPoke[3];
                this.pokemons.push(new Poke(pokeByName(pokeName), false, Number(exp), shiny, caughtAt));
            }
        });
        if (JSON.parse(localStorage.getItem('ballsAmount'))) {
            this.ballsAmount = JSON.parse(localStorage.getItem('ballsAmount'));
        }
        if (JSON.parse(localStorage.getItem('pokedexData'))) {
            this.pokedexData = JSON.parse(localStorage.getItem('pokedexData'));
        } else {
            this.pokedexData = [];
        }
        if (JSON.parse(localStorage.getItem('statistics'))) {
            let loadedStats = JSON.parse(localStorage.getItem('statistics'));
            this.statistics = Object.assign({}, this.statistics, loadedStats);
        }
        if (JSON.parse(localStorage.getItem('settings'))) {
            this.settings = JSON.parse(localStorage.getItem('settings'));
        }
    },
    loadFromString: function(saveData) {
        saveData = atob(saveData);
        saveData = saveData.split('|');
        if (this.checksum(saveData[1]) === saveData[0]) {
            try {
                saveData = JSON.parse(saveData[1])
            } catch (err) {
                alert('Failed to parse save data, loading canceled!');
                return;
            }
            this.pokemons = [];
            saveData.pokes.forEach((loadedPoke) => {
                const pokeName = loadedPoke[0];
                const exp = loadedPoke[1];
                const shiny = (loadedPoke[2] === true);
                const caughtAt = loadedPoke[3];
                this.pokemons.push(new Poke(pokeByName(pokeName), false, Number(exp), shiny, caughtAt))
            });
            this.ballsAmount = saveData.ballsAmount;
            this.pokedexData = saveData.pokedexData ? saveData.pokedexData : [];
            let loadedStats = saveData.statistics ? saveData.statistics : {};
            this.statistics = Object.assign({}, this.statistics, loadedStats);
            if (saveData.settings) {
                this.settings = saveData.settings;
            }
        } else {
            alert('Invalid save data, loading canceled!');
        }
    }
};