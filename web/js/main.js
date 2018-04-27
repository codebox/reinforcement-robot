$(() => {
    "use strict";

    const $grid = $('#grid'),
        model = buildModel(10,10),
        view = buildView($grid);

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

    $(view).on('reset', () => model.forEach(item => {
        item.value = 0;
        item.selected = false;
    }));

    $(view).on('moveRobotBy', (_, dx, dy) => {
        const robotLocation = model.getRobotLocation();
        model.setRobotLocation(robotLocation.x + dx, robotLocation.y + dy);
    });

    model.forEach(item => item.value = 0);
    model.setRobotLocation(1,1);
});