function buildStrategy(model) {
    "use strict";

    const RANDOMNESS = 0.3;

    return {
        next(location) {
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

            return candidates ? candidates[Math.floor(Math.random() * candidates.length)] : [location];
        }
    };
}