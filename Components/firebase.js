import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAriWr6hak1TdMt9Pimu7KdJsxw2xQFPkE",
  authDomain: "emotionflow-84a9d.firebaseapp.com",
  projectId: "emotionflow-84a9d",
  storageBucket: "emotionflow-84a9d.firebasestorage.app",
  messagingSenderId: "640550930813",
  appId: "1:640550930813:web:ab1b58b133df03fca36414",
  measurementId: "G-2RWBHVHJ6H"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();




