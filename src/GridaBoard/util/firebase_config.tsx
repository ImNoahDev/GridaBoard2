import firebase from "firebase";

//neostudio staging
const firebaseConfig = {
  apiKey: "AIzaSyD7Yh_sCRUO-vmsF5dURj5xOLBeP8ekVto",
  authDomain: "neostudio-staging.firebaseapp.com",
  databaseURL: "https://neostudio-staging.firebaseio.com",
  projectId: "neostudio-staging",
  storageBucket: "neostudio-staging.appspot.com",
  messagingSenderId: "382410551029",
  appId: "1:382410551029:web:9fa2a23bfc9c7e3f955fbc"
};

//v2 test
const secondaryFirebaseConfig = {
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
const mainFirebase = firebase.initializeApp(firebaseConfig);
export const secondaryFirebase = firebase.initializeApp(secondaryFirebaseConfig, "secondary");

export const auth = firebase.auth();
export const secondaryAuth = secondaryFirebase.auth();

const provider = new firebase.auth.GoogleAuthProvider();

const AppleAuthProvider = new firebase.auth.OAuthProvider('apple.com')

provider.setCustomParameters({prompt:"select_account"});

export const signInWithGoogle = async () => {
  const mainAuth = await auth.signInWithPopup(provider);
  
  await signInWith(mainAuth.user);  
}
export const signInWithApple = async () => {
  const mainAuth = await auth.signInWithPopup(AppleAuthProvider);

  await signInWith(mainAuth.user);

}

export const signInWith = async (user: firebase.User) => {
  let res = await fetch("https://us-central1-neostudio-staging.cloudfunctions.net/login?uid="+user.uid);
  var token = await res.text();

  const secondaryAuth = secondaryFirebase.auth();
  const loginData = await secondaryAuth.signInWithCustomToken(token);

  if(loginData.user.email === null){
    await fetch(`https://us-central1-neostudio-staging.cloudfunctions.net/createEmail?uid=${user.uid}&email=${user.email}&name=${user.displayName}`);
  }
}

export default firebase;




const test = async ()=>{
  window["testFirebase"] = firebase;
  window["secondaryFirebase"] = secondaryFirebase;
  window["auth"] = auth;
  // var auth = firebase.auth();

  var provider = new firebase.auth.GoogleAuthProvider();
  window["provider"] = provider;
  // var a = await auth.signInWithPopup(provider);
  // console.log(a);
  var auth2 = secondaryFirebase.auth()
  window["auth2"] = auth2;
  // var b= auth2.signInWithCredential(a.credential);
  // console.log(b);
}

console.log(test);
