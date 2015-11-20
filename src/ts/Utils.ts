class Utils{
    
    static getTransformPrefix(){

        var view = document.createElement('div');
        var prefixes = ['webkit', 'Moz', 'O', 'ms'];
        for(var i = 0; i<prefixes.length; i++){
            var prefix = prefixes[i];
            var e = prefix + 'Transform';

            if (typeof view.style[e] !== 'undefined') {
                view = null;
                return e;
            }
        }
    }

    static getTransitionPrefix(){

        var view = document.createElement('div');
        var prefixes = ['webkit', 'Moz', 'O', 'ms'];
        for(var i = 0; i<prefixes.length; i++){
            var prefix = prefixes[i];
            var t = prefix + 'Transition';

            if (typeof view.style[t] !== 'undefined') {
                view = null;
                return t;
            }
        }
    }

    static rand(from,to){
        return Math.floor(Math.random()*(to-from+1)+from);
    }
    
}