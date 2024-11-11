
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
const firebaseConfig = require('./firebaseConfig');

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
