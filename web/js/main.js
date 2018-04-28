$(() => {
    "use strict";

    const $grid = $('#grid'),
        model = buildModel(10,10),
        view = buildView($grid),
        strategy = buildStrategy(model),
        robots = [];

    view.render(model);

    $(model).on('change', (_, item) => {
        view.updateCell(item.x, item.y, item.value, item.selected, item.occupant);
        view.updateScores(robots);
    });

    $(view).on('updateValue', (_, x, y, v) => {
        model.setValue(x, y, v);
    })

    $(view).on('setBlock', (_, x, y, v) => {
        model.setBlock(x, y);
    })

    $(view).on('updateSelected', (_, x, y, s) => {
        model.setSelected(x, y, s);
    })

    $(view).on('deselectAll', () => {
        model.forEach(item => item.selected = false);
    })

    $(view).on('reset', () => {
        model.forEach(item => {
            item.value = 0;
            item.selected = false;
        });
        stopRobots();
    });

    $(view).on('moveRobotBy', (_, dx, dy) => {
        //model.setOccupant(robot.location.x + dx, robot.location.y + dy, robot); TODO
    });

    model.forEach(item => item.value = Math.floor(Math.random() * 200 - 100));

    const INTERVAL_MILLIS = 1000;
    let timer, nextRobot = 0;

    $(view).on('start', () => {
        if (timer === undefined) {
            timer = setInterval(() => {
                const robot = robots[nextRobot],
                    nextLocation = robot.planNextMove();
                model.setOccupant(nextLocation.x, nextLocation.y, robot);
                nextRobot = (nextRobot + 1) % robots.length;
            }, INTERVAL_MILLIS / robots.length);
        }
    });

    function stopRobots(){
        if (timer !== undefined) {
            clearInterval(timer);
            timer = undefined;
        }
    }
    $(view).on('stop', stopRobots);

    function initRobot(id, initX, initY) {
        const robot = buildRobot(id, strategy);
        model.setOccupant(initX, initY, robot);
        robots.push(robot);
    }

    function initRobots() {
        robots.length = 0;
        initRobot('A', 0, 0);
        initRobot('B', 0, 1);
        initRobot('C', 0, 2);
        initRobot('D', 1, 0);
        initRobot('E', 1, 1);
        initRobot('F', 1, 2);
    }

    initRobots();
});