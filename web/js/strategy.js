function buildStrategies(model) {
    "use strict";

    function simple(location, values = model, randomness = 0.3){
        const neighbours = values.getNeighbours(location.x, location.y);
        let candidates;

        if (Math.random() < randomness) {
            candidates = neighbours;

        } else {
            let lookup = {}, bestValue;

            neighbours.forEach(n => {
                let v = n.value;
                if (n.x === 0 && n.y===0){
                    v=0;
                }

                if (!lookup[v]) {
                    lookup[v] = [];
                }
                lookup[v].push(n);

                if (bestValue === undefined || bestValue < v) {
                    bestValue = v;
                }
            });
            candidates = lookup[bestValue];
        }

        return (candidates && candidates.length) ? candidates[Math.floor(Math.random() * candidates.length)] : location;
    }

    function greedyPolicy(model, location) {
        let neighbourMaxValue, maxNeighbours=[];
        model.getNeighbours(location.x, location.y).forEach(n => {
            if (neighbourMaxValue === undefined || n.value > neighbourMaxValue) {
                neighbourMaxValue = n.value;
                maxNeighbours = [n];
            } else if (n.value === neighbourMaxValue) {
                maxNeighbours.push(n);
            }
        });

        return maxNeighbours.map(n => {
            return {
                dx: n.x - location.x,
                dy: n.y - location.y,
                reward: n.value,
                probability: 1/maxNeighbours.length
            };
        });
    }

    const optimal = (() => {
        return location => {
            const ROUNDS = 1000; //TODO

            let values = buildModel(model.width, model.height);
            for (let r = 0; r <= ROUNDS; r++) {
                const newValues = buildModel(model.width, model.height);

                values.forEachLocation(valueCell => {
                    const x = valueCell.x,
                        y = valueCell.y,
                        policyMoves = greedyPolicy(model, valueCell);
                    let newValue = 0;
                    policyMoves.forEach(move => {
                        const moveX = x + move.dx,
                            moveY = y + move.dy;
                        const reward = model.data[moveX][moveY].value,
                            oldValue = values.data[moveX][moveY].value;

                        newValue += (reward + oldValue) * move.probability;
                    });

                    newValues.data[x][y].value = newValue;
                });

                values = newValues;
            }

            return simple(location, values, 0);
        };
    })();

    const strategies = {simple, optimal};

    return {
        get(id) {
            return strategies[id] || optimal;
        }
    };
}