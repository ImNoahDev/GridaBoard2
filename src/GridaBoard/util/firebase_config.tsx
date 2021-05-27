import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyCQ7i4k-LLa4nEVv8zi9inyT7T68l0-1RI",
  authDomain: "gridaboard-v2-test.firebaseapp.com",
  projectId: "gridaboard-v2-test",
  storageBucket: "gridaboard-v2-test.appspot.com",
  messagingSenderId: "380346205591",
  appId: "1:380346205591:web:d1148a041c72a385dcf0d2",
  measurementId: "G-K6TXR3674W"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();

const provider = new firebase.auth.GoogleAuthProvider();

provider.setCustomParameters({prompt:"select_account"});

export const signInWithGoogle = () => auth.signInWithPopup(provider);

export default firebase;