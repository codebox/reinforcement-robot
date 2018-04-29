$(() => {
    "use strict";

    const model = buildModel(10, 10),
        view = buildView($('#grid')),
        controller = buildController();

    controller.init(model, view);

});