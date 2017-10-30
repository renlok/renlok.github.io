const Combat = {
    playerActivePoke: null,
    enemyActivePoke: null,
    playerTimerId: null,
    enemyTimerId: null,
    catchEnabled: false,
    playerTimer: function() {
        this.playerTimerId = window.setTimeout(
            () => this.dealDamage(this.playerActivePoke, this.enemyActivePoke, 'player'),
            this.playerActivePoke.attackSpeed()
        )
    },
    enemyTimer: function() {
        this.enemyTimerId = window.setTimeout(
            () => this.dealDamage(this.enemyActivePoke, this.playerActivePoke, 'enemy'),
            this.enemyActivePoke.attackSpeed()
        )
    },
    calculateDamageMultiplier: function(attackingTypes, defendingTypes) {
        const typeEffectiveness = (attackingType, defendingTypes) =>
            TYPES[attackingType][defendingTypes[0]] * (defendingTypes[1] && TYPES[attackingType][defendingTypes[1]] || 1);
        return Math.max(
            typeEffectiveness(attackingTypes[0], defendingTypes),
            attackingTypes[1] && typeEffectiveness(attackingTypes[1], defendingTypes) || 0
        )
    },
    eventTimerActive: true,
    eventTimerExpires: 1509408000,
    dealDamage: function(attacker, defender, who) {
        if (attacker.alive() && defender.alive()) {
            // both alive
            const damageMultiplier = this.calculateDamageMultiplier(attacker.types(), defender.types());
            const damage = defender.takeDamage(attacker.avgAttack() * damageMultiplier);
            if (who === 'player') {
                dom.attackAnimation('playerImg', 'right');
                dom.gameConsoleLog(attacker.pokeName() + ' Attacked for ' + damage, 'green');
                player.statistics.totalDamage += damage;
                this.playerTimer()
            }
            if (who === 'enemy') {
                dom.attackAnimation('enemyImg', 'left');
                dom.gameConsoleLog(attacker.pokeName() + ' Attacked for ' + damage, 'rgb(207, 103, 59)');
                this.enemyTimer()
            }
            dom.renderPokeOnContainer('enemy', enemy.activePoke());
            dom.renderPokeOnContainer('player', player.activePoke(), player.settings.spriteChoice || 'back');
        }
        if (!attacker.alive() || !defender.alive()) {
            // one is dead
            window.clearTimeout(this.playerTimerId);
            window.clearTimeout(this.enemyTimerId);

            if ((who === 'enemy') && !attacker.alive()
                || (who === 'player') && !defender.alive())
            {
                //enemyActivePoke is dead
                if (enemy.activePoke().shiny()) {
                    player.statistics.shinyBeaten++;
                } else {
                    player.statistics.beaten++;
                }
                this.attemptCatch();
                this.findPokeballs();

                const beforeExp = player.getPokemon().map((poke) => poke.level());
                const expToGive = (this.enemyActivePoke.baseExp() / 16) + (this.enemyActivePoke.level() * 3);
                this.playerActivePoke.giveExp(expToGive);
                dom.gameConsoleLog(this.playerActivePoke.pokeName() + ' won ' + Math.floor(expToGive) + 'xp', 'rgb(153, 166, 11)');
                player.getPokemon().forEach((poke) => poke.giveExp((this.enemyActivePoke.baseExp() / 100) + (this.enemyActivePoke.level() / 10)));
                const afterExp = player.getPokemon().map((poke) => poke.level());

                if (beforeExp.join('') !== afterExp.join('')) {
                    dom.renderPokeList('playerPokes', player.getPokemon(), player, '#enableDelete')
                }

                player.savePokes();
                if (this.eventTimerActive && Math.floor((new Date()).getTime() / 1000) >= this.eventTimerExpires) {
                    location.reload(true); //TODO what does this do?
                } else {
                    enemy.generateNew(ROUTES[player.settings.currentRegionId][player.settings.currentRouteId]);
                    this.enemyActivePoke = enemy.activePoke();
                    player.addPokedex(enemy.activePoke().pokeName(), (enemy.activePoke().shiny() ? POKEDEXFLAGS.seenShiny : POKEDEXFLAGS.seenNormal));
                    if (enemy.activePoke().shiny()) {
                        player.statistics.shinySeen++;
                    } else {
                        player.statistics.seen++;
                    }
                    this.enemyTimer();
                    this.playerTimer();
                    dom.renderPokeOnContainer('player', player.activePoke(), player.settings.spriteChoice || 'back');
                    dom.renderPokeDex('playerPokes', player.getPokedexData())
                }
            } else {
                dom.gameConsoleLog(this.playerActivePoke.pokeName() + ' Fainted! ');
                const playerLivePokesIndexes = player.getPokemon().filter((poke, index) => {
                    if (poke.alive()) {
                        return true;
                    }
                });
                if (playerLivePokesIndexes.length > 0) {
                    player.setActive(player.getPokemon().indexOf(playerLivePokesIndexes[0]));
                    this.playerActivePoke = player.activePoke();
                    dom.gameConsoleLog('Go ' + this.playerActivePoke.pokeName() + '!');
                    this.refresh();
                }
                dom.renderPokeList('playerPokes', player.getPokemon(), player, '#enableDelete')
            }
            dom.renderPokeOnContainer('enemy', enemy.activePoke())
        }
    },
    attemptCatch: function() {
        if (this.catchEnabled == 'all' || (this.catchEnabled == 'new' && !player.hasPokemon(enemy.activePoke().pokeName(), 0)) || enemy.activePoke().shiny()) {
            dom.gameConsoleLog('Trying to catch ' + enemy.activePoke().pokeName() + '...', 'purple');
            const selectedBall = (enemy.activePoke().shiny() ? player.bestAvailableBall() : player.selectedBall);
            if (player.consumeBall(selectedBall)) {
                // add throw to statistics
                player.statistics.totalThrows++;
                player.statistics[selectedBall+'Throws']++;
                dom.renderBalls(player.ballsAmount);
                const rngHappened = RNG((enemy.activePoke().catchRate() * player.ballRNG(selectedBall)) / 3);
                if (rngHappened) {
                    player.statistics.successfulThrows++;
                    player.statistics[selectedBall+'SuccessfulThrows']++;
                    dom.gameConsoleLog('You caught ' + enemy.activePoke().pokeName() + '!!', 'purple');
                    player.addPoke(enemy.activePoke());
                    player.addPokedex(enemy.activePoke().pokeName(), (enemy.activePoke().shiny() ? POKEDEXFLAGS.ownShiny : POKEDEXFLAGS.ownNormal));
                    if (enemy.activePoke().shiny()) {
                        player.statistics.shinyCaught++;
                    } else {
                        player.statistics.caught++;
                    }
                    renderView(dom, enemy, player)
                } else {
                    dom.gameConsoleLog(enemy.activePoke().pokeName() + ' escaped!!', 'purple')
                }
            }
        }
    },
    findPokeballs: function() {
        const ballsAmount = Math.floor(Math.random() * 10) + 1;
        const ballName = randomArrayElement(['pokeball', 'pokeball', 'pokeball', 'pokeball', 'pokeball', 'pokeball', 'greatball', 'greatball', 'ultraball']);
        const rngHappened2 = RNG(10);
        if (rngHappened2) {
            player.addBalls(ballName, ballsAmount);
            dom.gameConsoleLog('You found ' + ballsAmount + ' ' + ballName + 's!!', 'purple');
            dom.renderBalls(player.ballsAmount())
        }
    },
    init: function() {
        this.playerActivePoke = player.activePoke();
        this.enemyActivePoke = enemy.activePoke();
        this.playerTimer();
        this.enemyTimer()
    },
    stop: function() {
        window.clearTimeout(this.playerTimerId);
        window.clearTimeout(this.enemyTimerId)
    },
    refresh: function() {
        this.stop();
        this.init()
    },
    changePlayerPoke: function(newPoke) {
        this.playerActivePoke = newPoke;
        this.refresh()
    },
    changeEnemyPoke: function(newPoke) {
        this.enemyActivePoke = newPoke;
        this.refresh()
    },
    changeCatch: function(shouldCatch) { this.catchEnabled = shouldCatch }
};