const dropBlur = function(e, clickDom, handleClick){
  const  currentTarget = e.currentTarget;
  // 이벤트 루프의 다음 틱에서 새로 포커스 된 요소를 확인합니다.
  setTimeout(() => {
    // 새 activeElement가 원래 컨테이너의 자식인지 확인
    if (!currentTarget.contains(document.activeElement) && !clickDom.contains(document.activeElement)) {
      // 여기에서 콜백을 호출하거나 맞춤 로직을 추가 할 수 있습니다.
      handleClick(true);
    }
  }, 0);
}

function handleClick(dropHidden, setDropHidden, hidden:boolean = null) {
  if(hidden !== null){
    setDropHidden(hidden);
  }else if(hidden !== dropHidden){
      setDropHidden(!dropHidden);
  }
}
export default {
  dropBlur,
  handleClick
}