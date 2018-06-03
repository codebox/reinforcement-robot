function buildHelp(view) {
    function message(text){
        if (help.showHelp) {
            view.showHelpMessage(text);
        }
    }

    const help = {
        showHelp : true,
        listen(controller) {
            $(controller).on('init', () => {
                message('hi there');
            });

            $(controller).on('config', (_,name) => {
                message('new config ' + name);
            });

            $(controller).on('norobots', () => {
                message('add some robots');
            });

            $(controller).on('showPolicy', () => {
                message('heres the policy');
            });

        }
    };
    return help;
}