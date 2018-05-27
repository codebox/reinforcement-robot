function buildPolicy(model, rounds = 1000) {
    const MOVES = [
        {dx: 0, dy:-1},
        {dx: 0, dy: 1},
        {dx:-1, dy: 0},
        {dx: 1, dy: 0}
    ], MOVE_COST = 1;

    function makeGreedyPolicyUsingValueFunction(valueFn) {
        return location => {
            let bestMoves = [], highestValue;

            MOVES.forEach(move => {
                const moveValue = valueFn(location.x + move.dx, location.y + move.dy);

                if (moveValue !== undefined) {
                    if (bestMoves.length === 0) {
                        bestMoves.push(move);
                        highestValue = moveValue;

                    } else if (moveValue === highestValue) {
                        bestMoves.push(move);

                    } else if (moveValue > highestValue) {
                        bestMoves = [move];
                        highestValue = moveValue;
                    }
                }
            });

            return bestMoves;
        }
    }

    function buildValueFnForPolicy(policy, previousValueFn) {
        let values = buildGrid(model.width, model.height);
        model.forEachLocation(l => {
            let value = 0;

            if (l.contents && l.contents.terminal){
                value = l.value;

            } else {
                const policyMoves = policy(l);

                policyMoves.forEach(move => {
                    let newX = l.x + move.dx, newY = l.y + move.dy;
                    let reward = previousValueFn(l.x + move.dx, l.y + move.dy, l => l.value);

                    if (reward === undefined) {
                        reward = l.value; // we stay where we are
                        newX = l.x;
                        newY = l.y;
                    }
                    value += (reward + model.forLocation(l.x, l.y, l => l.value) - MOVE_COST) / policyMoves.length;
                });
            }
            values.forLocation(l.x, l.y, v => v.value = value);
        });

        return (x,y) => {
            return values.forLocation(x, y, l => l.value);
        };
    }

    function improvePolicy(policy, rounds) {
        let currentValueFn = (x,y) => model.forLocation(x, y, l => l.value),
            currentPolicy = makeGreedyPolicyUsingValueFunction(currentValueFn);

        for (let r = 0; r < rounds; r++) {
            const newValueFn = buildValueFnForPolicy(currentPolicy, currentValueFn),
                newPolicy = makeGreedyPolicyUsingValueFunction(newValueFn);

            currentPolicy = newPolicy;
            currentValueFn = newValueFn
        }
        return currentPolicy;
    }

    function buildRandomPolicy() {
        return location => MOVES;
    }

    return improvePolicy(buildRandomPolicy(), rounds);
}