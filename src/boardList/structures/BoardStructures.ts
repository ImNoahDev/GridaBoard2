export type IBoardData = {
  id: string,
  doc_name: string,  
  category: string,

  //Date type으로 넣어도 firestore에서 빼올땐 type이 다름
  created: any ,
  last_modified: any,

  dateDeleted: number,
  grida_path: string,
  thumb_path: string,
  favorite?: boolean,
}














