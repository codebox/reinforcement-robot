function buildConfigs() {
    "use strict";

    const data = {
        'Random' : model => {
            model.forEachLocation(l => {
                const MAX = 100, MIN = -100;
                l.value = Math.floor((Math.random() * (MAX - MIN)) + MIN);
                l.contents = undefined;
            });
        },
        'Blank' : model => {
            model.forEachLocation(l => {
                l.value = 0;
                l.contents = undefined;
            });
        }
    };

    return {
        forEach(fn) {
            Object.keys(data).forEach(name => {
                fn(name, data[name]);
            });
        },
        apply(name, model) {
            data[name](model);
        }
    };
}