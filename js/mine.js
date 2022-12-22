const container = document.getElementById("container");

const EASY_ROWS_COLS_BOMBS = [8, 10, 10];
const MEDIUM_ROWS_COLS_BOMBS = [14, 18, 40];
const HARD_ROWS_COLS_BOMBS = [20, 24, 99];
let NUM_ROWS = EASY_ROWS_COLS_BOMBS[0];
let NUM_COLS = EASY_ROWS_COLS_BOMBS[1];
let NUM_BOMBS = EASY_ROWS_COLS_BOMBS[2];
let flagsLeft = NUM_BOMBS;
let map = Array.from({length:NUM_ROWS}, () => Array.from({length: NUM_COLS}, () => ({"num": 0, "visited": false, "flag": false})));
let gameOver = false;
let intervalId = null;
const winLoseMessage = document.getElementById("winLose");
const playAgainButton = document.getElementById("playAgain");
const difficulty = document.getElementById("difficulty");
const flags = document.getElementById("flags");
const time = document.getElementById("timer");
const WIN_COUNT = NUM_ROWS * NUM_COLS - NUM_BOMBS;
let gameStarted = false;
const colorMap = {
    1: "#0020ff",
    2: "#582626",
    3: "#cc0000",
    4: "#640264",
    5: "#7a1010",
    6: "#8a0c0c",
    7: "#9a0808",
    8: "#aa0000",
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function makeGrid(rows, columns) {
    console.log("makegrid");
    flags.innerHTML = flagsLeft;
    winLoseMessage.style.display = "none";
    playAgainButton.style.display = "none";
    for(let x = 0; x < rows; ++x) {
        const row = document.createElement("div");
        row.className = "row";
        container.appendChild(row);
        for(let y = 0; y < columns; ++y) {
            const box = document.createElement("span");
            box.className = "box";
            if(difficulty.value === "easy") {
                box.classList.add("easy");
            }
            else if(difficulty.value === "medium") {
                box.classList.add("medium");
            }
            else if(difficulty.value === "hard") {
                box.classList.add("hard");
            }
            if(y === columns - 1) {
                box.classList.add("last-in-row");
            }
            if(x === rows - 1) {
                box.classList.add("last-in-col");
            }
            row.appendChild(box);
            
        }
        container.appendChild(row);
    }
}

function makeEnoughSpace(rIn, cIn, firstClickRow, firstClickCol) {
    return Math.abs(rIn - firstClickRow) < 2 && Math.abs(cIn - firstClickCol) < 2;

}

function testBombLocations(rows, columns, firstClickRow, firstClickCol) {
    rowLoc = getRandomInt(0, rows - 1);
    colLoc = getRandomInt(0, columns - 1);
    while(map[rowLoc][colLoc]['num'] === -1 || makeEnoughSpace(rowLoc, colLoc, firstClickRow, firstClickCol)) {
        rowLoc = getRandomInt(0, rows - 1);
        colLoc = getRandomInt(0, columns - 1);
    }
    // 
    map[rowLoc][colLoc]['num'] = -1;
    container.children[rowLoc].children[colLoc].innerHTML = "B";
}

function scatterBombs(rows, columns, numBombs, firstClickRow, firstClickCol) {
    let numLeft = numBombs;
    while(numLeft > 0) {
        testBombLocations(rows, columns, firstClickRow, firstClickCol);
        --numLeft;
    }
}

function checkSurrounding(r, c, exeFunc) {
    for(let i = -1; i <= 1; ++i) {
        for(let j = -1; j <= 1; ++j) {
            if(r + i >= 0 && c + j >= 0 && r + i < NUM_ROWS && c + j < NUM_COLS) {
                exeFunc(i, j);
            }
        }
    }
}

function bombsSurrounding(r, c) {
    if(map[r][c]['num'] !== -1) {
        checkSurrounding(r, c, (i, j) => {
            if(map[r + i][j + c]['num'] === -1) {
                ++map[r][c]['num'];
            }
        });
        if(map[r][c]['num'] !== 0) {
            container.children[r].children[c].innerHTML = map[r][c]['num'];
        }
    }
}

function fillBoard(rows, columns) {
    for(let i = 0; i < rows; ++i) {
        for(let j = 0; j < columns; ++j) {
            bombsSurrounding(i, j);
        }
    }
}

function revealBomb(box, i) {
    setTimeout(function() {
        box.classList.add("uncoveredBox");
        box.style.backgroundColor = "#000000";
        box.style.color = "#ffffff";
    }, 100 * i);
    
}

function loseGame(thisBox) {
    console.log("lose");
    gameOver = true;
    clearInterval(intervalId);
    let bombLocs = [];
    for(row of container.childNodes) {
        for(box of row.childNodes) {
            if(box.innerHTML === 'B') {
                bombLocs.push(box);
                
                // revealBomb(box, i);
            }
            if(box.style.backgroundColor === "rgb(196, 255, 196)") {
                if(box.innerHTML === "") {
                    box.style.backgroundColor = "#a0a0a0";
                }
                else {
                    box.style.backgroundColor = "#606060";
                }
            }
            else if(box !== thisBox) {
                box.style.backgroundColor = "gray";
            }
            
        }
    }
    for(let i = 0; i < bombLocs.length; ++i) {
        revealBomb(bombLocs[i], i);
    }
    winLoseMessage.innerHTML = "You lose!";
    winLoseMessage.style.display = "block";
    playAgainButton.style.display = "block";
}

function checkWin() {
    for(let i = 0; i < NUM_ROWS; ++i) {
        for(let j = 0; j < NUM_COLS; ++j) {
            if(map[i][j]['num'] !== -1 && !map[i][j]['visited']) {
                return false;
            }
        }
    }
    return true;
}

function winGame() {
    console.log("win");
    clearInterval(intervalId);
    winLoseMessage.innerHTML = "You win!";
    winLoseMessage.style.display = "block";
    playAgainButton.style.display = "block";
    for(row of container.childNodes) {
        for(box of row.childNodes) {
            if(box.innerHTML === 'B') {
                box.style.backgroundColor = "gray";
            }
        }
    }
}

function uncover(x, y) {
    const thisBox = container.childNodes[x].childNodes[y];
    thisBox.classList.add("uncoveredBox");
    if(map[x][y]['num'] !== -1) {
        thisBox.style.backgroundColor = "#c4ffc4";
        thisBox.style.color = colorMap[map[x][y]['num']];
        if(checkWin()) {
            winGame();
        }
    }
    else {
        thisBox.style.backgroundColor = "#000000";
        thisBox.style.color = "#ffffff";
        loseGame(thisBox);
    }
    // thisBox.style.color = "red";
}

function bfs(r, c) {
    let queue = [];
    queue.push([r, c]);
    while(queue.length !== 0) {
        const [x, y] = queue.shift();
        checkSurrounding(x, y, (i, j) => {
            uncover(x + i, y + j);
            if(map[x + i][y + j]['num'] === 0 && !map[x + i][y + j]['visited']) {
                queue.push([x + i, y + j]);
            }
            map[x + i][y + j]['visited'] = true;
        });
    }
}

function clickBox(row, col) {
    const box = container.childNodes[row].childNodes[col];
    box.addEventListener("click", function() {
        if(map[row][col]['visited'] || gameOver) {
            return;
        }
        if(!gameStarted) {
            scatterBombs(NUM_ROWS, NUM_COLS, NUM_BOMBS, row, col);
            fillBoard(NUM_ROWS, NUM_COLS);
            gameStarted = true;
            
        }
        if(map[row][col]['num'] === 0) {
            bfs(row, col);
        }
        else {
            map[row][col]['visited'] = true;
            uncover(row, col);
        }
    });
}

function flagPlace(row, col) {
    const box = container.childNodes[row].childNodes[col];
    box.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if(map[row][col]['visited'] || !gameStarted || flagsLeft === 0 || gameOver) {
            return;
        }
        if(!map[row][col]['flag']) {
            box.style.backgroundColor = "#8f2626";
            map[row][col]['flag'] = true;
            --flagsLeft;
            flags.innerHTML = flagsLeft;
        }
        else {
            box.style.backgroundColor = "#28be28";
            map[row][col]['flag'] = false;
        }
    })

}


function handleBoxClick() {
    for(let r = 0; r < NUM_ROWS; ++r) {
        for(let c = 0; c < NUM_COLS; ++c) {
            clickBox(r, c);
            flagPlace(r, c);
        }
    }
}

function runGame() {
    console.log("starting");
    makeGrid(NUM_ROWS, NUM_COLS);
    timer();
    handleBoxClick();
}

function reset() {
    map = Array.from({length:NUM_ROWS}, () => Array.from({length: NUM_COLS}, () => ({"num": 0, "visited": false, "flag": false})));
    gameOver = false;
    clearInterval(intervalId);
    time.innerHTML = 0;
    flagsLeft = NUM_BOMBS;
    for(let i = 0; i < NUM_ROWS; ++i) {
        for(let j = 0; j < NUM_COLS; ++j) {
            map[i][j] = {"num": 0, "uncovered": false, "flag": false};
        }
    }
    while(container.firstChild) {
        container.removeChild(container.firstChild);
    }
    gameStarted = false;
}

function timer() {
    const start = Date.now();
    const deltaFunc = function() {
        const delta = Date.now() - start;
        time.innerHTML = Math.floor(delta/1000);
    }
    intervalId = setInterval(deltaFunc, 1000);
}

window.addEventListener("load", runGame);

playAgainButton.addEventListener("click", function() {
    reset();
    runGame();
});

difficulty.addEventListener("change", (event) => {
    if(event.target.value === "easy") {
        NUM_ROWS = EASY_ROWS_COLS_BOMBS[0];
        NUM_COLS = EASY_ROWS_COLS_BOMBS[1];
        NUM_BOMBS = EASY_ROWS_COLS_BOMBS[2];
    }
    else if(event.target.value === "medium") {
        NUM_ROWS = MEDIUM_ROWS_COLS_BOMBS[0];
        NUM_COLS = MEDIUM_ROWS_COLS_BOMBS[1];
        NUM_BOMBS = MEDIUM_ROWS_COLS_BOMBS[2];
    }
    else {
        NUM_ROWS = HARD_ROWS_COLS_BOMBS[0];
        NUM_COLS = HARD_ROWS_COLS_BOMBS[1];
        NUM_BOMBS = HARD_ROWS_COLS_BOMBS[2];
    }
    reset();
    runGame();
});


