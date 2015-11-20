///<reference path='../def/jquery.d.ts'/>

///<reference path='./Utils.ts'/>

class GridFont{

    private container:any;
    private text:any;

    private fontConfig:any;
    private imagePath:string;

    //options passed in
    private scale:number = 1;
    private cycle:string = "random";
    private font:string = "";
    private textAlign:string = "left";

    private hJitterMin:number = 0;
    private hJitterMax:number = 0;

    private vJitterMin:number = 0;
    private vJitterMax:number = 0;

    private rJitterMin:number = 0;
    private rJitterMax:number = 0;

    private xform:string;

    private atIndexes:any = {};

    constructor(container, text, options){

        this.container = container;
        this.text = text;

        this.xform = Utils.getTransformPrefix();
        this.mergeOptions(options);

        if(this.font){

            this.imagePath = this.font.replace('/data.json' , '/img');
            $.get(this.font, (data)=>{

                this.fontConfig = data;
                this.fontConfig.line_spacing*=this.scale;
                this.fontConfig.line_height*=this.scale;
                this.fontConfig.character_width*=this.scale;

                this.init();
            })    
        }else{
            console.error('GridFont: No "font" attribute in the options!');
        }
        
    }

    private init(){

        this.container.addClass('gridFont');
        this.container.css({
            'text-align':this.textAlign
        });

        this.createText();
    }


    private createText(){

        var caption = this.text;

        var words = caption.split(' ');

        for(var w = 0; w<words.length; w++){

            var wordStr = words[w];
            if(w != 0) wordStr = " " + wordStr;

            var word = this.createWord(wordStr);
            this.container.append(word);
        }
    }

    private createWord(word){

        var holder = $('<div class = "word"></div>');
        holder.css({
            'margin-bottom':this.fontConfig.line_spacing,
            'height':this.fontConfig.line_height,
        });

        for(var i = 0; i<word.length; i++){

            var letter = word[i];
            var character = this.createCharacter(letter);
            holder.append(character);

        }

        return holder;
    }

    private createCharacter(letter){

        var profile = this.getProfile(letter);
        var charWidth = this.getCharacterContainerWidth(profile);
        var charDimensions = this.getCharacterDimensions(profile);
        
        var charHolder = $('<div class = "characterHolder"></div>');
        charHolder.css({
            'width': charWidth,
            'height':this.fontConfig.line_height
        });

        var character = $('<div class = "character"></div>');
        character.css(charDimensions);

        this.addJitter(character);

        var innerCharacter = $('<div class = "innerCharacter"></div>');
        var innerPosition = this.getInnerPosition(profile);

        if(letter != " "){

            var charCode = letter.charCodeAt(0);
            var options = this.fontConfig[charCode];

            if(options){
                var filename = this.fontConfig.font_name + '_' + this.getCharImage(charCode, options);
                var path = this.imagePath + "/" + charCode + "/" + filename;
                innerCharacter.css('background-image', 'url(' + path + ')')
            }    
        }
        

        var size = this.fontConfig.character_width * 4 * (1/this.scale);
        var s = this.scale * 100;

        innerCharacter.addClass(innerPosition);
        innerCharacter.css({
            'width':size,
            'height':size,
            'margin-left':-size/2,
            'transform':'scale(' + this.scale + ', ' + this.scale + ')'
        })

        if(innerPosition == "center"){
            innerCharacter.css('margin-top', -size/2);
        }

        character.append(innerCharacter);
        charHolder.append(character);

        return charHolder;
    }

    private getCharImage(charCode, options){

        var index;

        if(this.cycle == "sequential"){

            //check to see if this is the first time this char has been used
            if(this.atIndexes.hasOwnProperty(charCode)){

                index = this.atIndexes[charCode];
                if(!options[index]){
                    index = 0;
                }
                this.atIndexes[charCode] = index +1;

            }else{  
                
                //this is the first time, use the first one, and set the atIndex to 1
                index = 0;
                this.atIndexes[charCode] = 1;
            }

        }else{
            index = Utils.rand(0, options.length-1)
        }

        return options[index];
    }

    private addJitter(character){

        var x = 0;
        var y = 0;
        var r = 0;

        //horizontal
        if(this.hJitterMin != 0 || this.hJitterMax != 0){
            x = Utils.rand(this.hJitterMin, this.hJitterMax);
        }

        //vertical
        if(this.vJitterMin != 0 || this.vJitterMax != 0){
            y = Utils.rand(this.vJitterMin, this.vJitterMax);
        }

        //rotational
        if(this.rJitterMin != 0 || this.rJitterMax != 0){
            r = Utils.rand(this.rJitterMin, this.rJitterMax);
        }

        var transform = 'translate3d(' + x + 'px,' + y + 'px, 0px) rotate(' + r + 'deg)';

        character.css({
            'transform':transform
        });
    }

    private getProfile(letter){

        var code = letter.charCodeAt(0);
        var types = {
            'space':[32],
            'lowercase':[97, 99, 101, 105, 109, 110, 111, 114, 115, 117, 118, 119, 120, 122],
            'lowercase_tall':[98, 100, 102, 104, 107, 108, 116],
            'lowercase_low':[103, 106, 112, 113, 121],
            'uppercase':[65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48],
            'punctuation_low':[44, 46, 95],
            'punctuation_high':[94, 96, 39, 34],
            'punctuation_tall':[33, 123, 125, 124, 91, 93, 40, 41],
            'punctuation_middle':[60, 62, 61, 42, 43, 59, 58, 126, 45],
            'punctuation_full':[64, 35, 36, 37, 38, 63, 47],
        };

        for(var key in types){

            if(types.hasOwnProperty(key)){

                var haystack = types[key];
                if(haystack.indexOf(code) != -1){
                    return key;
                }
            }
        }

        return null;
    }

    private getCharacterDimensions(profile){

        var charHeight = this.fontConfig.character_width;
        var lineHeight = this.fontConfig.line_height;

        switch(profile){

            case "lowercase":
                return {
                    "height":charHeight,
                    "bottom":0
                }
            break;
            case "lowercase_tall":
                return {
                    "height":lineHeight,
                    "bottom":0
                }
            break;
            case "lowercase_low":
                return {
                    "height":lineHeight,
                    "bottom":-lineHeight+charHeight
                }
            break;
            case "uppercase":
                return {
                    "height":lineHeight,
                    "bottom":0
                }
            break;
            case "punctuation_low":
                return {
                    "height":charHeight/2,
                    "bottom":0
                }
            break;
            case "punctuation_tall":
                return {
                    "height":lineHeight,
                    "bottom":0
                }
            break;
            case "punctuation_full":
                return {
                    "height":lineHeight,
                    "bottom":0
                }
            break;
            default:
                return {
                    "height":charHeight,
                    "bottom":0
                }   
            break
        }
    }

    private getInnerPosition(profile){

        switch(profile){

            case "lowercase":
                return "up";
            break;
            case "lowercase_tall":
                return "up";
            break;
            case "lowercase_low":
                return "down";
            break;
            case "uppercase":
                return "up";
            break;
            case "punctuation_low":
                return "center";
            break;
            case "punctuation_tall":
                return "up";
            break;
            case "punctuation_full":
                return "up";
            break;
            default:
                return "up";
            break
        }
    }

    private getCharacterContainerWidth(profile){

        var w = this.fontConfig.character_width;

        switch(profile){

            case "lowercase":
                return w;
            break;
            case "lowercase_tall":
                return w*0.9;
            break;
            case "lowercase_low":
                return w*0.9;
            break;
            case "uppercase":
                return w*2;
            break;
            case "punctuation_low":
                return w*0.8;
            break;
            case "punctuation_tall":
                return w*0.8;
            break;
            case "punctuation_full":
                return w*1.5;
            break;
            default:
                return w;
            break
        }
    }


    private mergeOptions(options){

        for(var key in options){
            if(options.hasOwnProperty(key)){
                this[key] = options[key];
            }
        }
    }
}
