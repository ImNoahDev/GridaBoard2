import firebase from "firebase";

//v2 test
const firebaseConfig = {
  apiKey: "AIzaSyCQ7i4k-LLa4nEVv8zi9inyT7T68l0-1RI",
  authDomain: "gridaboard-v2-test.firebaseapp.com",
  projectId: "gridaboard-v2-test",
  databaseURL: "https://gridaboard-v2-test-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "gridaboard-v2-test.appspot.com",
  messagingSenderId: "380346205591",
  appId: "1:380346205591:web:d1148a041c72a385dcf0d2",
  measurementId: "G-K6TXR3674W"
};

//v2 dev
// const firebaseConfig = {
//   apiKey: "AIzaSyBZehYzHuEQM59oXiJVgXGigSTfKQeyDQQ",
//   authDomain: "gridaboard-v2-dev.firebaseapp.com",
//   projectId: "gridaboard-v2-dev",
//   storageBucket: "gridaboard-v2-dev.appspot.com",
//   messagingSenderId: "899078621847",
//   appId: "1:899078621847:web:4d8b9a562e57e737e1f7d2"
// };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();

const provider = new firebase.auth.GoogleAuthProvider();

provider.setCustomParameters({prompt:"select_account"});

export const signInWithGoogle = () => auth.signInWithPopup(provider);

export default firebase;