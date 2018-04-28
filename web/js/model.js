function buildModel(width, height) {
    "use strict";

    const data = {};

    function buildLocation(x, y) {
        let locationValue, locationSelected, locationOccupant;

        return {
            x, y,
            set value(v) {
                if (v !== locationValue) {
                    locationValue = v;
                    $(model).trigger('change', this);
                }
            },
            get value() {
                return locationValue;
            },

            set selected(s) {
                if (s !== locationSelected) {
                    locationSelected = s;
                    $(model).trigger('change', this);
                }                
            },
            get selected() {
                return !! locationSelected;
            },

            set occupant(o) {
                if (o !== locationOccupant) {
                    locationOccupant = o;
                    $(model).trigger('change', this);
                }
            },
            get occupant() {
                return locationOccupant;
            }

        };
    }

    function forLocation(x, y, fn) {
        const location = data[x] && data[x][y];
        if (location) {
            fn(location);
        } else {
            console.warn(`Invalid model operation requested at ${x}/${y}`)
        }
    }

    function addIfValid(arr, x, y) {
        forLocation(x, y, location => {
            if (!location.occupant) {
                arr.push(location);
            }
        });
    }

    function buildBlock() {
        return {block:true};
    }

    const model = {
        get(x, y) {
            return data[x][y];
        },

        getNeighbours(x, y) {
            const neighbours = [];

            addIfValid(neighbours, x-1, y);
            addIfValid(neighbours, x+1, y);
            addIfValid(neighbours, x, y-1);
            addIfValid(neighbours, x, y+1);

            return neighbours;
        },

        setOccupant(x, y, occupant) {
            forLocation(x, y, location => {
                if (occupant && occupant.location !== location) {
                    const oldLocation = occupant.location;
                    if (oldLocation) {
                        model.setOccupant(oldLocation.x, oldLocation.y);
                    }
                    occupant.location = location;
                }
                location.occupant = occupant;
            });
        },

        setValue(x, y, newValue) {
            forLocation(x, y, location => location.value = newValue);
        },

        setBlock(x, y) {
            model.setOccupant(x, y, buildBlock());
        },

        setSelected(x, y, isSelected = true) {
            forLocation(x, y, location => location.selected = isSelected);
        },

        forEach(fn) {
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    forLocation(x, y, fn);
                }
            }            
        },

        width, height
    }

    for (let x = 0; x < width; x++) {
        data[x] = [];
        for (let y = 0; y < height; y++) {
            data[x][y] = buildLocation(x, y);
        }
    }

    return model;
}