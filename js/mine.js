const container = document.getElementById("container");
const NUM_ROWS = 8;
const NUM_COLS = 10;
const NUM_BOMBS = 10;
const map = Array.from({length:NUM_ROWS}, () => Array.from({length: NUM_COLS}, () => ({"num": 0, "uncovered": false, "flag": false})));
const winLoseMessage = document.getElementById("winLose");
const playAgainButton = document.getElementById("playAgain")
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
    winLoseMessage.style.display = "none";
    playAgainButton.style.display = "none";
    for(let x = 0; x < rows; ++x) {
        const row = document.createElement("div");
        row.className = "row";
        container.appendChild(row);
        for(let y = 0; y < columns; ++y) {
            const box = document.createElement("span");
            box.className = "box";
            if(y === columns - 1) {
                box.classList.add("last-in-row");
            }
            if(x === rows - 1) {
                box.classList.add("last-in-col");
            }
            row.appendChild(box);
            
        }
        container.appendChild(row);
        console.log(container);
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
    }, 150 * i);
    
}

function loseGame() {
    console.log("lose");
    let bombLocs = [];
    for(row of container.childNodes) {
        for(box of row.childNodes) {
            if(box.innerHTML === 'B') {
                bombLocs.push(box);
                
                // revealBomb(box, i);
            }
            else {
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
    console.log("WHAT", container.childNodes);
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
        loseGame();
    }
    // thisBox.style.color = "red";
}

function bfs(r, c) {
    let queue = [];
    queue.push([r, c]);
    // console.log(queue.length);
    // let numIterations = 0;
    while(queue.length !== 0) {

        const [x, y] = queue.shift();
        checkSurrounding(x, y, (i, j) => {
            // const thisBox = container.childNodes[x + i].childNodes[y + j];
            // thisBox.classList.add("uncoveredBox");
            // thisBox.style.backgroundColor = "#28be28";
            // thisBox.style.color = "red";
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
        console.log(map[row][col]['num']);
        if(map[row][col]['visited']) {
            console.log("visited");
            return;
        }
        if(!gameStarted) {
            // console.log(box);
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
        if(map[row][col]['visited'] || !gameStarted) {
            console.log('visited');
            return;
        }
        if(!map[row][col]['flag']) {
            box.style.backgroundColor = "#8f2626";
            map[row][col]['flag'] = true;
        }
        else {
            box.style.backgroundColor = "#28be28";
            map[row][col]['flag'] = false;
        }
    })

}


function handleBoxClick() {
    // container.childNodes.forEach(row => {
    //     row.childNodes.forEach(box => clickBox(box));
    // });
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
    handleBoxClick();
}

function reset() {
    for(let i = 0; i < NUM_ROWS; ++i) {
        for(let j = 0; j < NUM_COLS; ++j) {
            map[i][j] = {"num": 0, "uncovered": false, "flag": false};
        }
    }
    console.log(container.childNodes);
    // container.childNodes.forEach(node => {
    //     container.removeChild(node);
    //     console.log(container.childNodes);
    // });
    while(container.firstChild) {
        container.removeChild(container.firstChild);
    }
    gameStarted = false;
}

window.addEventListener("load", runGame);
playAgainButton.addEventListener("click", function() {
    reset();
    // setTimeout(runGame, 1000);
    runGame();
});


