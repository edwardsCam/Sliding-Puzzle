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
        bh = 50;

    var default_colors = {
        'default': all_colors[0],
        'hover': all_colors[1],
        'active': all_colors[2]
    };

    GAME.backButton = new Button(GAME.blocksize * GAME.size + 50, GAME.canvas.height / 2 + 100, bw, bh, 'Back', default_colors,
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
            mean: 40,
            stdev: 10
        },
        lifetime: {
            mean: 2,
            stdev: 0.8
        }
    });

    GAME.currtime = performance.now();

    (function setVariables() {
        var shuf = 200;
        GAME.pressed = false;
        GAME.over = false;
        GAME.currentKey = 0;
        GAME.keyIsPressed = false;
        GAME.changed_flag = false;
        GAME.particles = [];
        GAME.grid = [];
        GAME.empty = {};
        for (var i = 0; i < GAME.size; i++) {
            GAME.grid[i] = [];
            for (var j = 0; j < GAME.size; j++) {
                if (i == GAME.size - 1 && j == GAME.size - 1) {
                    GAME.grid[i][j] = -1;
                    GAME.empty = {
                        i: GAME.size - 1,
                        j: GAME.size - 1
                    };
                } else {
                    GAME.grid[i][j] = i * GAME.size + j;
                }
            }
        }

        for (var i = 0; i < shuf; i++) {
            MoveOneRandomly();
        }
    }());

    //------------------------------------------------------------------
    //
    // This is the Game Loop function!
    //
    //------------------------------------------------------------------
    function gameLoop() {

        var delta = performance.now() - GAME.currtime;

        if (!GAME.over) {
            GatherInput();
            UpdateGameLogic(delta);
        }
        Render(delta);

        requestAnimationFrame(gameLoop);
    };

    function GatherInput() {
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

    function UpdateGameLogic(delta) {

        GAME.currtime += delta;

    }

    function Render(delta) {
        GAME.graphics.clear();
        GAME.backButton.update();
        GAME.backButton.draw();

        var spec = {};
        spec.size = GAME.easy ? 128 : 64;
        var base_str = "img/Tile" + (GAME.easy ? "128" : "64") + "-";

        for (var i = 0; i < GAME.size; i++) {
            for (var j = 0; j < GAME.size; j++) {
                var n = GAME.grid[i][j];
                if (n != -1 && n <= 62) {
                    var img_str = base_str + n + ".png";
                    spec.image = GAME.images[img_str];
                    spec.y = i * GAME.blocksize;
                    spec.x = j * GAME.blocksize;
                    GAME.graphics.drawImage(spec);
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

    function MoveOneRandomly() {
        var r = random(4) - 1;
        var i = GAME.empty.i;
        var j = GAME.empty.j;
        switch (r) {

            case 0:
                if (i > 0) {
                    GAME.grid[i][j] = GAME.grid[i - 1][j];
                    GAME.grid[i - 1][j] = -1;
                    GAME.empty.i--;
                }
                break;
            case 1:
                if (j > 0) {
                    GAME.grid[i][j] = GAME.grid[i][j - 1];
                    GAME.grid[i][j - 1] = -1;
                    GAME.empty.j--;
                }
                break;
            case 2:
                if (i < GAME.size - 1) {
                    GAME.grid[i][j] = GAME.grid[i + 1][j];
                    GAME.grid[i + 1][j] = -1;
                    GAME.empty.i++;
                }
                break;
            case 3:
                if (j < GAME.size - 1) {
                    GAME.grid[i][j] = GAME.grid[i][j + 1];
                    GAME.grid[i][j + 1] = -1;
                    GAME.empty.j++;
                }
                break;
        }
    }

    function MoveBlock(i, j) {
        for (var d = 0; d < 4; d++) {
            if (d == 0) {
                if (i > 0 && GAME.grid[j][i - 1] == -1) {
                    Move(i, j, 0);
                    break;
                }
            } else if (d == 1) {
                if (j > 0 && GAME.grid[j - 1][i] == -1) {
                    Move(i, j, 1);
                    break;
                }
            } else if (d == 2) {
                if (i < GAME.size - 1 && GAME.grid[j][i + 1] == -1) {
                    Move(i, j, 2);
                    break;
                }
            } else {
                if (j < GAME.size - 1 && GAME.grid[j + 1][i] == -1) {
                    Move(i, j, 3);
                    break;
                }
            }
        }
    }

    function Move(j, i, dir) {
        switch (dir) {
            case 0:
                GAME.grid[i][j - 1] = GAME.grid[i][j];
                break;
            case 1:
                GAME.grid[i - 1][j] = GAME.grid[i][j];
                break;
            case 2:
                GAME.grid[i][j + 1] = GAME.grid[i][j];
                break;
            case 3:
                GAME.grid[i + 1][j] = GAME.grid[i][j];
                break;
        }
        GAME.grid[i][j] = -1;
    }

    requestAnimationFrame(gameLoop);

};