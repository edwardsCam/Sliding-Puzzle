var GAME = {
    images: {},

    status: {
        preloadRequest: 0,
        preloadComplete: 0
    }
};

//------------------------------------------------------------------
//
// Wait until the browser 'onload' is called before starting to load
// any external resources.  This is needed because a lot of JS code
// will want to refer to the HTML document.
//
//------------------------------------------------------------------
window.addEventListener('load', function() {
    console.log('Loading resources...');

    Modernizr.load([{
        load: [
            'preload!scripts/random.js',
            'preload!scripts/particle-system.js',
            'preload!scripts/renderer.js',
            'preload!img/Tile64-0.png',
            'preload!img/Tile64-1.png',
            'preload!img/Tile64-2.png',
            'preload!img/Tile64-3.png',
            'preload!img/Tile64-4.png',
            'preload!img/Tile64-5.png',
            'preload!img/Tile64-6.png',
            'preload!img/Tile64-7.png',
            'preload!img/Tile64-8.png',
            'preload!img/Tile64-9.png',
            'preload!img/Tile64-10.png',
            'preload!img/Tile64-11.png',
            'preload!img/Tile64-12.png',
            'preload!img/Tile64-13.png',
            'preload!img/Tile64-14.png',
            'preload!img/Tile64-15.png',
            'preload!img/Tile64-16.png',
            'preload!img/Tile64-17.png',
            'preload!img/Tile64-18.png',
            'preload!img/Tile64-19.png',
            'preload!img/Tile64-20.png',
            'preload!img/Tile64-21.png',
            'preload!img/Tile64-22.png',
            'preload!img/Tile64-23.png',
            'preload!img/Tile64-24.png',
            'preload!img/Tile64-25.png',
            'preload!img/Tile64-26.png',
            'preload!img/Tile64-27.png',
            'preload!img/Tile64-28.png',
            'preload!img/Tile64-29.png',
            'preload!img/Tile64-30.png',
            'preload!img/Tile64-31.png',
            'preload!img/Tile64-32.png',
            'preload!img/Tile64-33.png',
            'preload!img/Tile64-34.png',
            'preload!img/Tile64-35.png',
            'preload!img/Tile64-36.png',
            'preload!img/Tile64-37.png',
            'preload!img/Tile64-38.png',
            'preload!img/Tile64-39.png',
            'preload!img/Tile64-40.png',
            'preload!img/Tile64-41.png',
            'preload!img/Tile64-42.png',
            'preload!img/Tile64-43.png',
            'preload!img/Tile64-44.png',
            'preload!img/Tile64-45.png',
            'preload!img/Tile64-46.png',
            'preload!img/Tile64-47.png',
            'preload!img/Tile64-48.png',
            'preload!img/Tile64-49.png',
            'preload!img/Tile64-50.png',
            'preload!img/Tile64-51.png',
            'preload!img/Tile64-52.png',
            'preload!img/Tile64-53.png',
            'preload!img/Tile64-54.png',
            'preload!img/Tile64-55.png',
            'preload!img/Tile64-56.png',
            'preload!img/Tile64-57.png',
            'preload!img/Tile64-58.png',
            'preload!img/Tile64-59.png',
            'preload!img/Tile64-60.png',
            'preload!img/Tile64-61.png',
            'preload!img/Tile64-62.png',
            'preload!img/Tile128-0.png',
            'preload!img/Tile128-1.png',
            'preload!img/Tile128-2.png',
            'preload!img/Tile128-3.png',
            'preload!img/Tile128-4.png',
            'preload!img/Tile128-5.png',
            'preload!img/Tile128-6.png',
            'preload!img/Tile128-7.png',
            'preload!img/Tile128-8.png',
            'preload!img/Tile128-9.png',
            'preload!img/Tile128-10.png',
            'preload!img/Tile128-11.png',
            'preload!img/Tile128-12.png',
            'preload!img/Tile128-13.png',
            'preload!img/Tile128-14.png'
        ],
        complete: function() {
            console.log('All files requested for loading...');
        }
    }]);
}, false);

//
// Extend yepnope with our own 'preload' prefix that...
// * Tracks how many have been requested to load
// * Tracks how many have been loaded
// * Places images into the 'images' object
yepnope.addPrefix('preload', function(resource) {
    console.log('preloading: ' + resource.url);

    GAME.status.preloadRequest += 1;
    var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
    resource.noexec = isImage;
    resource.autoCallback = function(e) {
        if (isImage) {
            var image = new Image();
            image.src = resource.url;
            GAME.images[resource.url] = image;
        }
        GAME.status.preloadComplete += 1;

        //
        // When everything has finished preloading, go ahead and start the game
        if (GAME.status.preloadComplete === GAME.status.preloadRequest) {
            console.log('Preloading complete!');
            GAME.initialize();
        }
    };

    return resource;
});

//
// Extend yepnope with a 'preload-noexec' prefix that loads a script, but does not execute it.  This
// is expected to only be used for loading .js files.
yepnope.addPrefix('preload-noexec', function(resource) {
    console.log('preloading-noexec: ' + resource.url);
    resource.noexec = true;
    return resource;
});