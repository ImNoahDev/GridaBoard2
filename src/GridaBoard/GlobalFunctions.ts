import KeyBoardShortCut, { KeyBoardShortCut_keyup } from "./KeyBoardShortCut";

export function turnOnGlobalKeyShortCut(on: boolean) {
  if (on) {
    window.addEventListener("keydown", KeyBoardShortCut);
    window.addEventListener("keyup", KeyBoardShortCut_keyup);
  }

  else {
    window.removeEventListener("keydown", KeyBoardShortCut);
    window.removeEventListener("keyup", KeyBoardShortCut_keyup);
  }
}
