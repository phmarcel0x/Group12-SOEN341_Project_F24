
// function login(username, password) {

//   return username === 'user' && password === 'pass';
// }

// // Unit test for the login function
// test('Login with valid credentials', () => {
//   expect(login('user', 'pass')).toBe(true);
// });

// test('Login with invalid credentials', () => {
//   expect(login('user', 'wrongpass')).toBe(false);
// });


// login.test.js
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");


const firebaseConfig = {
  apiKey: "AIzaSyC-GgVnoeRB7KSgRIEBTpyNrtCuUKjk4TA",
  authDomain: "soen341-project-group12.firebaseapp.com",
  projectId: "soen341-project-group12",
  storageBucket: "soen341-project-group12.appspot.com",
  messagingSenderId: "551475228011",
  appId: "1:551475228011:web:d14120a0b7549888d0f02e",
  measurementId: "G-S286NL2V3Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful:', userCredential.user);
    return userCredential.user ? true : false;
  } catch (error) {
    console.error("Login failed:", error.code, error.message); 
    return false;
  }
}


test('Login with valid credentials', async (done) => {
  const isLoggedIn = await login('clutchgod@gmail.com', '123456');
  expect(isLoggedIn).toBe(true);
  done();
});

test('Login with invalid credentials', async (done) => {
  const isLoggedIn = await login('clutchgod@gmail.com', 'wrongpass');
  expect(isLoggedIn).toBe(false);
  done();
});
