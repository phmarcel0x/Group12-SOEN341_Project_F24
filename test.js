// test('adds 1 + 2 to equal 3', () => {
//     expect(1 + 2).toBe(3);
//   });
  
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

test('Header renders correctly', () => {
  render(<Header />);
  const textElement = screen.getByText('Hello');
  expect(textElement).toBeInTheDocument();
});
