

const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Mock the Firebase Authentication methods
jest.mock('firebase/auth');

async function login(email, password) {
  try {
    const auth = getAuth(); // We'll mock this in the test
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful:', userCredential.user);
    return userCredential.user ? true : false;
  } catch (error) {
    // console.error("Login failed:", error.code, error.message); 
    return false;
  }
}

// Test for login with valid credentials
test('Login with valid credentials', async () => {
  // Mocking successful login
  const mockUserCredential = {
    user: { uid: '12345', email: 'clutchgod@gmail.com' },
  };
  signInWithEmailAndPassword.mockResolvedValue(mockUserCredential); // Mock a resolved value
  
  const isLoggedIn = await login('clutchgod@gmail.com', '123456');
  expect(isLoggedIn).toBe(true); // Expecting true because the login is successful
});

// Test for login with invalid credentials
test('Login with invalid credentials', async () => {
  // Mocking failed login
  const mockError = new Error('Invalid credentials');
  signInWithEmailAndPassword.mockRejectedValue(mockError); // Mock a rejected value
  
  const isLoggedIn = await login('clutchgod@gmail.com', 'wrongpass');
  expect(isLoggedIn).toBe(false); // Expecting false because login failed
});
