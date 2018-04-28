function buildRobot(id, strategy) {
    "use strict";

    let robotScore = 0, robotMoveCount = 0, currentLocation;

    function locationsAreDifferent(l1, l2) {
        if (!l1 && !l2) {
            return false;

        } else if (l1 && l2) {
            return (l1.x !== l2.x) || (l1.y !== l2.y);

        } else {
            return true;
        }
    }

    const robot = {
        get score() {
            return robotScore;
        },
        get moveCount() {
            return robotMoveCount;
        },
        planNextMove() {
            return strategy.next(robot.location);
        },
        set location(newLocation) {
            if (newLocation && locationsAreDifferent(newLocation, currentLocation)) {
                robotMoveCount++;
                robotScore += newLocation.value;
            }
            currentLocation = newLocation;
        },
        get location() {
            return currentLocation;
        },
        robot : true,
        id
    };

    return robot;
}