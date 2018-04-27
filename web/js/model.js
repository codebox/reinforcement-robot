function buildModel(width, height) {
    "use strict";

    const data = {};
    let robotLocation;

    function buildItem(x, y) {
        let itemValue, itemSelected, hasRobot;

        return {
            x, y,
            set value(v) {
                if (v !== itemValue) {
                    itemValue = v;
                    $(model).trigger('change', this);
                }
            },
            get value() {
                return itemValue;
            },
            set selected(s) {
                if (s !== itemSelected) {
                    itemSelected = s;    
                    $(model).trigger('change', this);
                }                
            },
            get selected() {
                return !! itemSelected;
            },
            set robot(r) {
                if (r !== hasRobot) {
                    hasRobot = r;
                    $(model).trigger('change', this);
                }
            },
            get robot() {
                return hasRobot;
            }
        };
    }

    function forItem(x, y, fn) {
        const item = data[x] && data[x][y];
        if (item) {
            fn(item);
        } else {
            console.warn(`Invalid model operation requested at ${x}/${y}`)
        }
    }

    const model = {
        get(x, y) {
            return data[x][y];
        },

        getRobotLocation() {
            return robotLocation;
        },

        setRobotLocation(x, y) {
            forItem(x, y, item => {
                if (robotLocation) {
                    robotLocation.robot = false;
                }
                robotLocation = item;
                robotLocation.robot = true;
            });
        },

        setValue(x, y, newValue) {
            forItem(x, y, item => item.value = newValue);
        },

        setSelected(x, y, isSelected = true) {
            forItem(x, y, item => item.selected = isSelected);
        },

        forEach(fn) {
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    forItem(x, y, fn);
                }
            }            
        },

        width, height
    }

    for (let x = 0; x < width; x++) {
        data[x] = [];
        for (let y = 0; y < height; y++) {
            data[x][y] = buildItem(x, y);
        }
    }

    return model;
}