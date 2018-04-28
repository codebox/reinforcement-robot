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
        $resetAll = $('#resetAll'),
        $setBlock = $('#setBlock'),
        $startStop = $('#startStop'),
        $scoreDisplay = $('#scoreDisplay');

    const STATE_RUNNING = Symbol(),
        STATE_STOPPED = Symbol();

    let state = STATE_STOPPED;

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

        updateCell(x,y,v,s,o) {
            const $cell = $(`#${makeCellId(x,y)}`),
                block = o && o.block,
                robot = o && o.robot;

            if (block) {
                $cell.text('');
            } else if (robot) {
                $cell.text(o.id);
            } else {
                $cell.text(v);    
            }

            $cell.toggleClass('selected', s);
            $cell.toggleClass('block', !!block);
            $cell.toggleClass('robot', !!robot);

            if (s || block) {
                $cell.css('backgroundColor','');
            } else {
                const VAL_CUTOFF = 100;
                let r = v < 0 ? 255 : 0, 
                    g = v > 0 ? 255 : 0, 
                    a = Math.min(VAL_CUTOFF, Math.abs(v)) / VAL_CUTOFF;

                $cell.css('backgroundColor', `rgba(${r}, ${g}, 0, ${a})`);
            }
        },

        updateScores(robots) {
            const parts = [];
            robots.forEach(r => {
                parts.push(`Robot ${r.id}: ${r.moveCount ? Math.round(r.score/r.moveCount) : '-'}`);
            });
            $scoreDisplay.html(parts.join('<br>'));
        }
    };

    $setBoxValue.on('click', () => {
        const newValue = Number($boxValue.val());

        $container.find('.gridCell.selected').each((_, el) => {
            $(view).trigger('updateValue', [getX(el), getY(el), newValue]);
        });

        $(view).trigger('deselectAll');        
    });

    $setBlock.on('click', () => {
        $container.find('.gridCell.selected').each((_, el) => {
            $(view).trigger('setBlock', [getX(el), getY(el)]);
        });

        $(view).trigger('deselectAll');
    });

    $deselectAll.on('click', () => $(view).trigger('deselectAll'));

    $resetAll.on('click', () => {        
        $(view).trigger('reset');
    });

    $startStop.on('click', () => {
        if (state === STATE_STOPPED) {
            $startStop.text('Stop');
            state = STATE_RUNNING;
            $(view).trigger('start');
        } else if (state === STATE_RUNNING) {
            $startStop.text('Start');
            state = STATE_STOPPED;
            $(view).trigger('stop');
        }
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