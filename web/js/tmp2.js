const S=3;
const model = buildModel(S,S);

function buildValueFunctionForPolicy(model, policyBuilder, iterations) {
    let oldValues = model;

    for (let i=0; i<iterations; i++) {
        let newValues = buildModel(S, S);

        oldValues.forEachLocation(l => {
            const policy = policyBuilder(oldValues),
                moves = policy.getNextMoves(l),
                newValue = moves.reduce((total, move) => {
                    return total + move.location.value * move.probability;
                }, 0);

            newValues.forLocation(l.x, l.y, l => l.value = newValue);
        });

        oldValues = newValues;
    }

    return {
        getValue(location) {
            return oldValues.forLocation(location.x, location.y, l => l.value);
        },
        toModel() {
            const m = buildModel(S,S);
            m.forEachLocation(l => {
                l.value = this.getValue(l);
            })
            return m;
        }
    };
}

function buildRandomPolicy(model) {
    return {
        getNextMoves(location) {
            const neighbours = model.getNeighbours(location.x, location.y);

            return neighbours.map(n => {
                return {
                    location: n,
                    probability : 1 / neighbours.length
                };
            });
        }
    }
}

function buildGreedyPolicy(model) {
    return {
        getNextMoves(location) {
            const neighbours = model.getNeighbours(location.x, location.y);
            let maxNeighbours = [], maxValue;

            neighbours.forEach(n => {
                if (maxValue === undefined || n.value > maxValue) {
                    maxValue = n.value;
                    maxNeighbours = [n];
                } else if (n.value === maxValue) {
                    maxNeighbours.push(n);
                }
            });

            return maxNeighbours.map(n => {
                return {
                    location: n,
                    probability : 1 / maxNeighbours.length
                };
            });
        }
    }
}


model.forLocation(0,0,l => l.value = 1);
const v1 = buildValueFunctionForPolicy(model, buildRandomPolicy, 1);
print(v1.toModel().data)
const v2 = buildValueFunctionForPolicy(v1.toModel(), buildGreedyPolicy, 1);
print(v2.toModel().data)
const v3 = buildValueFunctionForPolicy(v2.toModel(), buildGreedyPolicy, 1);
print(v3.toModel().data)

let m = model;
for(let r=0; r<10; r++) {
    const v = buildValueFunctionForPolicy(m, buildGreedyPolicy, 1);
    m = v.toModel();
    console.log('===========')
    print(m.data)
}

function print(m){
    for (y=0;y<S;y++){
        r=[]
        for (x=0;x<S;x++) {
            r.push(m[x][y])
        }
        console.log(r.map(i => i.value));
    }
}
/*
model.forLocation(0,0,l => l.value = 1);
model.forLocation(2,2,l => l.value = -1);

let values = buildModel(S,S);

model.forEachLocation(location => {

});
print(model.data);
    */