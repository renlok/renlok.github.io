const Combat = {
    paused: false,
    playerActivePoke: null,
    enemyActivePoke: null,
    playerTimerId: null,
    enemyTimerId: null,
    catchEnabled: false,
    init: function() {
        if (!this.paused) {
            this.playerActivePoke = player.activePoke();
            this.enemyActivePoke = enemy.activePoke();
            this.playerTimer();
            this.enemyTimer();
        }
    },
    pause: function() {
        this.paused = true;
        this.stop();
        enemy.clear();
        this.enemyActivePoke = null;
    },
    unpause: function() {
        this.paused = false;
        this.newEnemy();
        this.init();
    },
    stop: function() {
        window.clearTimeout(this.playerTimerId);
        window.clearTimeout(this.enemyTimerId);
    },
    refresh: function() {
        this.stop();
        this.init()
    },
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
    dealDamage: function(attacker, defender, who) {
        if (!attacker || !defender) return null;
        if (attacker.alive() && defender.alive()) {
            const consoleColor = (who === 'player') ? 'green' : 'rgb(207, 103, 59)';
            // calculate damage done
            const missRNG = RNG(5);
            if (missRNG) {
                dom.gameConsoleLog(attacker.pokeName() + ' missed!', consoleColor);
            } else {
                const critRNG = RNG(5);
                const critMultiplier = (critRNG) ? 1 + (attacker.level() / 100) : 1;
                const damageMultiplier = this.calculateDamageMultiplier(attacker.types(), defender.types()) * critMultiplier;
                const damage = defender.takeDamage(attacker.avgAttack() * damageMultiplier);
                if (critRNG) {
                    dom.gameConsoleLog('Critical Hit!!', consoleColor);
                }
                if (who === 'player') {
                    // TODO add some flair
                    dom.gameConsoleLog(attacker.pokeName() + ' Attacked for ' + damage, 'green');
                    player.statistics.totalDamage += damage;
                } else {
                    // TODO add some flair
                    dom.gameConsoleLog(attacker.pokeName() + ' Attacked for ' + damage, 'rgb(207, 103, 59)');
                }
                dom.renderPokeOnContainer('enemy', enemy.activePoke());
                dom.renderPokeOnContainer('player', player.activePoke(), player.settings.spriteChoice || 'back');
            }
            if (who === 'player') {
                dom.attackAnimation('playerImg', 'right');
                this.playerTimer();
            } else {
                dom.attackAnimation('enemyImg', 'left');
                this.enemyTimer();
            }
        }
        if (!attacker.alive() || !defender.alive()) {
            // one is dead
            window.clearTimeout(this.playerTimerId);
            window.clearTimeout(this.enemyTimerId);

            if ((who === 'enemy') && !attacker.alive() ||
                (who === 'player') && !defender.alive())
            {
                this.enemyFaint();
            } else {
               this.playerFaint();
            }
            dom.renderPokeOnContainer('enemy', enemy.activePoke());
        }
    },
    enemyFaint: function() {
        if (enemy.activePoke().shiny()) {
            player.statistics.shinyBeaten++;
        } else {
            player.statistics.beaten++;
        }
        this.attemptCatch();
        this.findPokeballs(enemy.activePoke().level());
        this.findCurrency(enemy.activePoke().level());

        const beforeExp = player.getPokemon().map((poke) => poke.level());
        const expToGive = (this.enemyActivePoke.baseExp() / 16) + (this.enemyActivePoke.level() * 3);
        player.statistics.totalExp += expToGive;
        this.playerActivePoke.giveExp(expToGive);
        dom.gameConsoleLog(this.playerActivePoke.pokeName() + ' won ' + Math.floor(expToGive) + 'xp', 'rgb(153, 166, 11)');
        player.getPokemon().forEach((poke) => poke.giveExp((this.enemyActivePoke.baseExp() / 100) + (this.enemyActivePoke.level() / 10)));
        const afterExp = player.getPokemon().map((poke) => poke.level());

        // check if a pokemon leveled up
        if (beforeExp.join('') !== afterExp.join('')) {
            dom.gameConsoleLog('Your pokemon gained a level', 'rgb(153, 166, 11)');
            if (player.settings.listView == 'roster') {
                dom.renderPokeList(false);
            }
        }

        player.savePokes();
        this.newEnemy();
        this.playerTimer();
        dom.renderPokeOnContainer('player', player.activePoke(), player.settings.spriteChoice || 'back');
    },
    newEnemy: function() {
        enemy.generateNew(player.settings.currentRegionId, player.settings.currentRouteId);
        this.enemyActivePoke = enemy.activePoke();
        player.addPokedex(enemy.activePoke().pokeName(), (enemy.activePoke().shiny() ? POKEDEXFLAGS.seenShiny : POKEDEXFLAGS.seenNormal));
        if (enemy.activePoke().shiny()) {
            player.statistics.shinySeen++;
        } else {
            player.statistics.seen++;
        }
        this.enemyTimer();
    },
    playerFaint: function() {
        dom.gameConsoleLog(this.playerActivePoke.pokeName() + ' Fainted! ');
        if (player.alivePokeIndexes.length > 0) {
            player.setActive(player.getPokemon().indexOf(player.alivePokeIndexes[0]));
            this.playerActivePoke = player.activePoke();
            dom.gameConsoleLog('Go ' + this.playerActivePoke.pokeName() + '!');
            this.refresh();
        } else {
            if (ROUTES[player.settings.currentRegionId][player.settings.currentRouteId]['respawn']) {
                dom.gameConsoleLog('You have no more usable pokemon. You blacked out!', 'red');
                flash($('#playerBox'));
                dom.gameConsoleLog('You reawaken at the nearest pokecenter.', 'red');
                flash($('#routeList'));
                userInteractions.changeRoute(ROUTES[player.settings.currentRegionId][player.settings.currentRouteId]['respawn'], true);
            }
        }
        dom.renderPokeList(false);
    },
    attemptCatch: function() {
        if (this.catchEnabled == 'all' || (this.catchEnabled == 'new' && !player.hasPokemon(enemy.activePoke().pokeName(), 0)) || enemy.activePoke().shiny()) {
            dom.gameConsoleLog('Trying to catch ' + enemy.activePoke().pokeName() + '...', 'purple');
            const selectedBall = (enemy.activePoke().shiny() ? player.bestAvailableBall() : player.selectedBall);
            if (player.consumeBall(selectedBall)) {
                // add throw to statistics
                player.statistics.totalThrows++;
                player.statistics[selectedBall+'Throws']++;
                dom.renderBalls();
                const catchBonus = (player.unlocked.razzBerry) ? 1.25 : 1;
                const rngHappened = RNG(((enemy.activePoke().catchRate() * player.ballRNG(selectedBall)) / 3) * catchBonus);
                if (rngHappened) {
                    player.statistics.successfulThrows++;
                    player.statistics[selectedBall+'SuccessfulThrows']++;
                    dom.gameConsoleLog('You caught ' + enemy.activePoke().pokeName() + '!!', 'purple');
                    player.addPoke(enemy.activePoke());
                    player.addPokedex(enemy.activePoke().pokeName(), (enemy.activePoke().shiny() ? POKEDEXFLAGS.ownShiny : POKEDEXFLAGS.ownNormal));
                    if (enemy.activePoke().shiny()) {
                        player.statistics.shinyCaught++;
                        player.unlocked.shinyDex = 1;
                    } else {
                        player.statistics.caught++;
                    }
                    renderView(dom, enemy, player);
                } else {
                    dom.gameConsoleLog(enemy.activePoke().pokeName() + ' escaped!!', 'purple')
                }
            }
        }
    },
    findPokeballs: function(pokeLevel) {
        const ballsAmount = Math.floor(Math.random() * (pokeLevel/2)) + 1;
        const ballWeights = {
            'ultraball': 1,
            'greatball': 10,
            'pokeball': 100,
        };
        const rng = Math.floor(Math.random() * (2000 - (pokeLevel * 4)));
        for (let ballName in ballWeights) {
            if (rng < ballWeights[ballName]) {
                player.addBalls(ballName, ballsAmount);
                dom.gameConsoleLog('You found ' + ballsAmount + ' ' + ballName + 's!!', 'purple');
                dom.renderBalls();
            }
        }
    },
    findCurrency: function(pokeLevel) {
        if (RNG(5)) {
            const foundCurrency = Math.floor(Math.random() * pokeLevel * 4) + 1;
            player.addCurrency(foundCurrency);
            dom.gameConsoleLog('You found ¤' + foundCurrency + '!!', 'purple');
        }
    },
    changePlayerPoke: function(newPoke) {
        this.playerActivePoke = newPoke;
        this.refresh()
    },
    changeEnemyPoke: function(newPoke) {
        this.enemyActivePoke = newPoke;
        this.refresh()
    },
    changeCatch: function(shouldCatch) { this.catchEnabled = shouldCatch; }
};