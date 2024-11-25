import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import Evaluation from './Evaluation';

// Mock Firebase auth
jest.mock('../../firebaseConfig', () => ({
    auth: {
        currentUser: { email: 'testuser@example.com', uid: '12345' }
    },
    db: {}
}));

describe('Evaluation Component', () => {
    const mockNavigate = jest.fn();
    const mockUseLocation = jest.fn(() => ({
        state: {
            teamMembers: [
                { name: 'Alice', email: 'alice@example.com' },
                { name: 'Bob', email: 'bob@example.com' },
                { name: 'Charlie', email: 'charlie@example.com' }
            ]
        }
    }));

    jest.mock('react-router-dom', () => ({
        useNavigate: () => mockNavigate,
        useLocation: mockUseLocation
    }));

    test('renders the Evaluation component with filtered members', () => {
        render(
            <BrowserRouter>
                <Evaluation />
            </BrowserRouter>
        );

        expect(screen.getByText('Evaluation')).toBeInTheDocument();
        expect(screen.getByText('Select members to evaluate')).toBeInTheDocument();

        // Verify filtered members (excluding the current user)
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument(); // Current user filtered out
    });

    test('allows selecting members for evaluation', () => {
        render(
            <BrowserRouter>
                <Evaluation />
            </BrowserRouter>
        );

        const aliceCheckbox = screen.getByLabelText('Alice');
        const bobCheckbox = screen.getByLabelText('Bob');

        // Select Alice
        fireEvent.click(aliceCheckbox);
        expect(aliceCheckbox).toBeChecked();

        // Select Bob
        fireEvent.click(bobCheckbox);
        expect(bobCheckbox).toBeChecked();

        // Deselect Alice
        fireEvent.click(aliceCheckbox);
        expect(aliceCheckbox).not.toBeChecked();
    });

    test('allows selecting a dimension for evaluation', () => {
        render(
            <BrowserRouter>
                <Evaluation />
            </BrowserRouter>
        );

        const dimension = screen.getByText('Conceptual Contribution');
        fireEvent.click(dimension);

        // Check if dimension is selected
        expect(dimension).toHaveClass('selected');
    });

    test('updates evaluation data on rating and comment change', () => {
        render(
            <BrowserRouter>
                <Evaluation />
            </BrowserRouter>
        );

        const aliceCheckbox = screen.getByLabelText('Alice');
        fireEvent.click(aliceCheckbox);

        const dimension = screen.getByText('Conceptual Contribution');
        fireEvent.click(dimension);

        const ratingInput = screen.getByLabelText('1');
        fireEvent.click(ratingInput);

        const commentBox = screen.getByPlaceholderText(
            'Add a comment for Alice in Conceptual Contribution (optional)'
        );
        fireEvent.change(commentBox, { target: { value: 'Great work!' } });

        expect(ratingInput).toBeChecked();
        expect(commentBox.value).toBe('Great work!');
    });

    test('navigates to confirmation page on submit', async () => {
        render(
            <BrowserRouter>
                <Evaluation />
            </BrowserRouter>
        );

        const submitButton = screen.getByText('Confirm');
        fireEvent.click(submitButton);

        expect(mockNavigate).toHaveBeenCalledWith('/confirmation', expect.any(Object));
    });
});
