let activePlayer;
let playerTurn;
let gameId;
let cellState=['', '', '', '', '', '', '', '', ''];
let userType;
let haveBothPlayers = false;
let currentUsersTurn;

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

    let createGameEl = document.getElementById('create-game-link');
    console.log('createGameEl:', createGameEl);
    createGameEl.style.display = 'block';

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

function hasPlayerWon() {
    if (cellState[0] === userType && cellState[1] === userType && cellState[2] === userType) {
        return true
    } else if (cellState[0] === userType && cellState[3] === userType && cellState[6] === userType) {
        return true;
    } else if (cellState[0] === userType && cellState[4] === userType && cellState[8] === userType) {
        return true;
    } else if (cellState[1] === userType && cellState[4] === userType && cellState[7] === userType) {
        return true;
    } else if (cellState[2] === userType && cellState[5] === userType && cellState[8] === userType) {
        return true;
    } else if (cellState[2] === userType && cellState[4] === userType && cellState[6] === userType) {
        return true;
    } else if (cellState[3] === userType && cellState[4] === userType && cellState[5] === userType) {
        return true;
    } else if (cellState[6] === userType && cellState[7] === userType && cellState[8] === userType) {
        return true;
    } else {
        return false;
    }
}

function getCellChosen(cellId) {
    return cellId.substr(3);
}

function isEmptyCell(cellIndex) {
    return cellState[cellIndex] === '';
}

function setNextPlayer() {
    if (playerTurn === 'xuser') {
        playerTurn = 'ouser';
    } else {
        playerTurn = 'xuser';
    }
}

function onClickGameCell(divID) {
    const cellIndex = getCellChosen(divID) -1;
    console.log('in onClickGameCell-currentUsersTurn + activePlayer', currentUsersTurn, activePlayer)
    if (currentUsersTurn===activePlayer && isEmptyCell(cellIndex)) {
        var gamesRef = firebase.firestore().collection("games").doc(gameId);

        setNextPlayer();
        console.log('updated next player', playerTurn);

        console.log('cellIndex:', cellIndex);
        cellState[cellIndex]=userType;
        return gamesRef.update({
            grid: cellState,
            turn: playerTurn
        })
            .then(function () {
                console.log("Document successfully updated!");

                drawXorO(userType, divID);
                if (hasPlayerWon()) {
                    console.log('congrats you have won');
                    endGame();
                }
            })
            .catch(function (error) {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            });

    }
}

function drawXorO(userType, cellId) {
    var element = document.getElementById(cellId);
    if (userType === 'xuser') {
        element.classList.toggle("ximage");
    } else {
        element.classList.toggle("oimage");
    }
}

function endGame() {
    toggleDiv('game-grid');
    toggleDiv('end-game');
    let endGameMessageEl = document.getElementById('end-game-message');
    endGameMessageEl.innerHTML = 'Congratulations you WON!';
    var gamesRef = firebase.firestore().collection("games").doc(gameId);

    return gamesRef.update({
        status: 'ended'
    })
      .then(function () {
          console.log("Document successfully updated ended!");
      })
      .catch(function (error) {
          console.error("Error updating document: ", error);
      });
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
            status: 'started'
        })
          .then(function () {
              console.log("jpin game Document successfully updated!");

              toggleDiv('open-games-tbl');
              toggleDiv('create-game-link');

              loadGrid();

              setCurrentUser('X user');
              playerTurn='xuser';

              gameId=playerIdToJoin;
              userType = 'yuser';
              cellState=['', '', '', '', '', '', '', '', ''];
              haveBothPlayers = true;

              setupListenerPushNotifications();
          })
          .catch(function (error) {
              // The document probably doesn't exist.
              console.error("Error updating document: ", error);
          });
    } else {
        console.log('active player is not set');
    }
}

function toggleDiv(divId) {
    console.log('toggling div', divId);
    let divEl = document.getElementById(divId);
    if (divEl.style.display === 'none') {
        divEl.style.display = 'block';
    } else {
        divEl.style.display = 'none';
    }
}

function hideDiv(divId) {
    console.log('hiding div', divId);
    let divEl = document.getElementById(divId);
    divEl.style.display = 'none';
}

function showDiv(divId) {
    console.log('showing div', divId);
    let divEl = document.getElementById(divId);
    divEl.style.display = 'block';
}

function loadGrid() {
    console.log('loadGrid');
    toggleDiv('game-grid');
}

function createGame(){
    console.log("createGame");
    // Add a new document with a generated id.
    firebase.firestore().collection("games").add({
        xuser: activePlayer,
        status: 'open',
        turn: 'xuser'
    })
        .then(function(docRef) {
            console.log("created new game. Document written with ID: ", docRef.id);

            toggleDiv('open-games-tbl');
            toggleDiv('create-game-link');
            toggleDiv('waiting-div');

            setCurrentUser(activePlayer);
            playerTurn='xuser';
            gameId=docRef.id;
            userType = 'xuser';
            cellState=['', '', '', '', '', '', '', '', ''];
            haveBothPlayers = false;
            setupListenerPushNotifications();
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });

}

function setCurrentUser(userName){
    console.log('setCurrentUser:', userName);
    let usersTurnEl = document.getElementById('users-turn');
    console.log('usersTurnEl.........:', usersTurnEl);
    usersTurnEl.textContent=userName;
    currentUsersTurn = userName;

}

function getUsersSelectedCell(dbGridCellState ) {
    if (dbGridCellState) {
        let i;
        for (i = 0; i < dbGridCellState.length; i++) {
            if (dbGridCellState[i] !== cellState[i]) {
                return i + 1;
            }
        }
    }
    return -1;
}

function setupListenerPushNotifications() {
    console.log('setupListenerPushNotifications', gameId);
    firebase.firestore().collection("games").doc(gameId)
      .onSnapshot(function(doc) {
          console.log("received update to game:", doc.data());
          if (doc.data().ouser && doc.data().xuser) {
              haveBothPlayers = true;
              console.log('have both players, this players user type is:', userType);
              hideDiv('waiting-div');
              showDiv('game-grid');
              console.log('database user is:', doc.data().turn);
              playerTurn = doc.data().turn;
              console.log('player turn from db', playerTurn);
              console.log('doc.data().xuser:', doc.data().xuser);
              console.log('doc.data().ouser:', doc.data().ouser);

              if (playerTurn === 'xuser') {
                  setCurrentUser(doc.data().xuser);
              } else {
                  setCurrentUser(doc.data().ouser);
              }

              let idx = getUsersSelectedCell(doc.data().grid);
              if (idx > 0) {
                  if (doc.data().turn === 'xuser') {
                      drawXorO('yuser', `div${idx}`);
                  } else {
                      drawXorO('xuser', `div${idx}`);
                  }
              }

              if (doc.data().grid) {
                  cellState = doc.data().grid;
              }

          }
      });
}

