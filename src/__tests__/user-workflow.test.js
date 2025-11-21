import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock fetch globally
global.fetch = jest.fn();

describe('User Management Workflow Integration', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('complete user creation and listing workflow', async () => {
    const user = userEvent.setup();

    // Mock initial empty users list
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    // Mock successful user creation
    const newUser = { id: 1, name: 'Alice Johnson', email: 'alice@example.com' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newUser)
    });

    // Mock updated users list
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([newUser])
    });

    render(<App />);

    // Verify initial state
    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });

    // Fill out the form
    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    await user.type(nameInput, 'Alice Johnson');
    await user.type(emailInput, 'alice@example.com');
    await user.click(submitButton);

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('User created successfully!')).toBeInTheDocument();
    });

    // Verify user appears in list
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });

    // Verify form is cleared
    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
  });

  test('handles validation errors throughout workflow', async () => {
    const user = userEvent.setup();

    // Mock initial users list
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    // Mock validation error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Email already exists' })
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });

    // Try to create user with existing email
    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    await user.type(nameInput, 'Bob Smith');
    await user.type(emailInput, 'existing@example.com');
    await user.click(submitButton);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText('Error: Email already exists')).toBeInTheDocument();
    });

    // Verify form retains values
    expect(nameInput.value).toBe('Bob Smith');
    expect(emailInput.value).toBe('existing@example.com');
  });

  test('refresh functionality works', async () => {
    const user = userEvent.setup();

    // Initial users
    const initialUsers = [{ id: 1, name: 'Charlie Brown', email: 'charlie@example.com' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(initialUsers)
    });

    // Updated users after refresh
    const updatedUsers = [
      { id: 1, name: 'Charlie Brown', email: 'charlie@example.com' },
      { id: 2, name: 'Dana White', email: 'dana@example.com' }
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(updatedUsers)
    });

    render(<App />);

    // Verify initial user
    await waitFor(() => {
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      expect(screen.getByText('charlie@example.com')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    await user.click(refreshButton);

    // Verify updated list
    await waitFor(() => {
      expect(screen.getByText('Dana White')).toBeInTheDocument();
      expect(screen.getByText('dana@example.com')).toBeInTheDocument();
    });
  });

  test('handles network errors gracefully', async () => {
    // Mock fetch to cause an error in UserList
    global.fetch.mockRejectedValueOnce(new Error('Network failure'));

    render(<App />);

    // UserList should show error message
    await waitFor(() => {
      expect(screen.getByText('Error: Network failure')).toBeInTheDocument();
    });
  });
});