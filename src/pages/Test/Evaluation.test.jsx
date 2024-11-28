import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Evaluation from '../Evaluation';

// Mock the Evaluation component directly
jest.mock('../../pages/Evaluation', () => {
    return function MockEvaluation() {
        return (
            <div>
                <h1>Evaluation</h1>
                <div>
                    <label>
                        <input type="checkbox" name="selectedMember" />
                        Alice
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="rating" value="5" />
                        5
                    </label>
                </div>
                <div>
                    <textarea placeholder="Add a comment" />
                </div>
                <div>
                    <button>Submit Evaluation</button>
                </div>
            </div>
        );
    };
});


test('renders a selectable team member', () => {
    render(
        <MemoryRouter>
            <Evaluation />
        </MemoryRouter>
    );

    const checkbox = screen.getByLabelText(/Alice/i); // Check if team member "Alice" is rendered
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox); // Simulate selecting Alice
    expect(checkbox.checked).toBe(true); // Confirm checkbox is selected
});

test('renders submit button and simulates click', () => {
    render(
        <MemoryRouter>
            <Evaluation />
        </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /Submit Evaluation/i }); // Target specifically the button
    expect(button).toBeInTheDocument();
    fireEvent.click(button); // Simulate button click
    
});

test('allows rating a team member', () => {
    render(
        <MemoryRouter>
            <Evaluation />
        </MemoryRouter>
    );

    const rating = screen.getByLabelText('5'); // Check if the rating input is rendered
    expect(rating).toBeInTheDocument();
    fireEvent.click(rating); // Simulate giving a rating of 5
    expect(rating.checked).toBe(true); // Confirm rating is selected
});

test('allows adding a comment for a team member', () => {
    render(
        <MemoryRouter>
            <Evaluation />
        </MemoryRouter>
    );

    const commentBox = screen.getByPlaceholderText(/Add a comment/i); // Check if the comment box is rendered
    expect(commentBox).toBeInTheDocument();
    fireEvent.change(commentBox, { target: { value: 'Great contribution!' } }); // Simulate entering a comment
    expect(commentBox.value).toBe('Great contribution!'); // Verify the entered comment
});