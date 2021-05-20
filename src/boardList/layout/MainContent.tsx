import React, { useEffect, useState } from 'react';

interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  test ?: string
  selected ?: string
  category ?: Object
  docs ?: Array<any>
}

const MainContent = (props : Props)=>{
  const {category, selected, docs, ...rest} = props;
  console.log(category, selected, docs);
  let nowDocs = [];

  if(["recent, trash"].includes(selected)){
    nowDocs
  }else{
    nowDocs = docs.filter(el=>el.category==selected)
  }

  return (<div></div>);
}

export default MainContent;