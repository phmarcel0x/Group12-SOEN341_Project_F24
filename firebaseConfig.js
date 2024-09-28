// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // For Firebase Auth
import { getFirestore } from "firebase/firestore";  // For Firestore
import { getDatabase } from "firebase/database";  // For Realtime Database (if you're using it)

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-GgVnoeRB7KSgRIEBTpyNrtCuUKjk4TA",
  authDomain: "soen341-project-group12.firebaseapp.com",
  projectId: "soen341-project-group12",
  storageBucket: "soen341-project-group12.appspot.com",
  messagingSenderId: "551475228011",
  appId: "1:551475228011:web:d14120a0b7549888d0f02e",
  measurementId: "G-S286NL2V3Z"
};

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);  // Firebase Auth
const db = getFirestore(app);  // Firestore Database
const rtdb = getDatabase(app);  // Realtime Database (if you use it)

// Export the services you need
export { auth, db, rtdb };