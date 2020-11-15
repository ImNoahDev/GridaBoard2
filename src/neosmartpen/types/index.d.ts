// https://velog.io/@bigbrothershin/TypeScript-%EB%82%A8%EC%9D%98-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-%EC%93%B8-%EB%95%8C-d.ts-%ED%8C%8C%EC%9D%BC%EC%9D%B4-%EC%97%86%EB%8A%94-%EA%B2%BD%EC%9A%B0

declare module 'pdfjsLib' { // 이 부분 'example-lib'과
  import "@types/pdfjs-dist";
  export default pdfjsLib;
}

import { Size } from "./tsTypes";

export { Size };