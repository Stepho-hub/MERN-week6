import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from './UserForm';

// Mock fetch globally
global.fetch = jest.fn();

describe('UserForm Integration Tests', () => {
  beforeEach(() => {
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test', email: 'test@example.com' })
    });
  });

  test('renders form with required fields', () => {
    render(<UserForm />);

    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create User' })).toBeInTheDocument();
  });

  test('submits form successfully and calls onUserCreated callback', async () => {
    const mockOnUserCreated = jest.fn();
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser)
    });

    render(<UserForm onUserCreated={mockOnUserCreated} />);

    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      });
    });

    expect(mockOnUserCreated).toHaveBeenCalledWith(mockUser);
    expect(screen.getByText('User created successfully!')).toBeInTheDocument();
    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
  });

  test('displays loading state during submission', async () => {
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'John', email: 'john@test.com' })
      }), 100))
    );

    render(<UserForm />);

    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    await userEvent.type(nameInput, 'John');
    await userEvent.type(emailInput, 'john@test.com');
    await userEvent.click(submitButton);

    expect(submitButton).toHaveTextContent('Creating...');
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Create User');
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('displays validation error from API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid email' })
    });

    render(<UserForm />);

    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    await userEvent.type(nameInput, 'John');
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error: Invalid email')).toBeInTheDocument();
    });

    expect(nameInput.value).toBe('John');
    expect(emailInput.value).toBe('invalid-email');
  });

  test('displays network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UserForm />);

    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    await userEvent.type(nameInput, 'John');
    await userEvent.type(emailInput, 'john@test.com');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  test('prevents submission with empty required fields', async () => {
    render(<UserForm />);

    const submitButton = screen.getByRole('button', { name: 'Create User' });
    await userEvent.click(submitButton);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('clears previous errors on successful submission', async () => {
    // First submission fails
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid email' })
    });

    // Second submission succeeds
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser)
    });

    render(<UserForm />);

    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    // First attempt - should fail
    await userEvent.type(nameInput, 'John');
    await userEvent.type(emailInput, 'invalid');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error: Invalid email')).toBeInTheDocument();
    });

    // Clear and try again
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User created successfully!')).toBeInTheDocument();
      expect(screen.queryByText('Error: Invalid email')).not.toBeInTheDocument();
    });
  });
});