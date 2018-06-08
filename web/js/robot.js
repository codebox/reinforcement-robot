const buildRobot = (() => {
    let nextId = 0;

    const build = () => {
        return {
            id : String.fromCharCode(65 + (nextId++ % 26)),
            score: 0,
            nextAction(){
                const actions = this.policy(this.position);
                return actions[Math.floor(Math.random() * actions.length)]
            }
        };
    };

    build.reset = () => {
        nextId = 0;
    };

    return build;
})();

