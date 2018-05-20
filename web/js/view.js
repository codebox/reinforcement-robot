"use strict";
function buildView($container) {
    const $setBlockBtn = $('#setBlock'),
        $setTerminalBtn = $('#setTerminal'),
        $setBoxValueBtn = $('#setBoxValue'),
        $boxValueInput = $('#boxValue'),
        $deselectAll = $('#deselectAll'),
        $reset = $('#reset'),
        $setRobot = $('#setRobot'),
        $configs = $('#configs'),
        $startStop = $('#startStop'),

        STATE_RUNNING = Symbol(),
        STATE_STOPPED = Symbol();

    let runState = STATE_STOPPED;

    function makeCellId(x,y) {
        return `cell_${x}_${y}`;
    }

    function buildGridHtml(columnCount, rowCount) {
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

    function getX(el) {
        return Number($(el).attr('data-x'));
    }

    function getY(el) {
        return Number($(el).attr('data-y'));
    }

    const view = {
        setup(gridWidth, gridHeight) {
            const gridHtml = buildGridHtml(gridWidth, gridHeight);
            $container.html(gridHtml);

            $container.find('.gridCell').on('mouseover mousedown', event => {
                if (event.buttons) {
                    $(view).trigger('setSelected', [getX(event.target), getY(event.target), true]);
                }
            });

            $container.find('.gridCell').on('click', event => {
                $(view).trigger('setSelected', [getX(event.target), getY(event.target), true]);
            });
        },
        refresh(model) {
            model.forEachLocation(location => {
                const $cell = $(`#${makeCellId(location.x, location.y)}`),
                    contents   = location.contents || {},
                    isSelected = !! location.selected,
                    hasBlock   = !! contents.block,
                    isTerminal = !! contents.terminal,
                    hasRobot   = !! contents.robot;

                if (hasBlock) {
                    $cell.text('');

                } else if (hasRobot) {
                    $cell.text(contents.id);

                } else {
                    $cell.text(location.value);
                }

                $cell.toggleClass('selected', isSelected);
                $cell.toggleClass('block',    hasBlock);
                $cell.toggleClass('robot',    hasRobot);
                $cell.toggleClass('terminal', isTerminal);

                if (isSelected || hasBlock) {
                    $cell.css('backgroundColor', '');
                } else {
                    const VAL_CUTOFF = 100;
                    let r = location.value < 0 ? 255 : 0,
                        g = location.value > 0 ? 255 : 0,
                        a = Math.min(VAL_CUTOFF, Math.abs(location.value)) / VAL_CUTOFF;

                    $cell.css('backgroundColor', `rgba(${r}, ${g}, 0, ${a})`);
                }
            });
        },
        setConfigs(configs) {
            $configs.empty();
            configs.forEach((name, handler) => {
                const $li = $(`<li>${name}</li>`)
                $li.on('click', () => {
                    $(view).trigger('config', name);
                });
                $configs.append($li);
            });
        }
    };

    $setBlockBtn.on('click', () => {
        $(view).trigger('setBlocks');
    });

    $setTerminalBtn.on('click', () => {
        $(view).trigger('setTerminals');
    });

    $setBoxValueBtn.on('click', () => {
        const val = Number($boxValueInput.val());
        if (! isNaN(val)) {
            $(view).trigger('setValues', val);
        }
    });

    $deselectAll.on('click', () => {
        $(view).trigger('deselectAll');
    });

    $reset.on('click', () => {
        $(view).trigger('reset');
    });

    $setRobot.on('click', () => {
        $(view).trigger('robots');
    });

    $startStop.on('click', () => {
        if (runState == STATE_RUNNING) {
            runState = STATE_STOPPED;
            $(view).trigger('stop');
            $startStop.text('Start');
        } else {
            runState = STATE_RUNNING;
            $(view).trigger('start');
            $startStop.text('Stop');
        }
    });

    $(document).on('keydown', e => {
        if (e.which === 27) {
            $(view).trigger('deselectAll');
        } else if (e.which === 38) {
            $(view).trigger('moveRobotsBy', [0, -1]);
        } else if (e.which === 39) {
            $(view).trigger('moveRobotsBy', [1, 0]);
        } else if (e.which === 40) {
            $(view).trigger('moveRobotsBy', [0, 1]);
        } else if (e.which === 37) {
            $(view).trigger('moveRobotsBy', [-1, 0]);
        }
    });

    return view;
}