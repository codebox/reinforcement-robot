$(() => {
    "use strict";

    const model = buildModel(3,3),
        view = buildView($('#grid')),
        controller = buildController();

    controller.init(model, view);

});