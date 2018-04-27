"use strict";
function buildView($container) {
    function makeCellId(x,y) {
        return `cell_${x}_${y}`;
    }

    function getX(el) {
        return Number($(el).attr('data-x'));
    }

    function getY(el) {
        return Number($(el).attr('data-y'));
    }

    const $setBoxValue = $('#setBoxValue'),
        $boxValue = $('#boxValue'),
        $deselectAll = $('#deselectAll'),
        $resetAll = $('#resetAll');

    const view = {
        render(model) {
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

            $container.find('.gridCell').on('mouseover mousedown', event => {
                if (event.buttons) {
                    $(view).trigger('updateSelected', [getX(event.target), getY(event.target), true]);
                }
            });

            $container.find('.gridCell').on('click', event => {
                $(view).trigger('updateSelected', [getX(event.target), getY(event.target), true]);
            });
        },
        updateCell(x,y,v,s,r) {
            const $cell = $(`#${makeCellId(x,y)}`);

            if (r) {
                $cell.text('R');
            } else {
                $cell.text(v);    
            }

            $cell.toggleClass('selected', s);

            if (!s) {
                const VAL_CUTOFF = 100;
                let r = v < 0 ? 255 : 0, 
                    g = v > 0 ? 255 : 0, 
                    a = Math.min(VAL_CUTOFF, Math.abs(v)) / VAL_CUTOFF;

                $cell.css('backgroundColor', `rgba(${r}, ${g}, 0, ${a})`);
            }
        }
    };

    $setBoxValue.on('click', () => {
        const newValue = Number($boxValue.val());

        $container.find('.gridCell.selected').each((_, el) => {
            $(view).trigger('updateValue', [getX(el), getY(el), newValue]);
        });

        $(view).trigger('deselectAll');        
    });

    $deselectAll.on('click', () => $(view).trigger('deselectAll'));

    $resetAll.on('click', () => {        
        $(view).trigger('reset');
    });

    $(document).on('keydown', e => {
        if (e.which === 38) {
            $(view).trigger('moveRobotBy', [0, -1]);
        } else if (e.which === 39) {
            $(view).trigger('moveRobotBy', [1, 0]);
        } else if (e.which === 40) {
            $(view).trigger('moveRobotBy', [0, 1]);
        } else if (e.which === 37) {
            $(view).trigger('moveRobotBy', [-1, 0]);
        } else {
            console.log(e.which)
        }
    })

    return view;
}