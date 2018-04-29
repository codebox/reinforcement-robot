function buildStrategies(model) {
    "use strict";

    function simple(location){
        const RANDOMNESS = 0.3;
        const neighbours = model.getNeighbours(location.x, location.y);
        let candidates;

        if (Math.random() < RANDOMNESS) {
            candidates = neighbours;

        } else {
            let lookup = {}, bestValue;

            neighbours.forEach(n => {
                const v = n.value;
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

    const strategies = {simple};

    return {
        get(id) {
            return strategies[id] || simple;
        }
    };
}