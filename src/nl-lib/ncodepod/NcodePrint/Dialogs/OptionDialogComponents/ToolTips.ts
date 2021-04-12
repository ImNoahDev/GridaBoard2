import { ITipType } from "nl-lib/common/ui";
import getText from "GridaBoard/language/language";

export const printOptionTip: { [key: string]: ITipType } = {
  'hasToPutNcode': {
    head: getText("print_popup_select_normal_dialog_title"),
    msg: getText("print_popup_select_normal_dialog_explain"),
    tail: getText("print_popup_select_normal_dialog_ready")
  },

  'useNA4': {
    head: getText("print_popup_select_ncode_dialog_title"),
    msg: getText("print_popup_select_ncode_dialog_explain"),
    tail: getText("print_popup_select_ncode_dialog_ready")
  },

  'pagesPerSheet': {
    head: '1장에 인쇄할 페이지 수',
    msg: '인쇄 용지 1장에 인쇄할 페이지 수입니다.',
    tail: 'Ncode A4에 인쇄하는 경우에는 여러 페이지를 한장에 인쇄할 수 없습니다.'
  },

  'showTooltip': {
    head: '도움말 보기',
    msg: '이 도움말이 표시되는 것을 설정합니다.',
    tail: '도움말을 표시를 해제하더라도, 다시 표시하게 할 수 있습니다.'
  },

  'targetPages': {
    head: getText("print_popup_select_page_dialog_title"),
    msg: getText("print_popup_select_page_dialog_explain"),
    tail: getText("print_popup_select_page_dialog_warn")
  },

  'sameCode': {
    head: '등록된 Ncode로 재인쇄',
    msg: '이전에 이미 Ncode를 포함해서 인쇄하여 문서에 등록된 Ncode가 있습니다. 문서에 등록된 Ncode를 사용해서 인쇄하면 내용을 추가로 기록할 수 있습니다.',
    tail: 'Ncode A4를 선택한 경우에는 적용되지 않습니다.'
  },

  'newNcode': {
    head: '새로운 Ncode로 인쇄',
    msg: 'Ncode를 문서 페이지 수 만큼 발급 받아 인쇄합니다. 발급 받은 Ncode는 자동으로 문서에 등록됩니다. 수동 등록 과정 없이 인쇄물에 쓰기만 하면 바로 표시됩니다.',
    tail: 'Ncode A4를 선택한 경우에는 적용되지 않습니다.'
  },

  'forceToUpdateBaseCode': {
    head: '새로운 Ncode를 강제',
    msg: '문서에 등록된 Ncode의 유무와 상관 없이 새로운 Ncode를 강제로 발행합니다.',
    tail: 'Ncode A4를 선택한 경우에는 적용되지 않습니다.'
  },

  'needToIssuePrintCode': {
    head: '새 Ncode가 필요',
    msg: '문서에 Ncode가 등록되어 있지 않습니다. 새로운 Ncode를 발급 받아야 일반 용지에 인쇄할 수 있습니다.',
    tail: 'Ncode A4를 선택한 경우에는 적용되지 않습니다.'
  },

  'mediaSize': {
    head: getText("print_popup_detail_papersize_dialog_title"),
    msg: getText("print_popup_detail_papersize_dialog_explain"),
    tail: getText("print_popup_detail_papersize_dialog_warn")
  },

  'downloadNcodedPdf': {
    head: getText("print_popup_selectSub_savepdf_title"),
    msg: getText("print_popup_selectSub_savepdf_explain"),
    tail: getText("print_popup_selectSub_savepdf_ready")
  },

  'drawCalibrationMark': {
    head: '문서 등록용 마크 표시',
    msg: 'Ncode A4를 사용하는 경우, 문서를 수동으로 등록해야 합니다(화면 오른쪽 아래의 버튼). 이 때, 등록 표식이 될 수 있도록 문서에 플러스(십자, +)를 인쇄해 둡니다.',
    tail: 'Ncode A4를 사용하는 경우 선택이 필수입니다.'
  },

  'drawMarkRatio': {
    head: '문서 등록 마크 위치',
    msg: '문서 등록 마크가 인쇄물에 표시되는 위치를 용지 크기의 비율로 표시한 것입니다. 예를 들어, 0.1 (10%)이면 좌상단의 (10%,10%) 지점과 우하단의 (10%,10%) 지점에 빨간색 등록 마크가 인쇄됩니다.',
    tail: '이 값을 바꾸면 이전에 인쇄했던 등록용 표시는 사용할 수 없습니다.'
  },

  'colorMode': {
    head: '색변환 방법 선택',
    msg: 'Ncode를 인식하기 위해서는 문서 전체의 색을 변환해야 합니다. 이 때 쓰이는 변환하는 방식을 선택합니다.',
    tail: '잉크를 골고루 사용하기 위해서는, 색상인쇄 1(ANDROID), 또는 색상인쇄 2(iOS)를 선택하십시오.'
  },

  'luminanceMaxRatio': {
    head: '색변환 최대 농도',
    msg: '문서 색변환 시에 적용되는 잉크의 최대 농도를 설정합니다. 1에 가까울 수록 진하게 인쇄됩니다만, 코드를 인식하지 못할 수 있습니다',
    tail: '0.6 ~ 0.8 정도가 적정합니다.'
  },

  'codeDensity': {
    head: getText("print_popup_detail_ncodelevel_dialog_title"),
    msg: getText("print_popup_detail_ncodelevel_dialog_explain"),
    tail: getText("print_popup_detail_ncodelevel_dialog_warn")
  },

  'drawFrame': {
    head: getText("print_popup_detail_outline_dialog_title"),
    msg: getText("print_popup_detail_outline_dialog_explain"),
    tail: getText("print_popup_detail_outline_dialog_warn")
  },

  'padding': {
    head: '종이 여백 설정',
    msg: '인쇄물의 상하좌우 여백을 설정합니다.',
    tail: '여백이 너무 작은 경우, 인쇄물에서 문서의 내용이 표시되지 않는 영역시 발생할 수 있습니다.'
  },

  'maxPagesPerSheetToDrawMark': {
    head: 'Ncode A4의 최대 분할 인쇄 수',
    msg: '문서 등록용 마크의 인쇄를 허용할 최대 면 분할 페이지 수입니다. default=1',
    tail: '현재 버전에서는 1을 초과해서 설정하면, Ncode A4의 문서가 인식되지 않습니다.'
  },

  'filename': {
    head: '문서의 로컬 파일이름',
    msg: '"파일 선택"을 통해 문서를 읽어 들였을 때의 문서 파일의 "파일명"입니다.',
    tail: '임의로 바꿀 수 없습니다.'
  },

  'url': {
    head: '문서를 받아온 URL',
    msg: '문서를 로드할 때 썼던 임시 URL입니다.',
    tail: '임의로 바꿀 수 없습니다.'
  },

  'debugMode': {
    head: '개발자용 디버그 모드',
    msg: '개발자용으로 만들어진 인쇄 디버그 플래그입니다.',
    tail: '0: nothing, 1: 인쇄 좌표계 설정'
  },


}