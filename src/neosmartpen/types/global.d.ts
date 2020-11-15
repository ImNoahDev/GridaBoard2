// https://velog.io/@bigbrothershin/TypeScript-%EB%82%A8%EC%9D%98-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-%EC%93%B8-%EB%95%8C-d.ts-%ED%8C%8C%EC%9D%BC%EC%9D%B4-%EC%97%86%EB%8A%94-%EA%B2%BD%EC%9A%B0


// export {} // global 객체를 확장하려는 경우, ambient 또는 external module을 사용해야 하는데,
// // ambient module을 사용할 수 없으므로,
// // export {} 를 통해 external module로 만들어줌

// window.hello = 'a'
// const error = new Error('');
// error.code;

// declare global {
//   interface Window {
//     hello: string;
//   }
//   interface Error {
//     code?: any;
//   }
// }
