function buildModel(width, height) {
    "use strict";

    const data = {};

    function checkCoords(x,y) {
        if (x < 0 || y < 0 || x >= width || y >= height){
            throw new Error(`Bad coords (${x},${y})`);
        }
    }

    const model = {
        get(x, y) {
            checkCoords(x, y);
            if (!data[x] || !data[x][y]) {
                return 0;
            }
            return data[x][y];
        },

        set(x, y, newVal) {
            checkCoords(x, y);
            if (!data[x]) {
                data[x] = [];
            }
            const oldVal = data[x][y];
            data[x][y] = newVal;

            if (newVal !== oldVal) {
                $(model).trigger('change', [x, y, newVal, oldVal]);
            }
        },

        init(val) {
            for(let x=0; x<width; x++){
                for(let y=0; y<width; y++){
                    model.set(x,y,val);
                }
            }
        },

        width, height
    }
    return model;
}