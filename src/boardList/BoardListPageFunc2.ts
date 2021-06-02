import 'firebase/auth';
import 'firebase/database';
import firebase, { auth } from 'GridaBoard/util/firebase_config';
import Cookies from 'universal-cookie';
const db = firebase.firestore();
const cookies = new Cookies();

const saveCategory = async (categoryArr:string[])=>{
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }

  await db
  .collection(userId)
  .doc('categoryData')
  .set({
    data: categoryArr,
  });
}


export const getCategoryArray = async () => {
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }
  
  let res = await db.collection(userId).doc('categoryData').get();


  return res.data().data;  
}

export const createCategory = async (categoryName:string)=>{
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }
  const dataArr = await getCategoryArray();

  if(dataArr.includes(categoryName)){
    console.log("already had");
    return "";
  }else{
    await saveCategory([...dataArr, categoryName]);

    return categoryName;
  }
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
  if(dataArr == false) return false;
  
  const idx = dataArr.indexOf(categoryName);
  if(idx === -1) return false;

  dataArr.splice(idx , 1);

  await saveCategory(dataArr);
  return dataArr;
}


export const changeCategoryName = async (prevName:string, nextName:string) => {
  const userId = cookies.get('user_email');
  if(userId === undefined){
    return false;
  }
  
  let dataArr = await getCategoryArray();
  if(dataArr == false) return false;
  
  const idx = dataArr.indexOf(prevName);
  if(idx === -1) return false;

  dataArr[idx] = nextName;

  await saveCategory(dataArr);
  return dataArr;
}

export default {}