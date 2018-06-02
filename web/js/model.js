function buildGrid(width, height, initValue = 0) {
    const data = [];

    for (let y = 0; y < height; y++) {
        data[y] = [];
        for (let x = 0; x < width; x++) {
            data[y][x] = {x,y,value:initValue};
        }
    }

    return {
        forLocation(x, y, fn) {
            let result;
            if (data[y] && data[y][x]) {
                result = fn(data[y][x]);
            }
            return result;
        },
        forEachLocation(fn) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    this.forLocation(x, y, fn);
                }
            }
        },
        print(fn = l => l.value){
            console.log('----------');
            for (let y = 0; y < height; y++) {
                console.log(data[y].map(fn));
            }
        }
    };
}

function buildModel(width, height) {
    let grid = buildGrid(width, height), robots = [];

    function getLocation(x,y) {
        return grid.forLocation(x, y, l => l);
    }

    return {
        width, height,
        addRobot(robot, initX, initY){
            const location = getLocation(initX, initY);
            if (location && !location.contents) {
                location.contents = {robot};
                robots.push(robot);
            } else {
                throw new Error(`Cannot add robot to ${initX},${initY}`);
            }
        },

        addGoal(x, y, v) {
            this.forLocation(x, y, l => {
                l.contents = {terminal:true};
                l.value = v;
            });
        },

        addBlock(x, y) {
            this.forLocation(x, y, l => l.contents = {block:true})
        },

        queryReward(startPosition, action) {
            let position, reward;

            const currentLocation = getLocation(startPosition.x, startPosition.y),
                newLocation = getLocation(startPosition.x + action.dx, startPosition.y + action.dy),
                isEmpty = newLocation && !newLocation.contents,
                isTerminal = newLocation && newLocation.contents && newLocation.contents.terminal;

            if (isEmpty || isTerminal) {
                position = {x: newLocation.x, y: newLocation.y};
                reward = newLocation.value;

            } else {
                position = {x : startPosition.x, y : startPosition.y};
                reward = currentLocation.value;
            }

            return reward;
        },

        action(robot, action) {
            let position, reward;

            const currentLocation = getLocation(robot.position.x, robot.position.y);
            if (currentLocation.contents.robot === robot) {
                const newLocation = getLocation(robot.position.x + action.dx, robot.position.y + action.dy);
                if (newLocation && newLocation.contents && newLocation.contents.terminal) {
                    delete currentLocation.contents;
                    position = {x: newLocation.x, y: newLocation.y};
                    reward = newLocation.value;
                    robot.finished = true;

                } else if (newLocation && !newLocation.contents) {
                    delete currentLocation.contents;
                    newLocation.contents = {robot};
                    position = {x: newLocation.x, y: newLocation.y};
                    reward = newLocation.value;

                } else {
                    position = robot.position;
                    reward = currentLocation.value;
                }

            } else {
                throw new Error('Robot is lying about its location!');
            }

            return {position, reward};
        },

        forEachLocation(fn) {
            grid.forEachLocation(fn);
        },

        forEachRobot(fn, random = false) {
            const robotLocations = [];
            grid.forEachLocation(l => {
                if (l.contents && l.contents.robot) {
                    robotLocations.push(l);
                }
            });

            if (random) {
                for (let i = robotLocations.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [robotLocations[i], robotLocations[j]] = [robotLocations[j], robotLocations[i]];
                }
            } else {
                robotLocations.sort((l1, l2) => {
                    const id1 = l1.contents.robot.id,
                        id2 = l2.contents.robot.id;

                    if (id1 < id2) {
                        return -1;

                    } else if (id1 > id2) {
                        return 1;

                    }
                    return 0;
                });
            }

            robotLocations.forEach(l => {
                fn(l.contents.robot, l);
            });
        },

        forLocation(x, y, fn) {
            return grid.forLocation(x, y, fn);
        },

        reset() {
            grid = buildGrid(this.width, this.height);
            robots = [];
        },

        print() {
            grid.print(l => (l.contents && l.contents.id) || '_')
        }
    };
}