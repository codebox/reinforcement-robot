function buildController() {
    "use strict";

    let animationRequestId, nextRobotId, timer;

    const configs = buildConfigs(),
        ROBOT_INTERVAL_MILLIS = 1000;

    function forEachSelected(model, fn) {
        model.forEachLocation(l => {
            if (l.selected) {
                l.selected = false;
                fn(l);
            }
        });
    }

    function forEachRobot(model, fn) {
        const robotLocations = [];
        model.forEachLocation(l => {
            if (l.contents && l.contents.robot) {
                robotLocations.push(l);
            }
        });
        robotLocations.forEach(l => {
            fn(l.contents, l);
        });
    }

    return {
        init(model, view) {
            if (animationRequestId) {
                cancelAnimationFrame(animationRequestId);
            }
            if (timer) {
                clearInterval(timer);
            }
            nextRobotId = 0;

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
                        robot: l.contents,
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
                            l.contents = rl.robot;
                            l.selected = true;
                        });
                    });

                } else {
                    robotLocations.forEach(rl => {
                        model.forLocation(rl.oldLocation.x, rl.oldLocation.y, l => {
                            l.contents = rl.robot
                            l.selected = true;
                        });
                    });

                }
            }

            const strategies = buildStrategies(model);

            view.setup(model.width, model.height);
            view.setConfigs(configs);
            view.refresh(model);

            function onViewEvent(eventName, handler) {
                $(view).off(eventName).on(eventName, handler);
            }

            onViewEvent('setSelected', (_, x, y, isSelected) => {
                model.data[x][y].selected = isSelected;
            });

            onViewEvent('setBlocks', () => {
                forEachSelected(model, l => l.contents = {block : true});
            });

            onViewEvent('setValues', (_, value) => {
                forEachSelected(model, l => l.value = value);
            });

            onViewEvent('deselectAll', (_, value) => {
                forEachSelected(model, $.noop);
            });

            onViewEvent('reset', (_, value) => {
                function resetLocation(l) {
                    l.selected = false;
                    l.contents = undefined;
                }

                let foundSelection;

                forEachSelected(model, l => {
                    foundSelection = true;
                    resetLocation(l);
                });

                if (!foundSelection){
                    model.forEachLocation(resetLocation);
                    nextRobotId = 0;
                }
            });

            onViewEvent('robots', (_, value) => {
                forEachSelected(model, l => {
                    l.contents = {
                        robot : true,
                        id : String.fromCharCode(65 + (nextRobotId++ % 26)),
                        score : 0,
                        moves : 0
                    };
                });
            });

            onViewEvent('config', (_, name) => {
                nextRobotId = 0;
                configs.apply(name, model);
            });

            onViewEvent('start', () => {
                timer = setInterval(() => {
                    forEachRobot(model, (robot, location) => {
                        const strategy = strategies.get(robot.strategy),
                            newLocation = strategy(location);
                        model.forLocation(location.x, location.y, l => l.contents = undefined);
                        model.forLocation(newLocation.x, newLocation.y, l => l.contents = robot);
                    });
                }, ROBOT_INTERVAL_MILLIS);
            });

            onViewEvent('stop', () => {
                clearInterval(timer);
                timer = undefined;
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

            function renderView(){
                animationRequestId = requestAnimationFrame(renderView);
                view.refresh(model);
            }
            renderView();
        }
    };
}