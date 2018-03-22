let Poke = function(pokeModel, initialLevel, initialExp, shiny, caughtAt) {
    this.poke = cloneJsonObject(pokeModel);
    this.expTable = EXP_TABLE[this.poke.stats[0]["growth rate"]];
    this.exp = initialLevel && this.expTable[initialLevel - 1] || initialExp;
    this.isShiny = (shiny === true);
    this.caughtAt = caughtAt || Date.now();
    this.hp = this.setHpValue(this.poke.stats[0].hp) * 3;
};
Poke.prototype.currentLevel = function() {
    return this.expTable
        .filter((xp_requirement) => xp_requirement <= this.exp)
        .length;
};
Poke.prototype.statValue = function(raw) {
    return Math.floor((((raw + 50) * this.currentLevel()) / 150))
};
Poke.prototype.setHpValue = function(rawHp) {
    return Math.floor(((rawHp * this.currentLevel()) / 40))
};
Poke.prototype.tryEvolve = function(shiny) {
    const pokemonHasEvolution =
        EVOLUTIONS[this.poke.pokemon[0].Pokemon] !== undefined;
    if (pokemonHasEvolution) {
        const oldPokemon = this.poke.pokemon[0].Pokemon;
        const evolution = EVOLUTIONS[this.poke.pokemon[0].Pokemon].to;
        const levelToEvolve = Number(EVOLUTIONS[this.poke.pokemon[0].Pokemon].level);
        if (this.currentLevel() >= levelToEvolve) {
            this.poke = cloneJsonObject(pokeByName(evolution));
            player.addPokedex(evolution, (shiny ? POKEDEXFLAGS.ownShiny : POKEDEXFLAGS.ownNormal));
            if (!player.hasPokemon(oldPokemon, shiny)) {
                player.addPokedex(oldPokemon, (shiny ? POKEDEXFLAGS.ownedShiny : POKEDEXFLAGS.ownedNormal))
            }
        }
    }
};
Poke.prototype.canEvolve = function() {
    // pokemon Has Evolution
    if (EVOLUTIONS[this.poke.pokemon[0].Pokemon] !== undefined) {
        const levelToEvolve = Number(EVOLUTIONS[this.poke.pokemon[0].Pokemon].level);
        if (this.currentLevel() >= levelToEvolve) {
            return true;
        }
    }
    return false;
};

Poke.prototype.setHp = function(hp) { this.hp = hp; };
Poke.prototype.getHp = function() { return this.hp; };
Poke.prototype.maxHp = function() { return this.setHpValue(this.poke.stats[0].hp) * 3; };
Poke.prototype.attack = function() { return this.statValue(this.poke.stats[0].attack); };
Poke.prototype.defense = function() { return this.statValue(this.poke.stats[0].defense); };
Poke.prototype.spAttack = function() { return this.statValue(this.poke.stats[0]['sp atk']); };
Poke.prototype.spDefense = function() { return this.statValue(this.poke.stats[0]['sp def']); };
Poke.prototype.speed = function() { return this.statValue(this.poke.stats[0].speed); };
Poke.prototype.avgDefense = function() { return (this.defense() + this.spDefense())/2; };

Poke.prototype.pokeName = function() {
    return this.poke.pokemon[0].Pokemon;
};
Poke.prototype.image = function() {
    const imageType = (this.isShiny ? 'shiny' : 'normal');
    return {
        front: this.poke.images[imageType].front,
        back: this.poke.images[imageType].back
    }
};
Poke.prototype.shiny = function() {
    return this.isShiny
};
Poke.prototype.types = function() { return this.poke.stats[0].types; };
Poke.prototype.catchRate = function() { return Number(this.poke.stats[0]['catch rate']); };
Poke.prototype.lifeAsText = function() { return '' + (this.getHp() < 0 ? 0 : this.getHp()) + ' / ' + this.maxHp(); };
Poke.prototype.alive = function() { return this.getHp() > 0; };
Poke.prototype.giveExp = function(amount) {
    this.exp += amount;
};
Poke.prototype.currentExp = function() { return this.exp; };
Poke.prototype.nextLevelExp = function() { return this.expTable[this.currentLevel()]; };
Poke.prototype.thisLevelExp = function() { return this.expTable[this.currentLevel() - 1] || 10; };
Poke.prototype.level = function() { return this.currentLevel(); };
Poke.prototype.attackSpeed = function() {
    const speed = Math.floor(1000 / (500 + this.speed()) * 800);
    if (speed <= 300) {
        return 300;
    } else {
        return speed;
    }
};
Poke.prototype.avgAttack = function() { return (this.attack() + this.spAttack())/2; };
Poke.prototype.takeDamage = function(enemyAttack) {
    const damageToTake = (enemyAttack - this.avgDefense() / 10) > 0
        && Math.ceil((enemyAttack - this.avgDefense() / 10) * ((Math.random() + 0.1) * 2) / 100)
        || 0;
    this.setHp(this.getHp() - damageToTake);
    return damageToTake;
};
Poke.prototype.baseExp = function() { return Number(this.poke.exp[0]['base exp']); };
Poke.prototype.heal = function() { return this.setHp(this.maxHp()); };
Poke.prototype.save = function() { return [this.poke.pokemon[0].Pokemon, this.exp, this.isShiny, this.caughtAt]; };

const makeRandomPoke = (level) => new Poke(randomArrayElement(POKEDEX), level);