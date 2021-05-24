import React from "react";
interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
   docsList?: Array<any>,
   selectedContent ?: number,
   selectedClass ?: string,
   routeChange ?: (idx:number)=>void
}

const GridView = (props : Props)=>{
  console.log(props);
  const {docsList,selectedContent, selectedClass,ref,routeChange, ...rest} = props;
  console.log(rest);
  return (
    <React.Fragment>
      {docsList.map((el, idx) => {
        let times = new Date(el.date.seconds*1000);
        let category = el.category == "Unshelved" ? "" : el.category;
        return (
          <div key={idx} className="contentItem"  onClick={() => routeChange(el.key)} >
            <div style={{backgroundImage:`url(${el.thumb_downloadURL})`}} />
            <div>
              <div>{el.doc_name}</div>
              <div className="contentData">
                <div>
                  {`${times.getFullYear()}/${times.getMonth()}/${times.getDate()}`}
                </div>
                {category === "" ? "" : (<div />)}
                {category === "" ? "" : (<div>{category}</div>)}
                
              </div>
            </div>
            {selectedContent === idx ? (<div className={selectedClass}/>) : ""}
          </div>
        )
        })} 
    </React.Fragment>
    );
}


export default GridView;