/*
 States:
 0: Dead
 1: Red
 2: Blue
 */

var GRID_WIDTH = 15;
var GRID_HEIGHT = 15;
var TILE_PADDING = 2;
var RED = "#D55336";
var DARK_RED = "#AB422B";
var BLUE = "#30A7C2";
var DARK_BLUE = "#26869B";
var GREY = "#333333";
var BLACK = "#222222";

var RULESET = {birth: [3], stay: [2, 3]};

var gridTiles;
var tileSize;
var turnMade = false;
var changedThisDrag = [];
var currentPlayer = 1;
var lastMove = {canUse: false, x: undefined, y: undefined, from: undefined, to: undefined};


function generateGrid() {
    var row;
    var cell;
    var tile;
    var tileInner;
    var rowType;
    var notRowType;

    for (var y = 0; y < GRID_HEIGHT; y++) {
        row = $("<tr></tr>");
        $("#grid").append(row);
        for (var x = 0; x < GRID_WIDTH; x++) {
            if ((x + y % 2) % 2 == 0) {
                rowType = 'odd';
                notRowType = 'even';
            } else {
                rowType = 'even';
                notRowType = 'off';
            }
            cell = $('<td data-x="' + x + '" data-y="' + y + '" class="' + rowType + '"></td>');
            row.append(cell);
            tile = $('<div id="tile-' + x + '-' + y + '" class="tile tile-"></div>');
            cell.append(tile);
            tileInner = $('<div id="inner-' + x + '-' + y + '" class="inner"><div class="nextIndicator ' + notRowType + '" id="next-' + x + '-' + y + '"></div></div>');
            tile.append(tileInner);

            redrawTile(x, y);
        }
    }

    sizeTiles();
}
function sizeTiles() {
    var row;
    var cell;
    var tile;
    var mainGame = $("#mainGame");
    var grid = $("#grid");
    var minGridSize = Math.min(mainGame.width(), mainGame.height());

    tileSize = minGridSize / Math.max(GRID_WIDTH, GRID_HEIGHT);
    tileSize = Math.floor(tileSize);

    minGridSize = Math.floor(minGridSize);
    grid.css({width: minGridSize + 'px', height: minGridSize + 'px'});

    for (var y = 0; y < GRID_HEIGHT; y++) {
        row = grid.children().eq(y);
        for (var x = 0; x < GRID_WIDTH; x++) {
            cell = row.children().eq(x);
            tile = cell.children().eq(0);

            tile.css({width: tileSize + 'px', height: tileSize + 'px'});
        }
    }
}
function updateGrid() {
    for (var y = 0; y < GRID_HEIGHT; y++) {
        for (var x = 0; x < GRID_WIDTH; x++) {
            redrawTile(x, y);
        }
    }
}

function checkNextStates() {
    for (var x = 0; x < GRID_WIDTH; x++) {
        for (var y = 0; y < GRID_HEIGHT; y++) {
            var n = getNeighbours(x, y);
            if (!($.inArray(n, RULESET.stay) >= 0)) {

                gridTiles[x][y].nextState = 0;

            } else if (gridTiles[x][y].currentState != 0 && ($.inArray(n, RULESET.stay) >= 0)) {

                gridTiles[x][y].nextState = gridTiles[x][y].currentState;

            } else if (gridTiles[x][y].currentState == 0 && $.inArray(n, RULESET.birth) >= 0) {
                var rn = getRedNeighbours(x, y);
                if (n - rn < rn)
                    gridTiles[x][y].nextState = 1;
                else
                    gridTiles[x][y].nextState = 2;

            } else {
                gridTiles[x][y].nextState = 0;
            }
        }
    }

    var cellCount = getCellsCount();
    $('#p1sc').text('x' + cellCount.red);
    $('#p2sc').text('x' + cellCount.blue);
}
function gameOfLifeTick() {
    checkNextStates();

    var changed = [];

    for (var x = 0; x < GRID_WIDTH; x++) {
        for (var y = 0; y < GRID_HEIGHT; y++) {
            if (gridTiles[x][y].currentState != gridTiles[x][y].nextState) {
                gridTiles[x][y].currentState = gridTiles[x][y].nextState;
                changed.push({x:x, y:y});
            }
        }
    }

    checkNextStates();

    for (var i = 0; i < changed.length; i++) {
        refreshTile(changed[i].x, changed[i].y);
    }
}

function getNeighbours(x, y) {
    var neighbours = 0;

    for (var dx = -1; dx < 2; dx++) {
        for (var dy = -1; dy < 2; dy++) {
            if (x + dx >= 0 && x + dx < GRID_WIDTH && y + dy >= 0 && y + dy < GRID_HEIGHT) {
                if (!(dx == 0 && dy == 0)) {
                    if (gridTiles[x + dx][y + dy].currentState != 0) {
                        neighbours += 1;
                    }
                }
            }
        }
    }

    return neighbours;
}
function getRedNeighbours(x, y) {
    var redNeighbours = 0;

    for (var dx = -1; dx < 2; dx++) {
        for (var dy = -1; dy < 2; dy++) {
            if (x + dx >= 0 && x + dx < GRID_WIDTH && y + dy >= 0 && y + dy < GRID_HEIGHT) {
                if (!(dx == 0 && dy == 0)) {
                    if (gridTiles[x + dx][y + dy].currentState == 1) {
                        redNeighbours += 1;
                    }
                }
            }
        }
    }

    return redNeighbours;
}
function getCellsCount() {
    var redCells = 0;
    var blueCells = 0;

    for (var y = 0; y < GRID_HEIGHT; y++) {
        for (var x = 0; x < GRID_WIDTH; x++) {
            if (gridTiles[x][y].currentState == 1)
                redCells ++;
            else if (gridTiles[x][y].currentState == 2)
                blueCells ++;
        }
    }

    return {red: redCells, blue: blueCells};
}

function refreshTile(x, y) {
    for (var dx = -1; dx < 2; dx++) {
        for (var dy = -1; dy < 2; dy++) {
            if (x + dx >= 0 && x + dx < GRID_WIDTH && y + dy >= 0 && y + dy < GRID_HEIGHT) {
                redrawTile(x + dx, y + dy);
            }
        }
    }
}
function redrawTile(x, y) {
    var newClass;
    var tile;

    switch (gridTiles[x][y].currentState) {
        case 0:
            newClass = "tile-";
            break;
        case 1:
            newClass = "tile-1";
            break;
        case 2:
            newClass = "tile-2";
    }

    tile = $('#tile-' + x + '-' + y);

    tile.removeClass("tile-");
    tile.removeClass("tile-1");
    tile.removeClass("tile-2");
    tile.addClass(newClass);

    switch (gridTiles[x][y].nextState) {
        case 0:
            newClass = "next-";
            break;
        case 1:
            newClass = "next-1";
            break;
        case 2:
            newClass = "next-2";
    }

    tile = $('#next-' + x + '-' + y);

    tile.removeClass("next-");
    tile.removeClass("next-1");
    tile.removeClass("next-2");
    tile.addClass(newClass);
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].x === obj.x && list[i].y === obj.y) {
            return true;
        }
    }

    return false;
}

function playButton() {
    if (turnMade) {
        turnMade = false;
        lastMove.canUse = false;

        $("#play-lock").removeClass("hide-lock");
        gameOfLifeTick();

        if (currentPlayer == 1) {
            currentPlayer = 2;
            $('#infoA').removeClass('flash');
            $('#infoB').addClass('flash');
        } else {
            currentPlayer = 1;
            $('#infoB').removeClass('flash');
            $('#infoA').addClass('flash');
        }
    }
}
function undoButton() {
    if (lastMove.canUse) {
        lastMove.canUse = false;
        gridTiles[lastMove.x][lastMove.y].currentState = lastMove.from;

        checkNextStates();
        refreshTile(lastMove.x, lastMove.y);

        turnMade = false;
        $("#play-lock").removeClass("hide-lock");
    }
}

function resizeFunction() {
    var tr = $('#tableWrapper');
    var mg = $('#mainGame');
    var gr = $('#grid');

    tr.css({width: mg.width() + 'px', height: mg.height() + 'px'});
    tr.offset(mg.offset());

    gr.panzoom("reset");

    var btns = $(".btn");
    for (var i = 0; i < btns.length; i++) {
        $(btns[i]).css({"background-size": btns.width() + "px"})
    }

    /*tr.css({width: "auto", height: "auto"});

    var nx = mg.position().left + ((mg.width() - tr.width()) / 2);
    var ny = mg.position().top + ((mg.height() - tr.height()) / 2);
    console.log(nx, ny);
    tr.offset({top: nx, left: ny});

    sizeTiles();*/
}

$(window).resize(resizeFunction);
/*$(window).mousedown(function (event) {
    var x;
    var y;
    var hitId;

    hitId = event.target.parentNode.id;

    if (hitId.startsWith('tile-')) {
        x = parseInt(hitId.split('-')[1]);
        y = parseInt(hitId.split('-')[2]);

        gridTiles[x][y].currentState ++;
        if (gridTiles[x][y].currentState == 3)
            gridTiles[x][y].currentState = 0;
        changedThisDrag.push({x:x, y:y});

        checkNextStates();
        refreshTile(x, y);
    } else {
        hitId = event.target.parentNode.parentNode.id;
        if (hitId.startsWith('tile-')) {
            x = parseInt(hitId.split('-')[1]);
            y = parseInt(hitId.split('-')[2]);

            gridTiles[x][y].currentState ++;
            if (gridTiles[x][y].currentState == 3)
                gridTiles[x][y].currentState = 0;
            changedThisDrag.push({x:x, y:y});

            checkNextStates();
            refreshTile(x, y);
        }
    }
});
$(window).mouseup(function (event) {
    mouseDown = false;
});*/
/*$(window).on('mousewheel', function(event) {
    if (event.deltaY != 0)
        $("#grid").panzoom("zoom", event.deltaY < 0, {focal: event});
});
*/
$().ready(function () {
    console.log("Welcome to GOLAD Anywhere V0.0.1!");

    $('#ruleset').text('B' + RULESET.birth.join('') + '/S' + RULESET.stay.join(''));

    console.log("Spawning grid...");

    gridTiles = [];

    var x;
    var y;
    var val;
    for (y = 0; y < GRID_HEIGHT / 2; y++) {
        gridTiles.push([]);

        for (x = 0; x < GRID_WIDTH; x++) {
            var r = Math.random();
            if (r < 0.1)
                val = 1;
            else if (r < 0.2)
                val = 2;
            else
                val = 0;

            gridTiles[y].push({currentState: val, nextState: 0});
        }
    }
    for (y = Math.floor(GRID_HEIGHT / 2); y < GRID_HEIGHT; y++) {
        gridTiles.push([]);

        for (x = 0; x < GRID_WIDTH; x++) {
            switch (gridTiles[GRID_HEIGHT/2-(y-GRID_HEIGHT/2)-1][GRID_WIDTH - x -1].currentState) {
                case 0:
                    val = 0;
                    break;
                case 1:
                    val = 2;
                    break;
                case 2:
                    val = 1;
                    break;
            }

            gridTiles[y].push({currentState: val, nextState: 0});
        }
    }


    generateGrid();
    resizeFunction();

    console.log("Done! Refreshing GOL states...");

    checkNextStates();

    console.log("Done!");

    updateGrid();

    $("#grid").panzoom({
        which: 2,
        transition: true,
        easing: "ease-in-out",
        contain: false,
        minScale: 1,
    });
});

var w = new Hammer(document.getElementById("grid"));
w.on("tap", function (ev) {
    if (!turnMade) {
        var x;
        var y;
        var hitId = ev.target.id;

        if (hitId.startsWith('tile-') || hitId.startsWith('next-') || hitId.startsWith('inner-')) {
            x = parseInt(hitId.split('-')[1]);
            y = parseInt(hitId.split('-')[2]);

            lastMove.canUse = true;
            lastMove.x = x;
            lastMove.y = y;
            lastMove.from = gridTiles[x][y].currentState;

            if (gridTiles[x][y].currentState == 0)
                gridTiles[x][y].currentState = currentPlayer;
            else
                gridTiles[x][y].currentState = 0;

            changedThisDrag.push({x: x, y: y});

            lastMove.to = gridTiles[x][y].currentState;

            checkNextStates();
            refreshTile(x, y);

            turnMade = true;
            $("#play-lock").addClass("hide-lock");
        }
    }
});


var handleTouchyPinch = function (e, $target, data) {
    alert(data.scale);
    $target.css({'webkitTransform':'scale(' + data.scale + ',' + data.scale + ')'});
};
$('#grid').bind('touchy-pinch', handleTouchyPinch);