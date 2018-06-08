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
                try{
                    op(l);    
                } catch (err) {
                    console.error(err);
                }                
            }
        });
    }

    function addRobot(model, matcher) {
        set(model, matcher, l => {
            const robot = buildRobot();
            robot.position = {x:l.x, y:l.y};
            model.addRobot(robot, l.x, l.y);
        });
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

    function rnd(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    const data = {
        'Random' : model => {
            const GRID_SIZE = 12;
            setGridSize(model, GRID_SIZE);

            set(model, l => true, l => {
                const LIMIT = 100;
                l.value = rnd(-LIMIT, LIMIT);
                l.contents = undefined;
            });

            const robotCount = rnd(1,5);
            for (let i=0; i<robotCount; i++) {
                addRobot(model, at(rnd(0, GRID_SIZE-1), rnd(0, GRID_SIZE-1)));
            }

            const blockCount = rnd(5,20);
            for (let i=0; i<blockCount; i++) {
                addBlock(model, at(rnd(0, GRID_SIZE-1), rnd(0, GRID_SIZE-1)));
            }
            model.rounds = 10;
            model.moveCost = 1;
        },
        'Blank' : model => {
            setGridSize(model, 12);
            set(model, l => true, l => {
                l.value = 0;
                l.contents = undefined;
            });
            model.rounds = 10;
            model.moveCost = 1;
        },
        'Classic' : model => {            
            setGridSize(model, 4, 3);            
            addBlock(model, at(1,1)); 
            addTerminal(model, at(3,0));
            setValue(model, at(3,0), 100);
            addTerminal(model, at(3,1));
            setValue(model, at(3,1), -100);

            addRobot(model, at(3, 2))
            model.rounds = 5;
            model.moveCost = 3;
        },
        'Find the Centre' : model => {
            setGridSize(model, 10);

            model.forEachLocation(l => {
                const d = Math.floor(Math.pow((l.x - (model.width-1)/2) ** 2 + (l.y - (model.height-1)/2) ** 2, 0.5));
                l.value = 100 - d * 30;
                l.contents = undefined;
            });

            addRobot(model, at(0, 0));
            addRobot(model, at(0, model.height - 1));
            addRobot(model, at(model.width - 1, 0));
            addRobot(model, at(model.width - 1, model.height - 1));

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

            model.rounds = 1;
            model.moveCost = 1;
        },
        'Maze' : model => {
            setGridSize(model, 12);

            addTerminal(model, at(2,2));
            addRobot(model, at(11, 11));

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

            model.rounds = 50;
            model.moveCost = 1;
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