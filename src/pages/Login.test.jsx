import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({
    exists: jest.fn().mockReturnValue(true),
    data: jest.fn().mockReturnValue({ role: 'user' }),
  }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('successful login with correct credentials', async () => {
    // Set up the mock for successful login
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'ObkQ99o9oXdbvLby36vST5WJ6u33' },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
      target: { value: 'martin@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  test('unsuccessful login with incorrect credentials', async () => {
    // Set up the mock for unsuccessful login
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
      target: { value: 'incorrect@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
