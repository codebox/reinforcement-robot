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
    const DEFAULT_POLICY_ROUNDS = 10,
        DEFAULT_MOVE_COST = 1;

    let grid = buildGrid(width, height), robots = [], policy,
        _rounds = DEFAULT_POLICY_ROUNDS,
        _moveCost = DEFAULT_MOVE_COST;

    function getLocation(x,y) {
        return grid.forLocation(x, y, l => l);
    }

    const model = {
        width,
        height,

        get rounds(){
            return _rounds;
        },
        set rounds(newValue){
            if (_rounds !== newValue){
                _rounds = newValue;
                model.invaldiatePolicy();
            }
        },

        get moveCost(){
            return _moveCost;
        },
        set moveCost(newValue){
            if (_moveCost !== newValue){
                _moveCost = newValue;
                model.invaldiatePolicy();
            }
        },

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
                reward = newLocation.value - model.moveCost;

            } else {
                position = {x : startPosition.x, y : startPosition.y};
                reward = currentLocation.value - model.moveCost;
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
                    reward = newLocation.value - model.moveCost;
                    robot.finished = true;
                    $(model).trigger('robotFinished');

                } else if (newLocation && !newLocation.contents) {
                    delete currentLocation.contents;
                    newLocation.contents = {robot};
                    position = {x: newLocation.x, y: newLocation.y};
                    reward = newLocation.value - model.moveCost;

                } else {
                    position = robot.position;
                    reward = currentLocation.value - model.moveCost;
                }

            } else {
                throw new Error('Robot is lying about its location!');
            }

            return {position, reward};
        },

        forEachLocation(fn) {
            grid.forEachLocation(fn);
        },

        forEachRobot(fn, random = false, skipFinished = true) {
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

            if (!skipFinished) {
                robots.filter(r => r.finished).forEach(r => {
                    fn(r);
                });                
            }
        },

        forLocation(x, y, fn) {
            return grid.forLocation(x, y, fn);
        },

        reset() {
            grid = buildGrid(this.width, this.height);
            buildRobot.reset();
            model.invaldiatePolicy();
            robots = [];
        },

        invaldiatePolicy(){
            policy = undefined;
        },

        policy(location){
            if (!policy) {
                policy = buildPolicy(model);
            }
            return policy(location);
        },

        print() {
            grid.print(l => (l.contents && l.contents.id) || '_')
        }
    };
    return model;
}