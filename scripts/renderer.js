GAME.graphics = (function() {
    'use strict';

    GAME.canvas = document.getElementById('canvas-main');
    GAME.context = GAME.canvas.getContext('2d');

    //------------------------------------------------------------------
    //
    // Place a 'clear' function on the Canvas prototype, this makes it a part
    // of the canvas, rather than making a function that calls and does it.
    //
    //------------------------------------------------------------------
    CanvasRenderingContext2D.prototype.clear = function() {
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.clearRect(0, 0, GAME.canvas.width, GAME.canvas.height);
        this.restore();
    };

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        GAME.context.clear();
    }

    function drawImage(spec) {
        GAME.context.save();

        GAME.context.drawImage(
            spec.image,
            spec.x,
            spec.y,
            spec.size, spec.size);

        GAME.context.restore();
    }

    GAME.drawParticle = function(spec) {
        GAME.context.save();

        GAME.context.translate(spec.center.x, spec.center.y);
        GAME.context.rotate(spec.rotation);
        GAME.context.translate(-spec.center.x, -spec.center.y);

        GAME.context.drawImage(
            spec.image,
            spec.center.x - spec.size / 2,
            spec.center.y - spec.size / 2,
            spec.size, spec.size);

        GAME.context.restore();
    }

    //------------------------------------------------------------------
    //
    // This is used to create a texture function that can be used by client
    // code for rendering.
    //
    //------------------------------------------------------------------
    function Texture(spec) {
        var that = {};

        //todo

        return that;
    }

    return {
        clear: clear,
        drawImage: drawImage
    };
}());

//------------------------------------------------------------------
//
// This function performs the one-time game initialization.
//
//------------------------------------------------------------------
GAME.initialize = function initialize() {
    'use strict';

    var url = document.location.href;
    GAME.easy = url[url.length - 2] == 'u';
    if (GAME.easy) {
        GAME.blocksize = 128;
        GAME.size = 4;
    } else {
        GAME.blocksize = 64;
        GAME.size = 8;
    }

    var all_colors = [{
        top: '#1879BD',
        bottom: '#084D79'
    }, {
        top: '#678834',
        bottom: '#093905'
    }, {
        top: '#EB7723',
        bottom: '#A80000'
    }];


    var mousePosition = {
        x: 0,
        y: 0
    };
    var mousePressed = false;

    /**
     * Track the user's mouse position on mouse move.
     * @param {Event} event
     */
    GAME.canvas.addEventListener('mousemove', function(event) {
        mousePosition.x = event.offsetX || event.layerX;
        mousePosition.y = event.offsetY || event.layerY;
    });

    /**
     * Track the user's clicks.
     * @param {Event} event
     */
    GAME.canvas.addEventListener('mousedown', function(event) {
        mousePressed = true;
    });
    GAME.canvas.addEventListener('mouseup', function(event) {
        mousePressed = false;
    });



    function Button(x, y, w, h, text, colors, action) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.colors = colors;
        this.text = text;

        this.state = 'default'; // current button state

        var isClicking = false;

        /**
         * Check to see if the user is hovering over or clicking on the button.
         */
        this.update = function() {
            // check for hover
            if (mousePosition.x >= this.x && mousePosition.x <= this.x + this.width && mousePosition.y >= this.y && mousePosition.y <= this.y + this.height) {
                this.state = 'hover';

                // check for click
                if (mousePressed) {
                    this.state = "active";
                    isClicking = true;
                } else {
                    if (isClicking) {
                        action();
                    }
                    isClicking = false;
                }
            } else {
                this.state = 'default';
            }
        };

        /**
         * Draw the button.
         */
        this.draw = function() {
            GAME.context.save();
            GAME.context.font = '15px sans-serif';
            var colors = this.colors[this.state];
            var halfH = this.height / 2;

            // button
            GAME.context.fillStyle = colors.top;
            GAME.context.fillRect(this.x, this.y, this.width, halfH);
            GAME.context.fillStyle = colors.bottom;
            GAME.context.fillRect(this.x, this.y + halfH, this.width, halfH);

            // text
            var size = GAME.context.measureText(this.text);
            var x = this.x + (this.width - size.width) / 2;
            var y = this.y + (this.height - 15) / 2 + 12;

            GAME.context.fillStyle = '#FFF';

            GAME.context.fillText(this.text, x, y);

            GAME.context.restore();
        };
    }

    var bw = 200,
        bh = 70;

    var default_colors = {
        'default': all_colors[0],
        'hover': all_colors[1],
        'active': all_colors[2]
    };

    GAME.backButton = new Button(GAME.blocksize * GAME.size + 50, GAME.canvas.height / 2 + 70, bw, bh, 'Back', default_colors,
        function() {
            document.location.href = "index.html";
        });

    var fire = GAME.particleSystem({
        image: GAME.images['img/fire.png'],
        center: {
            x: 0,
            y: 0
        },
        speed: {
            mean: 50,
            stdev: 20
        },
        lifetime: {
            mean: 2,
            stdev: 0.8
        }
    });

    GAME.currtime = performance.now();

    (function setVariables() {
        GAME.scoretimes = [];
        GAME.scoremoves = [];
        GAME.wintime = 0;
        GAME.setwintime = false;
        GAME.pressed = false;
        GAME.over = false;
        GAME.particles = [];
        GAME.grid = [];
        GAME.sliding = false;
        GAME.slidingBlock = {};
        GAME.slideTimer = 0;
        GAME.slideTime = 700;
        GAME.moves = 0;
        for (var i = 0; i < GAME.size; i++) {
            GAME.grid[i] = [];
            for (var j = 0; j < GAME.size; j++) {
                if (i == GAME.size - 1 && j == GAME.size - 1) {
                    GAME.grid[i][j] = -1;
                } else {
                    GAME.grid[i][j] = i * GAME.size + j;
                }
            }
        }

        Shuffle();
    }());

    //------------------------------------------------------------------
    //
    // This is the Game Loop function!
    //
    //------------------------------------------------------------------
    function gameLoop() {

        var delta = performance.now() - GAME.currtime;

        GatherInput();
        UpdateGameLogic(delta);
        Render(delta);

        requestAnimationFrame(gameLoop);
    };

    function GatherInput() {
        if (!GAME.sliding && !GAME.over) {
            if (mousePressed) {
                if (!GAME.pressed) {
                    if (mousePosition.x <= 512 && mousePosition.y <= 512) {
                        var xpos = Math.floor(mousePosition.x / GAME.blocksize);
                        var ypos = Math.floor(mousePosition.y / GAME.blocksize);
                        MoveBlock(xpos, ypos);
                    }
                    GAME.pressed = true;
                }
            } else {
                GAME.pressed = false;
            }
        }
    }

    function UpdateGameLogic(delta) {
        var updateTime = false;
        if (!fire.isEmpty()) {
            updateTime = true;
            fire.update(delta / 1000);
        }

        if (!GAME.over) {
            updateTime = true;
            if (GAME.sliding) {
                GAME.slideTimer += delta;
                if (GAME.slideTimer >= GAME.slideTime) {
                    GAME.slideTimer = 0;
                    GAME.sliding = false;
                    var b = GAME.slidingBlock;
                    var n = {
                        x: GAME.slidingBlock.x,
                        y: GAME.slidingBlock.y
                    };
                    if (b.d == 0) {
                        n.x--;
                    } else if (b.d == 1) {
                        n.y--;
                    } else if (b.d == 2) {
                        n.x++;
                    } else {
                        n.y++;
                    }
                    GAME.grid[n.y][n.x] = GAME.grid[b.y][b.x];
                    GAME.grid[b.y][b.x] = -1;
                    GAME.slidingBlock = {};

                    var v = GAME.grid[n.y][n.x];
                    if (n.y * GAME.size + n.x == v) {
                        fire.setCenter({
                            x: n.x * GAME.blocksize + GAME.blocksize / 2,
                            y: n.y * GAME.blocksize + GAME.blocksize / 2
                        });
                        for (var i = 0; i < 50; i++) {
                            fire.create();
                        }
                    }
                }
            }
        }

        if (updateTime) {
            GAME.currtime += delta;
        }

        GAME.over = true;
        for (var i = 0; i < GAME.size; i++) {
            for (var j = 0; j < GAME.size; j++) {
                if (!(i == GAME.size-1 && j == GAME.size-1)) {
                    var v = GAME.grid[i][j];
                    if (i * GAME.size + j != v) {
                        GAME.over = false;
                        i = GAME.size;
                        break;
                    }
                }
            }
        }
        if (GAME.over && !GAME.setwintime) {
            GAME.wintime = GAME.currtime;
            GAME.setwintime = true;
        }
    }

    function Render(delta) {

        var canvas2 = GAME.blocksize * GAME.size + 50;

        GAME.graphics.clear();
        GAME.backButton.update();
        GAME.backButton.draw();

        GAME.context.fillStyle = "rgb(200,250,200)";
        GAME.context.fillRect(canvas2, 0, 200, 400);

        GAME.context.fillStyle = "rgb(100, 100, 250)";
        GAME.context.font = '20px sans-serif';
        GAME.context.fillText("Time: " + Math.floor(GAME.currtime / 1000), canvas2 + 15, 100);
        GAME.context.fillText("Moves: " + GAME.moves, canvas2 + 15, 120);

        var spec = {};
        spec.size = GAME.easy ? 128 : 64;
        var base_str = "img/Tile" + (GAME.easy ? "128" : "64") + "-";

        if (GAME.sliding) {
            for (var i = 0; i < GAME.size; i++) {
                for (var j = 0; j < GAME.size; j++) {
                    var n = GAME.grid[i][j];
                    if (n != -1 && n <= 62) {
                        var img_str = base_str + n + ".png";
                        spec.image = GAME.images[img_str];
                        spec.y = i * GAME.blocksize;
                        spec.x = j * GAME.blocksize;
                        var percent = (GAME.blocksize * GAME.slideTimer) / GAME.slideTime;
                        var b = GAME.slidingBlock;
                        if (i == b.y && j == b.x) {
                            if (b.d == 0) {
                                spec.x -= percent;
                            } else if (b.d == 1) {
                                spec.y -= percent;
                            } else if (b.d == 2) {
                                spec.x += percent;
                            } else {
                                spec.y += percent;
                            }
                        }
                        GAME.graphics.drawImage(spec);
                    }
                }
            }
        } else {
            var empty = {};
            for (var i = 0; i < GAME.size; i++) {
                for (var j = 0; j < GAME.size; j++) {
                    var n = GAME.grid[i][j];
                    if (n != -1) {
                        if (n <= 62) {
                            var img_str = base_str + n + ".png";
                            spec.image = GAME.images[img_str];
                            spec.y = i * GAME.blocksize;
                            spec.x = j * GAME.blocksize;
                            GAME.graphics.drawImage(spec);
                        }
                    } else {
                        empty = {
                            x: j,
                            y: i
                        };
                    }
                }
            }
            GAME.context.beginPath();
            GAME.context.lineWidth = "4";
            GAME.context.strokeStyle = "red";
            GAME.context.rect(empty.x * GAME.blocksize, empty.y * GAME.blocksize, GAME.blocksize, GAME.blocksize);
            GAME.context.stroke();
        }
        fire.render();

        if (GAME.over) {
            GAME.context.fillStyle = "rgb(240, 240, 240)";
            GAME.context.fillRect(0, GAME.canvas.height / 2 - GAME.canvas.height / 4, GAME.canvas.width, GAME.canvas.height / 3);
            GAME.context.fillStyle = "rgb(200, 0, 0)";
            GAME.context.font = '70px sans-serif';
            GAME.context.fillText("GAME OVER", GAME.canvas.width / 2 - 180, GAME.canvas.height / 2);
            if (!GAME.drewNameInput) {
                var div = document.getElementById("id-name-input-div");
                var str = '<span class="inp-field-left" style="position:absolute;left:500px;top:225px;width:1000px;">';
                str += 'Name: ';
                str += '<input type="text" id="id-name-input"/>';
                str += '<input type="submit" value="Submit" onClick="GAME.submitHighScore();"/>';
                str += '</span>';
                div.innerHTML = str;
                GAME.drewNameInput = true;
            }
        }

        GAME.context.beginPath();
        GAME.context.lineWidth = "4";
        GAME.context.strokeStyle = "black";
        GAME.context.rect(2, 2, GAME.blocksize * GAME.size-2, GAME.blocksize * GAME.size-2);
        GAME.context.stroke();

        GAME.context.beginPath();
        GAME.context.lineWidth = "4";
        GAME.context.strokeStyle = "black";
        GAME.context.rect(canvas2, 2, 186, 396);
        GAME.context.stroke();
    }

    function Shuffle() {
        var empty = {};
        for (var i = 0; i < GAME.size; i++) {
            for (var j = 0; j < GAME.size; j++) {
                if (GAME.grid[i][j] == -1) {
                    empty.x = j;
                    empty.y = i;
                    i = GAME.size;
                    break;
                }
            }
        }

        var times = GAME.easy ? 15 : 80;
        var prev = -1;
        for (var i = 0; i < times; i++) {
            var r = random(4) - 1;
            var moved = false;
            while (!moved) {
                if (r == 0) {
                    if (prev != 2 && empty.x < GAME.size - 1) {
                        GAME.grid[empty.y][empty.x] = GAME.grid[empty.y][empty.x + 1];
                        GAME.grid[empty.y][empty.x + 1] = -1;
                        empty.x++;
                        moved = true;
                        prev = r;
                        break;
                    } else {
                        r = ++r % 4;
                    }
                } else if (r == 1) {
                    if (prev != 3 && empty.y < GAME.size - 1) {
                        GAME.grid[empty.y][empty.x] = GAME.grid[empty.y + 1][empty.x];
                        GAME.grid[empty.y + 1][empty.x] = -1;
                        empty.y++;
                        moved = true;
                        prev = r;
                        break;
                    } else {
                        r = ++r % 4;
                    }
                } else if (r == 2) {
                    if (r == 2 && prev != 0 && empty.x > 0) {
                        GAME.grid[empty.y][empty.x] = GAME.grid[empty.y][empty.x - 1];
                        GAME.grid[empty.y][empty.x - 1] = -1;
                        empty.x--;
                        moved = true;
                        prev = r;
                        break;
                    } else {
                        r = ++r % 4;
                    }
                } else {
                    if (r == 3 && prev != 1 && empty.y > 0) {
                        GAME.grid[empty.y][empty.x] = GAME.grid[empty.y - 1][empty.x];
                        GAME.grid[empty.y - 1][empty.x] = -1;
                        empty.y--;
                        moved = true;
                        prev = r;
                        break;
                    } else {
                        r = ++r % 4;
                    }
                }
            }
        }
    }

    function random(top) {
        var ret = Math.floor(Math.random() * top) + 1;
        if (ret < 0)
            return 0;
        return ret;
    }

    function MoveBlock(x, y) {
        for (var d = 0; d < 4; d++) {
            if (d == 0) {
                if (x > 0 && GAME.grid[y][x - 1] == -1) {
                    Move(y, x, 0);
                    break;
                }
            } else if (d == 1) {
                if (y > 0 && GAME.grid[y - 1][x] == -1) {
                    Move(y, x, 1);
                    break;
                }
            } else if (d == 2) {
                if (x < GAME.size - 1 && GAME.grid[y][x + 1] == -1) {
                    Move(y, x, 2);
                    break;
                }
            } else {
                if (y < GAME.size - 1 && GAME.grid[y + 1][x] == -1) {
                    Move(y, x, 3);
                    break;
                }
            }
        }
    }

    function Move(i, j, dir) {
        GAME.moves++;
        GAME.sliding = true;
        GAME.slidingBlock = {
            x: j,
            y: i,
            d: dir
        };
    }

    GAME.submitHighScore = function() {
        var name = document.getElementById("id-name-input").value;

        addHighScoreTime(name, Math.floor( GAME.wintime/1000));
        addHighScoreMoves(name, GAME.moves);

        document.location.href = "index.html";
    }

    function addHighScoreTime(name, time) {
        if (GAME.scoretimes.length < 5) {
            GAME.scoretimes[GAME.scoretimes.length] = time;
            var key = [0, name];
            localStorage[key] = time;
        }
        else {

        }
    }

    function addHighScoreMoves(name, moves) {
        var key = [1, name];
        localStorage[key] = moves;
    }

    requestAnimationFrame(gameLoop);

};