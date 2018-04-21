$(() => {
    "use strict";

    const $grid = $('#grid'),
        model = buildModel(10,10),
        view = buildView($grid);

    view.render(model);

    $(model).on('change', (_, x, y, v) => {
        view.updateCell(x,y,v);
    });
    model.init(0);

    $(view).on('update', (_, x, y, v) => {
        model.set(x, y, v);
    })

    // let mouseDown = false;
    //
    // $('#grid').on('mouseup', () => {
    //     mouseDown = false;
    // });
    // $('#grid').on('mousedown', () => {
    //     mouseDown = true;
    // });

    // $grid.find('.gridCell').on('mousemove', e => {
    //     if (mouseDown) {
    //         console.log(this)
    //         $(e.target).addClass('selected');
    //     }
    // });
});