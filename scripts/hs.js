// Derived from sample code taken from http://blog.sklambert.com/html5-game-tutorial-game-ui-canvas-vs-dom/
var canvas = document.getElementById('canvas-hs'),
    ctx = canvas.getContext('2d');

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

window.onload = function() {
    showScores();
}

function showScores() {
    var time = document.getElementById('id-time'),
        moves = document.getElementById('id-moves'),
        item,
        key;

    time.innerHTML = '';
    moves.innerHTML = '';
    var disptimes = [];
    var dispmoves = [];

    function compare(a,b) {
      if (a.v < b.v)
         return 1;
      if (a.v > b.v)
        return -1;
      return 0;
    }

    for (item = 0; item < localStorage.length; item++) {
        key = localStorage.key(item);
        if (key.length > 1 && key[0] == 0) {
            disptimes[disptimes.length] = {k : key.substr(2), v : localStorage[key]};
        }
    }
    for (item = 0; item < localStorage.length; item++) {
        key = localStorage.key(item);
        if (key.length > 1 && key[0] == 1) {
            dispmoves[dispmoves.length] = {k : key.substr(2), v : localStorage[key]};
        }
    }

    disptimes.sort(compare);
    dispmoves.sort(compare);

    for (var i = 0; i < 5; i++) {
        console.log(disptimes[i]);
        time.innerHTML += ((i+1) + ': ' + disptimes[i].k + '....      ' + disptimes[i].v + ' seconds<br>');
        moves.innerHTML += ((i+1) + ': ' + dispmoves[i].k + '....      ' + dispmoves[i].v + ' moves<br>');
    }
}


(function() {

    // mouse event variables
    var mousePosition = {
        x: 0,
        y: 0
    };
    var mousePressed = false;

    /**
     * Track the user's mouse position on mouse move.
     * @param {Event} event
     */
    canvas.addEventListener('mousemove', function(event) {
        mousePosition.x = event.offsetX || event.layerX;
        mousePosition.y = event.offsetY || event.layerY;
    });

    /**
     * Track the user's clicks.
     * @param {Event} event
     */
    canvas.addEventListener('mousedown', function(event) {
        mousePressed = true;
    });
    canvas.addEventListener('mouseup', function(event) {
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
            ctx.save();

            var colors = this.colors[this.state];
            var halfH = this.height / 2;

            // button
            ctx.fillStyle = colors.top;
            ctx.fillRect(this.x, this.y, this.width, halfH);
            ctx.fillStyle = colors.bottom;
            ctx.fillRect(this.x, this.y + halfH, this.width, halfH);

            // text
            var size = ctx.measureText(this.text);
            var x = this.x + (this.width - size.width / 2) / 2;
            var y = this.y + (this.height - 15) / 2 + 12;

            ctx.fillStyle = '#FFF';
            ctx.font = '15px sans-serif';
            ctx.fillText(this.text, x, y);

            ctx.restore();
        };
    }

    var bw = 200,
        bh = 50;

    var default_colors = {
        'default': all_colors[0],
        'hover': all_colors[1],
        'active': all_colors[2]
    };

    var backButton = new Button(canvas.width / 2 - bw / 2, canvas.height / 2 - 25, bw, 50, 'Back', default_colors,
        function() {
            document.location.href = "index.html";
        });

    function animate() {
        requestAnimationFrame(animate);
        ctx.font = '30px sans-serif';
        ctx.fillText("High Scores", canvas.width / 2 - 70, 50);
        backButton.update();
        backButton.draw();
    }

    requestAnimationFrame(animate);
})();