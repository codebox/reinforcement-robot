function buildController() {
    "use strict";

    let animationRequestId, running;

    const configs = buildConfigs(), MOVE_INTERVAL_MILLIS = 500;

    const controller = {
        init(model, view) {
            if (animationRequestId) {
                cancelAnimationFrame(animationRequestId);
            }
            running = false;

            function forEachSelected(model, fn) {
                model.forEachLocation(l => {
                    if (l.selected) {
                        l.selected = false;
                        fn(l);
                    }
                });
                view.updateSelectionStatus(false);
            }

            function moveRobots(robotLocationsToMove, dx, dy) {
                function makeNewLocation(l) {
                    return {
                        x : l.x + dx,
                        y : l.y + dy
                    };
                }

                let robotLocations = [];
                robotLocationsToMove.forEach(l => {
                    robotLocations.push({
                        robot: l.contents.robot,
                        oldLocation: l,
                        newLocation: makeNewLocation(l)
                    });
                });

                robotLocations.forEach(rl => {
                    model.forLocation(rl.oldLocation.x, rl.oldLocation.y, l => l.contents = undefined);
                });

                let availableLocationCount = 0;
                robotLocations.forEach(rl => {
                    model.forLocation(rl.newLocation.x, rl.newLocation.y, l => {
                        if (!l.contents) {
                            availableLocationCount++;
                        }
                    });
                });

                if (availableLocationCount === robotLocationsToMove.length) {
                    robotLocations.forEach(rl => {
                        model.forLocation(rl.newLocation.x, rl.newLocation.y, l => {
                            rl.robot.position = rl.newLocation;
                            l.contents = {robot:rl.robot};
                            l.selected = true;
                        });
                    });

                } else {
                    robotLocations.forEach(rl => {
                        model.forLocation(rl.oldLocation.x, rl.oldLocation.y, l => {
                            l.contents = {robot:rl.robot};
                            l.selected = true;
                        });
                    });
                }

                view.updateSelectionStatus(true);
            }

            let strategies;

            view.setup(model.width, model.height);
            view.setConfigs(configs);

            view.refresh(model);

            function onViewEvent(eventName, handler) {
                $(view).off(eventName).on(eventName, (...args) => {
                    handler(...args);
                    view.refresh(model);
                });
            }

            onViewEvent('setSelected', (_, x, y, isSelected) => {
                model.forLocation(x, y, l => l.selected = isSelected || !l.selected);
                let anySelected = isSelected;
                if (!isSelected) {
                    model.forEachLocation(l => {
                        if (l.selected) {
                            anySelected = true;
                        }
                    });
                }
                view.updateSelectionStatus(anySelected);
            });

            onViewEvent('deselectAll', (_, value) => {
                forEachSelected(model, $.noop);
                view.updateSelectionStatus(false);
            });

            onViewEvent('setBlocks', () => {
                forEachSelected(model, l => l.contents = {block : true});
                model.invaldiatePolicy();
            });

            onViewEvent('setTerminals', () => {
                forEachSelected(model, l => l.contents = {terminal : true});
                model.invaldiatePolicy();
            });

            onViewEvent('setValues', (_, value, deselect) => {
                model.forEachLocation(l => {
                    if (l.selected) {
                        l.value = value;
                        l.selected = !deselect;
                    }
                });
                if (deselect){
                    view.updateSelectionStatus(false);
                }
                model.invaldiatePolicy();
            });

            onViewEvent('showPolicy', () => {
                view.showPolicy(model);
                $(controller).trigger('showPolicy');
            });

            onViewEvent('hidePolicy', () => {
                view.refresh(model);
            });

            onViewEvent('reset', (_, value) => {
                model.reset();
            });

            onViewEvent('clear', () => {
                forEachSelected(model, l => l.contents = null);
                model.invaldiatePolicy();
            });

            onViewEvent('robots', (_, value) => {
                forEachSelected(model, l => {
                    const robot = buildRobot();
                    model.addRobot(robot, l.x, l.y);
                    robot.position = {x:l.x, y:l.y};
                });
            });

            onViewEvent('policyRounds', (_, value) => {
                model.rounds = value;
                view.showPolicy(model);
            });

            onViewEvent('moveCost', (_, value) => {
                model.moveCost = value;
                view.showPolicy(model);
            });

            onViewEvent('config', (_, name) => {
                configs.apply(name, model);
                view.setup(model.width, model.height);
                $(controller).trigger('config', name);
            });

            onViewEvent('start', () => {
                let robotCount = 0, robotQueue = [];

                model.forEachRobot((robot, location) => {
                    robot.policy = model.policy;
                    robotCount++;
                });

                running = !!robotCount;

                if (!robotCount){
                    view.setState().start();
                    view.refresh(model);
                    $(controller).trigger('norobots');
                    return;
                }

                function go() {
                    if (!robotQueue.length){
                        model.forEachRobot(robot => robotQueue.push(robot), true);
                    }
                    const robot = robotQueue.shift()
                    if (running && robot) {
                        const action = robot.nextAction();
                        if (action) {
                            const {position, reward} = model.action(robot, action);
                            robot.position = position;
                            robot.score += reward;
                        }
                    }

                    if (running) {
                        setTimeout(go, MOVE_INTERVAL_MILLIS / robotCount);
                    }
                }
                go();
            });

            onViewEvent('stop', () => {
                running = false;
            });

            onViewEvent('moveRobotsBy', (_, dx, dy) => {
                const robotLocationsToMove = [];
                forEachSelected(model, l => {
                    if (l.contents && l.contents.robot) {
                        robotLocationsToMove.push(l);
                    }
                });
                moveRobots(robotLocationsToMove, dx, dy);
            });

            $(model).on('robotFinished', () => {
                let activeRobotCount = 0;
                model.forEachRobot(r => {
                    if (!r.finished) {
                        activeRobotCount++;                        
                    }
                });
                if (!activeRobotCount){
                    running = false;
                    view.setState().start();
                    view.refresh(model);
                }
            });

            function renderView(){
                animationRequestId = requestAnimationFrame(renderView);
                if (running) {
                    view.refresh(model);
                }
            }
            renderView();

            buildHelp(view).listen(controller);

            $(controller).triggerHandler('init');
        }
    };
    return controller;
}