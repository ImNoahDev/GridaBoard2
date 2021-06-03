import 'firebase/auth';
import 'firebase/database';
import firebase, { auth } from 'GridaBoard/util/firebase_config';
import Cookies from 'universal-cookie';

export default {}


const db = firebase.firestore();
const cookies = new Cookies();



const objectToArray = (obj)=>{
  return Object.values(obj);
}
const arrayToObject = (array)=>{
  return Object.assign({}, array);
}

const saveCategory = async (categoryData)=>{
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }

  await db
  .collection(userId)
  .doc('categoryData')
  .set(arrayToObject(categoryData));
}

export const setDefaultCategory = async ()=>{
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }
  
  const newCategoryData  = {
    0 : ["Unshelved", 0]
  }
  await saveCategory(newCategoryData);


  return objectToArray(newCategoryData);
}


export const getCategoryArray = async () => {
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return [];
  }
  
  let res = await db.collection(userId).doc('categoryData').get();

  return objectToArray(res.data());  
}

export const createCategory = async (categoryName:string)=>{
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }
  
  const dataArr = await getCategoryArray();
  if(dataArr.some((el)=>el[0]===categoryName)){
    console.log("already had");
    return "";
  }else{
    dataArr.push([categoryName, dataArr.length]);
    await saveCategory(dataArr);

    return categoryName;
  }

  // if(dataArr.includes(categoryName)){
  // }else{
    // await saveCategory([...dataArr, categoryName]);

  // }
};


/**
 * (category name) => new categoryList
 */
 export const deleteCategory = async (categoryName:string) => {
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }
  
  let dataArr = await getCategoryArray();
  
  const idx = dataArr.indexOf(categoryName);
  if(idx === -1) return false;

  dataArr.splice(idx , 1);

  await saveCategory(dataArr);
  return dataArr;
}


export const changeCategoryName = async (prevName:any[], nextName:string) => {
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }
  
  let dataArr = await getCategoryArray();
  console.log(prevName, nextName);
  dataArr[prevName[3]][0] = nextName;
  
  await saveCategory(dataArr);
  return dataArr;
}




///////////////////////////////////////////////////////////

export const getDatabase = async ()=>{
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }


  let data = await db.collection(userId).get();
 
  const newDocs = [];
  let newCategoryData = null;

  data.forEach(doc => {
    if (doc.id === 'categoryData') {
      newCategoryData = objectToArray(doc.data());
    } else {
      newDocs.push(doc.data());
      newDocs[newDocs.length - 1].key = newDocs.length - 1;
    }
  });

  if (newCategoryData === null) {
    newCategoryData = await setDefaultCategory();
  }

  return {
    docs : newDocs,
    category : newCategoryData
  }
  
    // setDocsObj({
    //   docs: newDocs,
    //   category: newCategoryData,
    // });

}
