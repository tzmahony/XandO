let is_x = true;
let activePlayer;

document.addEventListener('DOMContentLoaded', function () {
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    // firebase.auth().onAuthStateChanged(user => { });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

    try {
        let app = firebase.app();
        let features = ['firestore', 'auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function'
          )
        ;
        document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
    } catch (e) {
        console.error(e);
        document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
    }
});

function handleEnterName(e) {
    if (e.which === 13) {
        let displayPlayerNameEl = document.getElementById('player-name-display');
        console.log('displayPlayerNameEl:', displayPlayerNameEl);
        displayPlayerNameEl.style.display = 'block';
        let inputEl = document.getElementById('player-name');
        initialisePlayer(inputEl.value);
    }
}

function initialisePlayer(name) {
    console.log('initialise player', name);
    activePlayer = name;
    let displayNameEl = document.getElementById('display-name');
    displayNameEl.innerHTML = name;

    loadOpenGames();
}

function loadOpenGames() {
    console.log('loadOpenGames');

    let newPlayerEl = document.getElementById('new-player');
    newPlayerEl.style.display = 'none';

    let openGamesEl = document.getElementById('open-games');
    console.log('openGamesEl:', openGamesEl);
    openGamesEl.style.display = 'block';

    firebase.firestore().collection("games").where("status", "==", "open")
      .onSnapshot(function (querySnapshot) {
          var games = new Map();
          querySnapshot.forEach(function (doc) {
              games.set(doc.id, doc.data());
          });
          console.log("Current games: ", games);
          updateOpenGamesTable(games);
      });
}

function updateOpenGamesTable(games) {
    console.log("updateOpenGamesTable games", games)
    let removeTab = document.getElementById('games-tbl');
    if (removeTab !== null) {
        var parentEl = removeTab.parentElement;

        parentEl.removeChild(removeTab);
    }

    let openGamesTblEl = document.getElementById('open-games-tbl');
    let tblEl = document.createElement('table');
    tblEl.style.width = '100px';
    tblEl.style.border = '1px solid black';

    tblEl.setAttribute("id", "games-tbl");
    for (const [key, value] of games.entries()) {
        updateOpenGamesRow(value, key, tblEl)
    }

    openGamesTblEl.appendChild(tblEl);
}

function myFunction(divID) {
    var element = document.getElementById(divID);
    if (is_x) {
        element.classList.toggle("ximage");
    } else {
        element.classList.toggle("oimage");
    }
    is_x = !is_x;
}

function updateOpenGamesRow(game, key, tbl) {
    console.log(`in updateGames, map key:[${key}] = ${game}`);
    var tr = tbl.insertRow();
    for (var j = 0; j < 2; j++) {
        var td = tr.insertCell();
        //td.appendChild(document.createTextNode('Cell'));
        var button = document.createElement('button');
        button.innerHTML = 'join';
        button.setAttribute('data-id', key);

        button.onclick = function () {
            console.log('join btn click', this.getAttribute('data-id'));
            joinGame(this.getAttribute('data-id'));
            return false;
        };
        td.appendChild(button);
        td.style.border = '1px solid black';
        if (j == 0) {
            td.innerHTML = game.xuser;
        }
    }
}

function joinGame(playerIdToJoin) {
    if (activePlayer) {
        console.log('active player is set:', activePlayer);

        var gamesRef = firebase.firestore().collection("games").doc(playerIdToJoin);

        return gamesRef.update({
            ouser: activePlayer,
            status: 'closed'
        })
          .then(function () {
              console.log("Document successfully updated!");

              // let openGamesEl = document.getElementById('open-games');
              // openGamesEl.style.display = 'none';
              loadGrid();

          })
          .catch(function (error) {
              // The document probably doesn't exist.
              console.error("Error updating document: ", error);
          });
    } else {
        console.log('active player is not set');
    }
}

function loadGrid() {
    console.log('loadGrid');
    let gridEl = document.getElementById('game-grid');
    console.log('gameGridEl:', gridEl);
    gridEl.style.display = 'block';
}