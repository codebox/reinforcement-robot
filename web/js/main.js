$(() => {
    "use strict";

    const model = buildModel(12, 12),
        view = buildView($('#grid')),
        controller = buildController();

    controller.init(model, view);

});