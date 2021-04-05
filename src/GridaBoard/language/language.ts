import data from "./textData.json";
import qs from "query-string";

const defaultLang = "en";
let languageType : string = null;
let textData : JSON = null;
const searchLang : string = qs.parse(location.search).lang;


function setData(lang: string = null) : string {
    const navLang : string = (navigator.language || navigator["userLanguage"]).slice(0,2);

    if(lang != null){//1순위 셋 데이터 인자값이 가장 우선
        languageType = lang;
    }else if(searchLang != undefined && searchLang in data){//2순위 : 페이지 파라미터값 
        languageType = searchLang;
    }else if(navLang in data){//3순위 : navi값(특정 국가에서 준비된 언어가 존재하지 않을 경우 넘어간다)
        languageType = navLang;
    }else{
        languageType = defaultLang;  //기본 언어(언어가 준비되지 않았다는 이야기는 해외일 가능성이 높음 따라서 기본 언어는 영어)
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
}
function changeType(type : string){
    setData(type);
}

setData();
export default lang;
export {
    changeType,
    setData,
    textData,
    languageType
};