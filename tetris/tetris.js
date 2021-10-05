$.fn.safekeypress = function (func, cfg) {

    cfg = $.extend({
        stopKeys: {
            37: 1,
            38: 1,
            39: 1,
            40: 1
        }
    }, cfg);

    function isStopKey(evt) {
        var isStop = (cfg.stopKeys[evt.keyCode] || (cfg.moreStopKeys && cfg.moreStopKeys[evt.keyCode]));
        if (isStop) { evt.preventDefault(); }

        return isStop;
    }

    function getKey(evt) {
        return "safekeypress." + evt.keyCode;
    }

    function keypress(evt) {
        var key = getKey(evt)
            , val = ($.data(this, key) || 0) + 1;
        $.data(this, key, val);
        if (val > 0) { return func.call(this, evt); }
        return isStopKey(evt);
    }

    function keydown(evt) {
        var key = getKey(evt);
        $.data(this, key, ($.data(this, key) || 0) - 1);
        return func.call(this, evt);
    }

    function keyup(evt) {
        $.data(this, getKey(evt), 0);
        return isStopKey(evt);
    }

    return $(this).keypress(keypress).keydown(keydown).keyup(keyup);
}
    ;

var getNiceShapes = function (shapeFactory) {
    var shapes = {}, attr;

    for (attr in shapeFactory) {
        shapes[attr] = shapeFactory[attr]();
    }

    function scoreBlocks(possibles, blocks, x, y, filled, width, height) {
        var i, len = blocks.length, score = 0, bottoms = {}, tx, ty, overlaps;

        for (i = 0; i < len; i += 2) {
            score += possibles[filled.asIndex(x + blocks[i], y + blocks[i + 1])] || 0;
        }

        for (i = 0; i < len; i += 2) {
            tx = blocks[i];
            ty = blocks[i + 1];
            if (bottoms[tx] === undefined || bottoms[tx] < ty) { bottoms[tx] = ty; }
        }
        overlaps = 0;
        for (tx in bottoms) {
            tx = parseInt(tx, 10);
            for (ty = bottoms[tx] + 1,
                i = 0; y + ty < height; ty++,
                i++) {
                if (!filled.check(x + tx, y + ty)) {
                    overlaps += i === 0 ? 2 : 1;
                    break;
                }
            }
        }

        score = score - overlaps;

        return score;
    }

    function resetShapes() {
        for (var attr in shapes) {
            shapes[attr].x = 0;
            shapes[attr].y = -1;
        }
    }

    var func = function (filled, checkCollisions, width, height, mode, oneShape) {
        if (!oneShape) { resetShapes(); }

        var possibles =
            new Array(width * height),
            evil = mode === "evil",
            x, y, py, attr, shape, i,
            blocks, bounds, score, bestShape,
            bestScore = (evil ? 1 : -1) * 999,
            bestOrientation, bestX,
            bestScoreForShape,
            bestOrientationForShape,
            bestXForShape;

        for (x = 0; x < width; x++) {
            for (y = 0; y <= height; y++) {
                if (y === height || filled.check(x, y)) {
                    for (py = y - 4; py < y; py++) {
                        possibles[filled.asIndex(x, py)] = py;
                    }
                    break;
                }
            }
        }

        var opts = oneShape === undefined ? shapes : {
            cur: oneShape
        };

        for (attr in opts) {

            shape = opts[attr];
            bestScoreForShape = -999;

            for (i = 0; i < (shape.symmetrical ? 2 : 4); i++) {
                blocks = shape.getBlocks(i);
                bounds = shape.getBounds(blocks);


                for (x = -bounds.left; x < width - bounds.width; x++) {
                    for (y = -1; y < height - bounds.bottom; y++) {
                        if (checkCollisions(x, y + 1, blocks, true)) {

                            score = scoreBlocks(possibles, blocks, x, y, filled, width, height);
                            if (score > bestScoreForShape) {
                                bestScoreForShape = score;
                                bestOrientationForShape = i;
                                bestXForShape = x;
                            }
                            break;
                        }
                    }
                }
            }

            if ((evil && bestScoreForShape < bestScore) || (!evil && bestScoreForShape > bestScore)) {
                bestShape = shape;
                bestScore = bestScoreForShape;
                bestOrientation = bestOrientationForShape;
                bestX = bestXForShape;
            }
        }

        bestShape.best_orientation = bestOrientation;
        bestShape.best_x = bestX;

        return bestShape;
    };

    func.noPreview = true;
    return func;
};


var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var infoCanvas = document.getElementById("info");
var infoCtx = infoCanvas.getContext("2d");
var WIDTH = 10;
var HEIGHT = 20;
var PIXEL_WIDTH = $(canvas).width();
var PIXEL_HEIGHT = $(canvas).height();
var blockSize = Math.ceil(PIXEL_WIDTH / WIDTH);
var bevelSize = Math.floor(blockSize / 10);
var borderWidth = 2;

function randInt(a, b) {
    return a + Math.floor(Math.random() * (1 + b - a));
}
function randSign() {
    return randInt(0, 1) * 2 - 1;
}
function randChoice(choices) {
    return choices[randInt(0, choices.length - 1)];
}

function drawBlock(x, y, color, _ctx) {

    _ctx = _ctx || ctx;
    x = x * blockSize;
    y = y * blockSize;
    _ctx.fillStyle = color;
    _ctx.globalAlpha = 0.5;
    _ctx.fillRect(x, y, blockSize, blockSize);
    _ctx.globalAlpha = 0.5;
    _ctx.fillRect(x + bevelSize, y + bevelSize, blockSize - 2 * bevelSize, blockSize - 2 * bevelSize);
    _ctx.globalAlpha = 1;
}

function checkCollisions(x, y, blocks, checkDownOnly) {

    var i = 0, len = blocks.length, a, b;
    for (; i < len; i += 2) {
        a = x + blocks[i];
        b = y + blocks[i + 1];

        if (b >= HEIGHT || filled.check(a, b)) {
            return true;
        } else if (!checkDownOnly && a < 0 || a >= WIDTH) {
            return true;
        }
    }
    return false;
}

function Shape(orientations, color, symmetrical) {

    $.extend(this, {
        x: 0,
        y: 0,
        symmetrical,
        init() {
            $.extend(this, {
                orientation: 0,
                x: Math.floor(WIDTH / 2) - 1,
                y: -1
            });
            return this;
        },
        color,
        blocksLen: orientations[0].length,
        orientations,
        orientation: 0,

        rotate(right) {
            var orientation = (this.orientation + (right ? 1 : -1) + 4) % 4;

            if (!checkCollisions(this.x, this.y, this.getBlocks(orientation)))
                this.orientation = orientation;
        },
        moveRight() {
            if (!checkCollisions(this.x + 1, this.y, this.getBlocks())) { this.x++; }
        },
        moveLeft() {
            if (!checkCollisions(this.x - 1, this.y, this.getBlocks()))
                this.x--;
        },
        getBlocks(orientation) {
            return this.orientations[orientation !== undefined ? orientation : this.orientation];
        },
        draw(drop, _x, _y, _orientation, _ctx) {
            if (drop) { this.y++; }

            var blocks = this.getBlocks(_orientation)
                , x = _x === undefined ? this.x : _x
                , y = _y === undefined ? this.y : _y
                , i = 0;
            for (; i < this.blocksLen; i += 2) {
                drawBlock(x + blocks[i], y + blocks[i + 1], this.color, _ctx);
            }
        },
        getBounds(_blocks) {

            var blocks = $.isArray(_blocks) ? _blocks : this.getBlocks(_blocks)
                , i = 0
                , len = blocks.length
                , minx = 999
                , maxx = -999
                , miny = 999
                , maxy = -999;
            for (; i < len; i += 2) {
                if (blocks[i] < minx) { minx = blocks[i]; }
                if (blocks[i] > maxx) { maxx = blocks[i]; }
                if (blocks[i + 1] < miny) { miny = blocks[i + 1]; }
                if (blocks[i + 1] > maxy) { maxy = blocks[i + 1]; }
            }
            return {
                left: minx,
                right: maxx,
                top: miny,
                bottom: maxy,
                width: maxx - minx,
                height: maxy - miny
            };
        }
    });

    return this.init();
}

var shapeFactory = {
    line() {
        /*
         *   X        X
         *   O  XOXX  O XOXX
         *   X        X
         *   X        X
         */
        var ver = [0, -1, 0, -2, 0, -3, 0, -4]
            , hor = [-1, -2, 0, -2, 1, -2, 2, -2];
        return new Shape([ver, hor, ver, hor], "#f90", true);
    },
    square() {
        /*
         *  XX
         *  XX
         */
        var s = [0, 0, 1, 0, 0, -1, 1, -1];
        return new Shape([s, s, s, s], "red", true);
    },
    arrow() {
        /*
         *    X   X       X
         *   XOX  OX XOX XO
         *        X   X   X
         */
        return new Shape([[0, -1, 1, -1, 2, -1, 1, -2], [1, -2, 1, -1, 1, 0, 2, -1], [0, -1, 1, -1, 2, -1, 1, 0], [0, -1, 1, -1, 1, -2, 1, 0]], "yellow");
    },
    rightHook() {
        /*
         *       XX   X X
         *   XOX  O XOX O
         *   X    X     XX
         */
        return new Shape([[0, 0, 0, -1, 1, -1, 2, -1], [0, -2, 1, 0, 1, -1, 1, -2], [0, -1, 1, -1, 2, -1, 2, -2], [0, -2, 0, -1, 0, 0, 1, 0]], "blue");
    },
    leftHook() {
        /*
         *        X X   XX
         *   XOX  O XOX O
         *     X XX     X
         */
        return new Shape([[2, 0, 0, -1, 1, -1, 2, -1], [0, 0, 1, 0, 1, -1, 1, -2], [0, -2, 0, -1, 1, -1, 2, -1], [0, 0, 0, -1, 0, -2, 1, -2]], "purple");
    },
    leftZag() {
        /*
         *        X
         *   XO  OX
         *    XX X
         */
        var ver = [0, 0, 0, -1, 1, -1, 1, -2]
            , hor = [0, -1, 1, -1, 1, 0, 2, 0];
        return new Shape([hor, ver, hor, ver], "gray", true);
    },
    rightZag() {
        /*
         *       X
         *    OX OX
         *   XX   X
         */
        var ver = [0, -2, 0, -1, 1, -1, 1, 0]
            , hor = [0, 0, 1, 0, 1, -1, 2, -1];
        return new Shape([hor, ver, hor, ver], "green", true);
    }

};

var shapeFuncs = [];
$.each(shapeFactory, function (k, v) {
    shapeFuncs.push(v);
});

var info = {
    mode: null,
    modes: ["random", "nice", "evil"],
    modesY: 170,
    autopilotY: null,
    draw() {
        infoCtx.clearRect(0, 0, infoCanvas.width, infoCanvas.height);

        if (board.next) {
            var bounds = board.next.getBounds(0)
                , w = 5
                , h = 6;
            infoCtx.fillStyle = "#f8f9fa";
            infoCtx.fillRect(0, 0, w * blockSize, h * blockSize);
            infoCtx.fillStyle = "#111";
            infoCtx.fillRect(borderWidth, borderWidth, w * blockSize - 2 * borderWidth, h * blockSize - 2 * borderWidth);
            board.next.draw(false, (w - bounds.width) / 2 - bounds.left - 0.5,
                (h - bounds.height) / 2 + bounds.height - bounds.bottom - 0.5, 0, infoCtx);
        }

        infoCtx.font = "bold 14px/20px 'lucida grande',helvetica,arial";
        infoCtx.fillStyle = "#f8f9fa";
        infoCtx.fillText("Lines: " + board.lines, 0, 140);

        var y;

        infoCtx.fillText("Shape Mode:", 0, this.modesY);
        for (var i = 0, len = this.modes.length, selected, y; i < len; i++) {
            selected = this.mode === this.modes[i];
            y = this.modesY + (i + 1) * 20;
            this.radio(0, y, selected);
            infoCtx.fillStyle = "#f8f9fa";
            infoCtx.fillText(this.modes[i], 20, y);
        }

        if (this.autopilotY === null) { this.autopilotY = y + 30; }

        this.checkBox(0, this.autopilotY, window.autopilot);
        infoCtx.fillStyle = "#f8f9fa";
        infoCtx.fillText("autopilot", 20, this.autopilotY);
    },
    init() {
        this.mode = this.modes[0];

        for (var attr in shapeFactory) { this.modes.push(attr); }

        $(window).trigger("hashchange");


        var self = this;
        $(infoCanvas).click(function (evt) {
            evt.preventDefault();
            var offset = $(infoCanvas).offset(), x = evt.pageX - offset.left, y = evt.pageY - offset.top, mode;
            if (y > self.modesY) {
                mode = self.modes[Math.floor((y - self.modesY) / 20)];
                if (mode) {
                    window.location.hash = mode;
                    self.setMode(mode);
                } else if (self.autopilotY - 20 <= y && y <= self.autopilotY) {
                    window.autopilot = !window.autopilot;
                }
            }
        });
    },
    setMode(mode) {
        var title = document.title.split(" - ")
            , firstEnd = title[0].split(" ").pop()
            , newFirst = mode;
        newFirst = (newFirst.charAt(0).toUpperCase() + newFirst.substring(1).replace(/([A-Z])/g, " $1"));
        title[0] = newFirst += " " + firstEnd;
        $("#game-wrap").find("h1").text(title[0]);
        document.title = title.join(" - ");


        this.mode = mode;
        board.nextShape(true);
    },
    circle(x, y, r, color) {
        infoCtx.beginPath();
        if (color) { infoCtx.fillStyle = color; }
        infoCtx.arc(x, y, r, 0, 2 * Math.PI, true);
        infoCtx.closePath();
        infoCtx.fill();
    },
    radio(x, y, selected) {
        y -= 4;
        x += 8;
        this.circle(x, y, 6, "#333");
        this.circle(x, y, 5, "#fff");
        if (selected) { this.circle(x, y, 4, "#333"); }
    },
    checkBox(x, y, selected) {
        y -= 4;
        x += 8;
        infoCtx.fillStyle = "#333";
        infoCtx.fillRect(x - 6, y - 6, 12, 12);
        infoCtx.fillStyle = "#fff";
        infoCtx.fillRect(x - 5, y - 5, 10, 10);

        if (selected) {
            infoCtx.strokeStyle = "#333";
            infoCtx.beginPath();
            infoCtx.moveTo(x - 6, y - 6);
            infoCtx.lineTo(x + 6, y + 6);
            infoCtx.moveTo(x - 6, y + 6);
            infoCtx.lineTo(x + 6, y - 6);
            infoCtx.closePath();
            infoCtx.stroke();
        }
    }
};

var board = {
    animateDelay: 50,
    cur: null,

    lines: 0,

    dropCount: 0,
    dropDelay: 16,


    init() {
        this.cur = this.nextShape();

        ctx.font = "bold 30px/40px 'lucida grande',helvetica,arial";
        ctx.fillStyle = "#f8f9fa";
        ctx.fillText(" Click", 50, 120);
        ctx.fillText("to start", 50, 160);

        var start = [], colors = [], i, ilen, j, jlen, color;

        for (i in shapeFactory) {
            colors.push(shapeFactory[i]().color);
        }

        for (i = 0,
            ilen = WIDTH; i < ilen; i++) {
            for (j = 0,
                jlen = randChoice([randInt(0, 8), randInt(5, 9)]); j < jlen; j++) {
                if (!color || !randInt(0, 3)) { color = randChoice(colors); }
                start.push([i, HEIGHT - j, color]);
            }
        }

        for (i = 0, ilen = start.length; i < ilen; i++) { drawBlock.apply(drawBlock, start[i]); }
    },
    nextShape(setNextOnly) {
        var next = this.next, func, shape, result;

        if (shapeFactory[info.mode]) { func = shapeFactory[info.mode]; }
        else if (info.mode === "nice" || info.mode === "evil")
            func = niceShapes;
        else
            func = randChoice(shapeFuncs);

        if (func.no_preview) {
            this.next = null;
            if (setNextOnly)
                return null;
            shape = func(filled, checkCollisions, WIDTH, HEIGHT, info.mode);
            if (!shape) { throw new Error("No shape returned from shape function!", func); }
            shape.init();
            result = shape;
        } else {
            shape = func(filled, checkCollisions, WIDTH, HEIGHT, info.mode);
            if (!shape) { throw new Error("No shape returned from shape function!", func); }
            shape.init();
            this.next = shape;
            if (setNextOnly)
                return null;
            result = next || this.nextShape();
        }

        if (window.autopilot) {

            niceShapes(filled, checkCollisions, WIDTH, HEIGHT, "nice", result);
            $.extend(result, {
                orientation: result.best_orientation,
                x: result.best_x
            });
        }

        return result;
    },
    animate() {
        var drop = false
            , gameOver = false;

        if (!this.paused) {
            this.dropCount++;
            if (this.dropCount >= this.dropDelay || window.autopilot) {
                drop = true;
                this.dropCount = 0;
            }


            if (drop) {
                var cur = this.cur
                    , x = cur.x
                    , y = cur.y
                    , blocks = cur.getBlocks();
                if (checkCollisions(x, y + 1, blocks, true)) {
                    drop = false;
                    for (var i = 0; i < cur.blocksLen; i += 2) {
                        filled.add(x + blocks[i], y + blocks[i + 1], cur.color);
                        if (y + blocks[i] < 0) {
                            gameOver = true;
                        }
                    }
                    filled.checkForClears();
                    this.cur = this.nextShape();
                }
            }


            ctx.clearRect(0, 0, PIXEL_WIDTH, PIXEL_HEIGHT);
            filled.draw();
            this.cur.draw(drop);
            info.draw();
        }

        if (!gameOver) {
            window.setTimeout(function () {
                board.animate();
            }, this.animateDelay);
        }
    }
};

var filled = {
    data: new Array(WIDTH * HEIGHT),
    toClear: {},
    check(x, y) {
        return this.data[this.asIndex(x, y)];
    },
    add(x, y, color) {
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) { this.data[this.asIndex(x, y)] = color; }
    },
    asIndex(x, y) {
        return x + y * WIDTH;
    },
    asX(index) {
        return index % WIDTH;
    },
    asY(index) {
        return Math.floor(index / WIDTH);
    },
    _popRow(rowToPop) {
        for (var i = WIDTH * (rowToPop + 1) - 1; i >= 0; i--) {
            this.data[i] = (i >= WIDTH ? this.data[i - WIDTH] : undefined);
        }
    },
    checkForClears() {
        var rows = [], i, len, count, mod;

        for (i = 0,
            len = this.data.length; i < len; i++) {
            mod = this.asX(i);
            if (mod === 0) { count = 0; }
            if (this.data[i] && typeof this.data[i] == "string") {
                count += 1;
            }
            if (mod === WIDTH - 1 && count === WIDTH) { rows.push(this.asY(i)); }
        }

        for (i = 0,
            len = rows.length; i < len; i++) {
            this._popRow(rows[i]);
            board.lines++;
            if (board.lines % 10 === 0 && board.dropDelay > 1) { board.dropDelay -= 2; }
        }
    },
    draw() {
        for (var i = 0, len = this.data.length, row, color; i < len; i++) {
            if (this.data[i] !== undefined) {
                row = this.asY(i);
                color = this.data[i];
                drawBlock(this.asX(i), row, color);
            }
        }
    }
};

var niceShapes = getNiceShapes(shapeFactory);







$(window).bind("hashchange", function (evt) {
    var hash = window.location.href.split("#")[1] || ""
        , i = 0
        , len = info.modes.length;
    for (; i < len; i++) {
        if (info.modes[i] === hash) {
            if (info.mode !== hash) {
                info.setMode(hash);
            }
            break;
        }
    }
});

info.init();
board.init();

function startBoard(evt) {
    evt.preventDefault();
    board.started = true;
    board.animate();
    return false;
}

$(document).keyup(function (evt) {
    return (!board.started && (evt.keyCode === 13 || evt.keyCode === 32)) ? startBoard(evt) : true;
});

$(canvas).click(function (evt) {
    return (!board.started) ? startBoard(evt) : true;
});

$(document).keyup(function (evt) {
    if (evt.keyCode === 80) {
        /*p*/
        board.paused = !board.paused;
    } else if (evt.keyCode === 192) {
        /*`*/
        window.autopilot = !window.autopilot;
    }
});

$(document).safekeypress(function (evt) {
    var caught = false;
    if (board.cur) {
        caught = true;
        switch (evt.keyCode) {
            case 37:
                /*left*/
                board.cur.moveLeft();
                break;
            case 38:
                /*up*/
                board.cur.rotate(true);
                break;
            case 39:
                /*right*/
                board.cur.moveRight();
                break;
            case 40:
                /*down*/
                board.dropCount = board.dropDelay;
                break;
            case 88:
                /*x*/
                board.cur.rotate(true);
                break;
            case 90:
                /*z*/
                board.cur.rotate(false);
                break;
            default:
                caught = false;
        }
    }
    if (caught)
        evt.preventDefault();
    return !caught;
});
