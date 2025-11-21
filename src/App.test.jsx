import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch.mockClear();
  });

  test('renders app with user management components', async () => {
    // Mock initial users fetch
    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    render(<App />);

    // Check user management components
    expect(screen.getByText('Add New User')).toBeInTheDocument();

    // Wait for UserList to load
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    // Check form elements
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create User' })).toBeInTheDocument();
  });

  test('displays users when API returns data', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify(mockUsers), { status: 200 }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  test('handles user creation and refreshes list', async () => {
    const user = userEvent.setup();

    // Mock initial empty users list
    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    // Mock successful user creation
    const newUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify(newUser), { status: 201 }));

    // Mock updated users list after creation
    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify([newUser]), { status: 200 }));

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });

    // Fill and submit form
    await user.type(screen.getByLabelText('Full Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address'), 'john@example.com');
    await user.click(screen.getByRole('button', { name: 'Create User' }));

    // Check success message
    await waitFor(() => {
      expect(screen.getByText('User created successfully.')).toBeInTheDocument();
    });

    // Check user appears in list
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock initial users fetch failure
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Mock form submission error
    global.fetch.mockRejectedValueOnce(new Error('Submission failed'));

    await user.type(screen.getByLabelText('Full Name'), 'Test User');
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Create User' }));

    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });
  });

});