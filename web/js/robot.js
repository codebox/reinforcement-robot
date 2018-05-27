const buildRobot = (() => {
    let nextId = 0;

    return () => {
        return {
            id : String.fromCharCode(65 + (nextId++ % 26)),
            score: 0,
            nextAction(location){
                const actions = this.policy(this.position);
                return actions[Math.floor(Math.random() * actions.length)]
            }
        };
    };
})();

