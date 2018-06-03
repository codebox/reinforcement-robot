function buildConfigs() {
    "use strict";

    function at(x,y){
        return l => l.x === x && l.y === y;
    }

    function hLine(x1, x2, y){
        return l => l.y === y && l.x >= x1 && l.x <= x2;
    }

    function vLine(x, y1, y2){
        return l => l.x === x && l.y >= y1 && l.y <= y2;
    }

    function set(model, matcher, op) {
        model.forEachLocation(l => {
            if (matcher(l)){
                op(l);
            }
        });
    }

    function addRobot(model, x, y, id) {
        const robot = buildRobot();
        robot.position = {x,y};
        model.addRobot(robot, x, y);
    }

    function addBlock(model, matcher) {
        set(model, matcher, l => l.contents = {block:true});
    }

    function addTerminal(model, matcher) {
        set(model, matcher, l => l.contents = {terminal:true});
    }

    function setValue(model, matcher, value) {
        set(model, matcher, l => l.value = value);
    }

    function setGridSize(model, x, y) {
        model.width = x;
        model.height = y || x;
        model.reset();
    }

    const data = {
        'Random' : model => {
            setGridSize(model, 12);
            set(model, l => true, l => {
                const MAX = 100, MIN = -100;
                l.value = Math.floor((Math.random() * (MAX - MIN)) + MIN);
                l.contents = undefined;
            });
        },
        'Blank' : model => {
            setGridSize(model, 12);
            set(model, l => true, l => {
                l.value = 0;
                l.contents = undefined;
            });
        },
        'Classic' : model => {            
            setGridSize(model, 4, 3);            
            addBlock(model, at(1,1)); 
            addTerminal(model, at(3,0));
            setValue(model, at(3,0), 100);
            addTerminal(model, at(3,1));
            setValue(model, at(3,1), -100);

            addRobot(model, 3, 2, 'A')
        },
        'Find the Centre' : model => {
            setGridSize(model, 10);

            model.forEachLocation(l => {
                const d = Math.floor(Math.pow((l.x - (model.width-1)/2) ** 2 + (l.y - (model.height-1)/2) ** 2, 0.5));
                l.value = 100 - d * 30;
                l.contents = undefined;
            });

            addRobot(model, 0, 0, 'A');
            addRobot(model, 0, model.height - 1, 'B');
            addRobot(model, model.width - 1, 0, 'C');
            addRobot(model, model.width - 1, model.height - 1, 'D');

            const x1 = 2, x2 = model.width - 3, y1 = 2, y2 = model.height - 3;
            addBlock(model, at(x1, y1));
            addBlock(model, at(x1, y1+2));
            addBlock(model, at(x1+2, y1));

            addBlock(model, at(x1, y2));
            addBlock(model, at(x1, y2-2));
            addBlock(model, at(x1+2, y2));

            addBlock(model, at(x2, y1));
            addBlock(model, at(x2-2, y1));
            addBlock(model, at(x2, y1+2));

            addBlock(model, at(x2, y2));
            addBlock(model, at(x2-2, y2));
            addBlock(model, at(x2, y2-2));
        },
        'Maze' : model => {
            setGridSize(model, 12);

            addTerminal(model, at(2,2));
            addRobot(model, 11, 11, 'A');

            addBlock(model, hLine(1,3,1));
            addBlock(model, at(3,2));
            addBlock(model, hLine(1,3,3));

            addBlock(model, vLine(5,0,1));
            addBlock(model, vLine(5,3,4));
            addBlock(model, vLine(7,0,3));

            addBlock(model, hLine(9,11,1));
            addBlock(model, hLine(0,9,5));

            addBlock(model, at(11,5));
            addBlock(model, at(9,4));
            addBlock(model, hLine(9,10,3));

            addBlock(model, hLine(1,11,7));
            addBlock(model, at(0,9));
            addBlock(model, at(0,11));
            addBlock(model, vLine(2,9,11));
            addBlock(model, vLine(4,8,10));
            addBlock(model, vLine(6,9,11));

            addBlock(model, at(8,10));
            addBlock(model, at(10,11));
            addBlock(model, hLine(8,11,9));
        }
    };

    return {
        forEach(fn) {
            Object.keys(data).forEach(name => {
                fn(name, data[name]);
            });
        },
        apply(name, model) {
            data[name](model);
        }
    };
}