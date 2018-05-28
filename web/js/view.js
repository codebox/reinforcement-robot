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
        $policy = $('#policy');

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

    const stateMachine = (() => {
        const STATE_START = Symbol(),
            STATE_RUNNING = Symbol(),
            STATE_SELECTED = Symbol(),
            STATE_POLICY = Symbol();

        let currentState;

        function updateUi(newState) {
            $startStop.text(newState === STATE_RUNNING ? 'Stop' : 'Start');
            $startStop.prop('disabled', ! [STATE_START, STATE_RUNNING].includes(newState));
            $setBlockBtn.prop('disabled', newState !== STATE_SELECTED);
            $setTerminalBtn.prop('disabled', newState !== STATE_SELECTED);
            $setBoxValueBtn.prop('disabled', newState !== STATE_SELECTED);
            $boxValueInput.prop('disabled', newState !== STATE_SELECTED);
            $deselectAll.prop('disabled', newState !== STATE_SELECTED);
            $reset.prop('disabled', [STATE_RUNNING, STATE_POLICY].includes(newState));
            $setRobot.prop('disabled', newState !== STATE_SELECTED);
            $policy.text(newState === STATE_POLICY ? 'Hide Policy' : 'Show Policy');
            $policy.prop('disabled', ![STATE_START, STATE_POLICY].includes(newState));
            if (newState === STATE_POLICY) {
                $('.gridCell').removeClass('robot');
            }
        }
        return {
            start() {
                updateUi(currentState = STATE_START);
            },
            running() {
                if ([STATE_START, STATE_SELECTED].includes(currentState)) {
                    updateUi(currentState = STATE_RUNNING);
                }
            },
            selected() {
                if ([STATE_START].includes(currentState)) {
                    updateUi(currentState = STATE_SELECTED);
                }
            },
            policy() {
                if ([STATE_START, STATE_SELECTED].includes(currentState)) {
                    updateUi(currentState = STATE_POLICY);
                }
            },

            isRunning() {
                return currentState === STATE_RUNNING;
            },
            isShowingPolicy() {
                return currentState === STATE_POLICY;
            }
        };
    })();

    const view = {
        setup(gridWidth, gridHeight) {
            const gridHtml = buildGridHtml(gridWidth, gridHeight);
            $container.html(gridHtml);

            $container.find('.gridCell').on('mouseover mouseleave', event => {
                if (event.buttons) {
                    $(view).trigger('setSelected', [getX(event.target), getY(event.target), true]);
                }
            });

            $container.find('.gridCell').on('click', event => {
                $(view).trigger('setSelected', [getX(event.target), getY(event.target)]);
            });
        },
        updateSelectionStatus(anySelected) {
            if (anySelected) {
                stateMachine.selected();
            } else {
                stateMachine.start();
            }
        },
        setState() {
            return stateMachine;
        },
        refresh(model) {
            if (stateMachine.isShowingPolicy()) {
                return;
            }
            model.forEachLocation(location => {
                const $cell = $(`#${makeCellId(location.x, location.y)}`),
                    contents   = location.contents || {},
                    isSelected = !! location.selected,
                    hasBlock   = !! contents.block,
                    isTerminal = !! contents.terminal,
                    hasRobot   = !! contents.robot;

                $cell.css('background-image', '');

                if (hasBlock) {
                    $cell.text('');

                } else if (hasRobot) {
                    $cell.text(contents.robot.id);

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

            $('#scoreDisplay').html('<ul></ul>');
            model.forEachRobot(robot => {
                $('#scoreDisplay ul').append(`<li>${robot.id}: ${robot.score} ${!!robot.finished}</li>`)
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
        },
        showPolicy(model, policy) {
            model.forEachLocation(l => {
                if (l.contents && (l.contents.terminal || l.contents.block)) {
                    return;
                }
                const $cell = $(`#${makeCellId(l.x, l.y)}`);
                let flags = 0;
                policy(l).forEach(m => {
                    if (m.dy === -1){
                        flags += 1;
                    } else if (m.dy === 1){
                        flags += 4;
                    } else if (m.dx === 1){
                        flags += 2;
                    } else if (m.dx === -1){
                        flags += 8;
                    }
                });
                const img = `url('images/${flags & 1 ? 'n' : 'x'}${flags & 2 ? 'e' : 'x'}${flags & 4 ? 's' : 'x'}${flags & 8 ? 'w' : 'x'}.png')`;
                $cell.css('background-image', img);
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
        stateMachine.start();
        $(view).trigger('reset');
    });

    $setRobot.on('click', () => {
        $(view).trigger('robots');
    });

    $policy.on('click', () => {
        if (!stateMachine.isShowingPolicy()) {
            stateMachine.policy();
            $(view).triggerHandler('showPolicy');
        } else {
            stateMachine.start();
            $(view).trigger('hidePolicy');
        }
    });

    $startStop.on('click', () => {
        if (stateMachine.isRunning()) {
            stateMachine.start();
            $(view).trigger('stop');
        } else {
            stateMachine.running();
            $(view).trigger('start');
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

    view.setState().start();

    return view;
}