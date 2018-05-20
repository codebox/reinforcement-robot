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
            let result;
            if (model.data[x] && model.data[x][y]) {
                result = fn(model.data[x][y]);
            }
            return result;
        },
        getNeighbours(x, y, walkIntoWalls) {
            const neighbours = [],
                location = model.forLocation(x, y, l => l);

            function addIfValid(arr, x, y) {
                model.forLocation(x, y, neighbourLocation => {
                    if (!neighbourLocation.contents) {
                        arr.push(neighbourLocation);
                    }
                });
            }

            addIfValid(neighbours, x-1, y);
            addIfValid(neighbours, x+1, y);
            addIfValid(neighbours, x, y-1);
            addIfValid(neighbours, x, y+1);

            if (walkIntoWalls) {
                for (let i = 0; i < 4 - neighbours.length; i++) {
                    neighbours.push(location);
                }
            }

            return neighbours;
        },
        width, height
    };

    for (let x = 0; x < width; x++) {
        model.data[x] = [];
        for (let y = 0; y < height; y++) {
            model.data[x][y] = {
                x, y, value : 0, terminal: false
            };
        }
    }


    return model;
}