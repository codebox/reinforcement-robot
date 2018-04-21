function buildView($container) {
    function makeCellId(x,y) {
        "use strict";
        return `cell_${x}_${y}`;
    }

    const $setBoxValue = $('#setBoxValue'),
        $boxValue = $('#boxValue');

    const view = {
        render(model) {
            "use strict";

            function buildGrid(rowCount, columnCount) {
                function buildGridCell(x,y) {
                    return `<div class="gridCell" id="${makeCellId(x,y)}" data-x="${x}" data-y="${y}"></div>`;
                }
                function buildGridRow(y) {
                    const row = ['<div class="gridRow">'];
                    for (let x = 0; x < columnCount; x++) {
                        row.push(buildGridCell(x,y));
                    }
                    row.push('</div>');
                    return row.join('');
                }
                const rows = [];
                for (let y = 0; y < rowCount; y++) {
                    rows.push(buildGridRow(y));
                }
                return rows.join('');
            }
            $container.html(buildGrid(model.width, model.height));

            $container.find('.gridCell').click(e => {
                $(e.target).toggleClass('selected');
            });
        },
        updateCell(x,y,v) {
            "use strict";
            $(`#${makeCellId(x,y)}`).text(v);
        }
    };

    $setBoxValue.on('click', () => {
        "use strict";
        const newValue = Number($boxValue.val());

        $container.find('.gridCell.selected').each((_, el) => {
            const $el = $(el),
                x = Number($el.attr('data-x')),
                y = Number($el.attr('data-y'));
            $(view).trigger('update', [x, y, newValue]);
        });
    });
    return view;

}