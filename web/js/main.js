$(() => {
    "use strict";

    const SIZE = 10,
        model = buildModel(SIZE, SIZE),
        view = buildView($('#grid')),
        controller = buildController();

    controller.init(model, view);

});

