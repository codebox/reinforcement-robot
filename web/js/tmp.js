function greedyPolicy(cell) {
    if (cell.x === 0 && cell.y === 0){
        return [];
    }
    if (cell.x === SIZE-1 && cell.y === SIZE-1){
        return [];
    }
    let neighbourMaxValue, maxNeighbours=[];
    cell.neighbours().forEach(n => {
        if (neighbourMaxValue === undefined || n.value > neighbourMaxValue) {
            neighbourMaxValue = n.value;
            maxNeighbours = [n];
        } else if (n.value === neighbourMaxValue) {
            maxNeighbours.push(n);
        }
    });

    return maxNeighbours.map(n => {
        return {
            dx: n.x - cell.x,
            dy: n.y - cell.y,
            reward: n.value,
            probability: 1/maxNeighbours.length
        };
    });

}
function randomPolicy(cell) {
    if (cell.x === 0 && cell.y === 0){
        return [];
    }
    if (cell.x === SIZE-1 && cell.y === SIZE-1){
        return [];
    }
    const neighbours = cell.neighbours();
    return neighbours.map(n => {
        return {
            dx: n.x - cell.x,
            dy: n.y - cell.y,
            reward: n.value,
            probability: 1/neighbours.length
        };
    });
}

const policy = greedyPolicy;

function initGrid(h, w, v = 0) {
    const data = [];

    for (let y=0; y<h; y++) {
        data[y] = [];
        for (let x=0; x<w; x++) {
            data[y][x] = v;
        }
    }

    function buildCell(x,y) {
        return {
            x, y,
            value : data[y][x],
            neighbours() {
                const n = [];

                if (x>0) {
                    n.push(buildCell(x-1,y));
                }
                if (x<w-1) {
                    n.push(buildCell(x+1,y));
                }
                if (y>0) {
                    n.push(buildCell(x,y-1));
                }
                if (y<h-1) {
                    n.push(buildCell(x,y+1));
                }

                return n;
            }
        }
    }

    return {
        forEachCell(fn) {
            for (let y=0; y<h; y++) {
                for (let x=0; x<w; x++) {
                    fn(buildCell(x,y));
                }
            }
        },
        getValue(x, y) {
            return data[y][x];
        },
        setValue(x, y, v) {
            data[y][x] = v;
        },
        data() {
            const rows = [];
            for(let y=0; y<h; y++){
                rows.push(data[y].map(n => `${n>=0 ? ' ':''}${n.toFixed(1)}`).join(' '))
            }
            return rows.join('\n');
        }
    };
}

const ROUNDS = 200, SIZE = 10;

let grid = initGrid(SIZE, SIZE, -1),
    values = initGrid(SIZE, SIZE);

for (let r = 0; r <= ROUNDS; r++) {
    const newValues = initGrid(SIZE, SIZE);

    values.forEachCell(valueCell => {
        const x = valueCell.x,
            y = valueCell.y,
            policyMoves = policy(valueCell);
        let newValue = 0;
        policyMoves.forEach(move => {
            const moveX = x + move.dx,
                moveY = y + move.dy;
            const reward = grid.getValue(moveX, moveY),
                oldValue = values.getValue(moveX, moveY);

            newValue += (reward + oldValue) * move.probability;
        });

        newValues.setValue(x, y, newValue);
    });

    values = newValues;
}

