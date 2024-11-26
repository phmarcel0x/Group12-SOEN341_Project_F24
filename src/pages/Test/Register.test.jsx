// Register.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Register from '../Register';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';

// Mock firebaseConfig.js and Firebase Auth/Firestore functions
jest.mock('../../../firebaseConfig', () => ({
    auth: { currentUser: null },
    db: {}, // Mock Firestore Database instance
    rtdb: {}, // Mock Realtime Database instance
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    test('successful registration with correct credentials', async () => {
        // Mock successful registration response
        createUserWithEmailAndPassword.mockResolvedValueOnce({
            user: { uid: 'user123' },
        });
        updateProfile.mockResolvedValueOnce();
        setDoc.mockResolvedValueOnce();

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Enter name/i), {
            target: { value: 'John Doe' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
            target: { value: 'john.doe@gmail.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByLabelText(/Role/i), {
            target: { value: 'Student' },
        });

        fireEvent.click(screen.getByText('Register'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/profile');
            console.log('Successful Registration');
        });
    });

    test('unsuccessful registration with invalid instructor key', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Enter name/i), {
            target: { value: 'John Doe' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
            target: { value: 'john.doe@gmail.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByLabelText(/Role/i), {
            target: { value: 'Instructor' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter Instructor Key/i), {
            target: { value: 'WRONGKEY' },
        });

        fireEvent.click(screen.getByText('Register'));


        await waitFor(() => {
            expect(screen.getByText(/Invalid Instructor Key/i)).toBeInTheDocument();
            console.log('Invalid Instructor Key');
        });
    });


    test('unsuccessful registration with password mismatch', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // Fill the form fields
        fireEvent.change(screen.getByPlaceholderText(/Enter name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter email/i), { target: { value: 'john.doe@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'differentPassword' } });
        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'Student' } });

        fireEvent.click(screen.getByText('Register'));

        // Debugging the DOM to check for the error message
        // screen.debug();

        await waitFor(() => {
            expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
            console.log('Password Mismatch');
        });
    });

});

