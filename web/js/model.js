function buildModel(width, height) {
    "use strict";

    const model = {
        data : {},
        forEachLocation(fn) {
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    fn(model.data[x][y]);
                }
            }
        },
        forLocation(x, y, fn) {
            if (model.data[x] && model.data[x][y]) {
                fn(model.data[x][y]);
            }
        },
        getNeighbours(x, y) {
            const neighbours = [];

            function addIfValid(arr, x, y) {
                model.forLocation(x, y, location => {
                    if (!location.contents) {
                        arr.push(location);
                    }
                });
            }

            addIfValid(neighbours, x-1, y);
            addIfValid(neighbours, x+1, y);
            addIfValid(neighbours, x, y-1);
            addIfValid(neighbours, x, y+1);

            return neighbours;
        },
        width, height
    };

    for (let x = 0; x < width; x++) {
        model.data[x] = [];
        for (let y = 0; y < height; y++) {
            model.data[x][y] = {
                x, y, value : 0
            };
        }
    }


    return model;
}