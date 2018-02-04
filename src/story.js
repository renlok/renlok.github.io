const Story = {
    canClose: true,
    displayStory: function(title, content, canClose) {
        this.canClose = canClose;
        $(`#storyContainer`).style.display = 'block';
        $(`#storyClose`).style.display = canClose ? 'block' : 'none';
        $(`#storyTitle`).innerHTML = title;
        $(`#storyContent`).innerHTML = content;
    },
    stories: {
        firstPoke: function() {
            let title = 'Welcome to the world of pokemon';
            let storyHTML = '<p>To help you get started please take one of my old pokemon</p>';
            storyHTML += '<p><img src="' + story.helpers.getPokeImg(1) + '" onclick="story.helpers.selectFirstPoke(1)">';
            storyHTML += '<img src="' + story.helpers.getPokeImg(4) + '" onclick="story.helpers.selectFirstPoke(4)">';
            storyHTML += '<img src="' + story.helpers.getPokeImg(7) + '" onclick="story.helpers.selectFirstPoke(7)"></p>';
            story.displayStory(title, storyHTML, false);
        }
    },
    helpers: {
        getPokeImg: function(id) {
            return POKEDEX[id]['images']['normal']['front'];
        },
        selectFirstPoke: function(id) {
            let starterPoke = new Poke(pokeById(id), 5);
            player.addPoke(starterPoke);
            player.addPokedex(starterPoke.pokeName(), POKEDEXFLAGS.ownNormal);
            dom.gameConsoleLog('You received a ' + player.activePoke().pokeName(), 'purple');
            enemy.generateNew(ROUTES[player.settings.currentRegionId][player.settings.currentRouteId]);
            player.setActive(0);
            renderView(dom, enemy, player);
            dom.renderListBox();
            combatLoop.unpause();
            $(`#storyContainer`).style.display = 'none';
        }
    }
};