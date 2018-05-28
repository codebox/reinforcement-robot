function buildConfigs() {
    "use strict";

    function addRobot(model, policy, x, y, id) {
        const robot = buildRobot();
        robot.policy = policy;
        robot.position = {x,y};
        model.addRobot(robot, x, y);
    }

    function addBlock(model, x, y, id) {
        model.forLocation(x, y, l => {
            l.contents = {
                block : true
            };
        });
    }

    const data = {
        'Random' : model => {
            model.forEachLocation(l => {
                const MAX = 100, MIN = -100;
                l.value = Math.floor((Math.random() * (MAX - MIN)) + MIN);
                l.contents = undefined;
            });
        },
        'Blank' : model => {
            model.forEachLocation(l => {
                l.value = 0;
                l.contents = undefined;
            });
        },
        'Find the Centre' : model => {
            model.forEachLocation(l => {
                const d = Math.floor(Math.pow((l.x - (model.width-1)/2) ** 2 + (l.y - (model.height-1)/2) ** 2, 0.5));
                l.value = 100 - d * 30;
                l.contents = undefined;
            });

            const policy = buildPolicy(model);
            addRobot(model, policy, 0, 0, 'A');
            addRobot(model, policy, 0, model.height - 1, 'B');
            addRobot(model, policy, model.width - 1, 0, 'C');
            addRobot(model, policy, model.width - 1, model.height - 1, 'D');

            const x1 = 2, x2 = model.width - 3, y1 = 2, y2 = model.height - 3;
            addBlock(model, x1, y1);
            addBlock(model, x1, y1+2);
            addBlock(model, x1+2, y1);

            addBlock(model, x1, y2);
            addBlock(model, x1, y2-2);
            addBlock(model, x1+2, y2);

            addBlock(model, x2, y1);
            addBlock(model, x2-2, y1);
            addBlock(model, x2, y1+2);

            addBlock(model, x2, y2);
            addBlock(model, x2-2, y2);
            addBlock(model, x2, y2-2);
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