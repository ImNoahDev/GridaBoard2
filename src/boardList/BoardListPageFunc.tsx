import GridaDoc from 'GridaBoard/GridaDoc';
import { setActivePageNo } from '../GridaBoard/store/reducers/activePageReducer';
import { setIsNewDoc } from '../GridaBoard/store/reducers/docConfigReducer';

export const addNewPage = async () => {
  const doc = GridaDoc.getInstance();
  doc.pages = [];

  const pageNo = await doc.addBlankPage();
  setActivePageNo(pageNo);

  setIsNewDoc(true);
}
