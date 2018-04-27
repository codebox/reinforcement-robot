$(() => {
    "use strict";

    const $grid = $('#grid'),
        model = buildModel(10,10),
        view = buildView($grid),
        strategy = buildStrategy(model);

    view.render(model);

    $(model).on('change', (_, item) => {
        view.updateCell(item.x, item.y, item.value, item.selected, item.robot, item.block);
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
        model.setRobotLocation(0,0);
    });

    $(view).on('moveRobotBy', (_, dx, dy) => {
        const robotLocation = model.getRobotLocation();
        model.setRobotLocation(robotLocation.x + dx, robotLocation.y + dy);
    });

    //model.forEach(item => item.value = 0);
    model.forEach(item => item.value = Math.floor(Math.random() * 200 - 100));
    model.setRobotLocation(0,0);

    const INTERVAL_MILLIS = 1000;
    let timer;

    $(view).on('start', () => {
        if (timer === undefined) {
            timer = setInterval(() => {
                const nextLocation = strategy.next(model.getRobotLocation());
                model.setRobotLocation(nextLocation.x, nextLocation.y);
            }, INTERVAL_MILLIS);
        }
    });

    $(view).on('stop', () => {
        if (timer !== undefined) {
            clearInterval(timer);
            timer = undefined;
        }
    });
});