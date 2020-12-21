import KeyBoardShortCut from "./KeyBoardShortCut";

export function turnOnGlobalKeyShortCut(on: boolean) {
  if (on)
    window.addEventListener("keydown", KeyBoardShortCut);
  else
    window.removeEventListener("keydown", KeyBoardShortCut);
}
