import data from "./textData.json";

let languageType = "en";
let textData : JSON = null;
function setData(lang: string = null) : string {
    const language : string = (navigator.language || navigator["userLanguage"]).slice(0,2);
    if(lang != null){
        languageType = lang;
    }else if(language in data){
        languageType = language;
    }else{
        languageType = "en";  //기본 언어
    }

    textData = data[languageType];
    return languageType;
}
function lang(tag : string) : string{
    let nowText : string = textData[tag];
    if(nowText === undefined){
        return "";
    }

    if(nowText.indexOf("\\n") != -1){
        nowText = nowText.replace("\\n", "\n");
    }

    return nowText;
    // let obj = textData;
    // if(tag.constructor === String) tag = [tag];
    // try{
    //     for(let i = 0; i < tag.length; i++){
    //         obj = obj[tag[i]];
    //     }
    // }catch(e){
    //     return "wrong tag path";
    // }
    // return obj;
    // return data[languageType][tag];
}
function changeType(type : string){
    languageType = type;
    if(data !== null){
        textData = data[languageType];
    }
}

setData();
export default lang;
export {
    changeType,
    setData,
    textData,
    languageType
};