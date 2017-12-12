let Town = {
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
    renderShop: function() {
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
            const buttonHTML = ' <button onclick="town.buyItem(\'' + i + '\')"' + disableButton + '>' + buttonText + '</button>';
            shopHTML += '<li>' + this.shopItems[i].name + ': ¤' + this.shopItems[i].cost + buttonHTML + '</li>';
        }
        $('#shopItems').innerHTML = shopHTML;
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
            this.renderShop(); // force refresh of shop
            dom.renderCurrency();
            return true;
        }
    },
    renderSellTrader: function() {
        let traderHTML = '';
        let poke, pokeValue, pokeStatus, classValue, buttonHTML;
        const storageLength = player.storage.length;
        for (let i = 0; i < storageLength; i++) {
            poke = player.storage[i];
            pokeValue = this.calculatePokeValue(poke);
            pokeStatus = dom.pokeStatus(poke);
            classValue = 'pokeListName ' + pokeStatus;
            buttonHTML = ' <button onclick="town.sellPoke(\'' + i + '\')">Sell</button>';
            traderHTML += '<li class="' + classValue + '">' + poke.pokeName() + ': ¤' + pokeValue + buttonHTML + '</li>';
        }
        if (storageLength == 0) {
            traderHTML += '<li>Nothing to sell, you can only sell pokemon from your storage</li>';
        }
        $('#traderSellList').innerHTML = traderHTML;
    },
    traderPoke: ['Farfetchd', 'Jynx', 'Lickitung', 'Mr. Mime'],
    renderBuyTrader: function() {
        let traderHTML = '';
        let poke, pokeValue, buttonHTML, canBuy;
        for (let i = 0; i < this.traderPoke.length; i++) {
            poke = this.traderPoke[i];
            pokeValue = 100000;
            canBuy = true;
            if (player.currency < pokeValue)
                canBuy = false;
            const disableButton = (!canBuy) ? ' disabled="true"' : '';
            buttonHTML = ' <button onclick="town.buyPoke(\'' + i + '\')" ' + disableButton + '>Buy</button>';
            traderHTML += '<li>' + poke + ': ¤' + pokeValue + buttonHTML + '</li>';
        }
        $('#traderBuyList').innerHTML = traderHTML;
    },
    renderTrader: function() {
        this.renderSellTrader();
        this.renderBuyTrader();
    },
    calculatePokeValue: function(poke, demandMult = 1) {
        const shinyMult = (poke.shiny()) ? 1500 : 1;
        return Math.floor((poke.level() / 4) * shinyMult * demandMult);
    },
    sellPoke: function(index) {
        const poke = player.storage[index];
        const soldValue = this.calculatePokeValue(poke);
        player.addCurrency(soldValue);
        dom.gameConsoleLog('Sold ' + poke.pokeName() + ' for ¤' + soldValue + '!!', 'purple');
        player.deletePoke(index, 'storage');
        player.statistics.sold++;
        this.renderSellTrader();
        dom.renderPokeList();
        return false;
    },
    buyPoke: function(index) {
        const pokeValue = 100000;
        if (player.currency < pokeValue) {
            return false;
        } else {
            const poke = pokeByName(this.traderPoke[index]);
            const newPoke = new Poke(poke, 30, false, Math.random() < (1 / (1 << 5 << 8)));
            player.currency -= pokeValue;
            dom.gameConsoleLog('Bought ' + newPoke.pokeName() + ' for ¤' + pokeValue + '!!', 'purple');
            player.addPoke(newPoke);
            player.addPokedex(newPoke.pokeName(), (newPoke.shiny() ? POKEDEXFLAGS.ownShiny : POKEDEXFLAGS.ownNormal));
            dom.renderPokeList();
            dom.renderCurrency();
            return false;
        }
    }
};