// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCudWulukTCOPBdQ5kGZjIQQGHbMuSlFg",
  authDomain: "fccm-91cb4.firebaseapp.com",
  databaseURL: "https://fccm-91cb4-default-rtdb.firebaseio.com",
  projectId: "fccm-91cb4",
  storageBucket: "fccm-91cb4.firebasestorage.app",
  messagingSenderId: "469479046693",
  appId: "1:469479046693:web:dc432cae17df7d548889cc",
  measurementId: "G-0M9WPWW81R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);