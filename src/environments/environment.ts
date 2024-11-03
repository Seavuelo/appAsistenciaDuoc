
import { initializeApp } from "firebase/app";
export const environment = {

  production: false,  

  firebase: {
    apiKey: "AIzaSyD5QN41VxhjbgwraVD9SZWEVKqQjfwHN3k",
    authDomain: "ionic-asistencias.firebaseapp.com",
    projectId: "ionic-asistencias",
    storageBucket: "ionic-asistencias.appspot.com",
    messagingSenderId: "447452325467",
    appId: "1:447452325467:web:625cdfd821ed790342417e"
  }
};


// Initialize Firebase
const app = initializeApp(environment.firebase);

