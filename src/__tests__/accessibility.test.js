import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import ErrorBoundary from '../components/ErrorBoundary';

// Mock fetch globally
global.fetch = jest.fn();

describe('Accessibility Tests', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('App has proper heading structure', async () => {
    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    render(<App />);

    // Check for section headings
    await screen.findByRole('heading', { name: 'Add New User' });
    await screen.findByRole('heading', { name: 'Users' });
  });

  test('UserForm has proper form accessibility', () => {
    render(<UserForm />);

    // Check form labels
    const nameLabel = screen.getByLabelText('Full Name');
    const emailLabel = screen.getByLabelText('Email Address');

    expect(nameLabel).toBeRequired();
    expect(emailLabel).toBeRequired();

    // Check input types
    expect(nameLabel).toHaveAttribute('type', 'text');
    expect(emailLabel).toHaveAttribute('type', 'email');

    // Check submit button
    const submitButton = screen.getByRole('button', { name: 'Create User' });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  test('UserList has proper list semantics', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify(mockUsers), { status: 200 }));

    render(<UserList />);

    await screen.findByRole('heading', { name: 'Users' });

    // Check for list
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    // Check list items
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);

    // Verify list item content
    expect(listItems[0]).toHaveTextContent('John Doe');
    expect(listItems[0]).toHaveTextContent('john@example.com');
    expect(listItems[1]).toHaveTextContent('Jane Smith');
    expect(listItems[1]).toHaveTextContent('jane@example.com');
  });

  test('ErrorBoundary provides accessible error messages', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check for error heading
    const errorHeading = screen.getByRole('heading', { name: 'Something went wrong!' });
    expect(errorHeading).toBeInTheDocument();

    // Check for error description
    const errorText = screen.getByText('Please try refreshing the page or contact support if the problem persists.');
    expect(errorText).toBeInTheDocument();

    // Check for recovery button
    const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
    expect(tryAgainButton).toBeInTheDocument();
  });

  test('form provides feedback for validation errors', async () => {
    const user = userEvent.setup();

    // Mock API error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid email format' })
    });

    render(<UserForm />);

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // Check for error message
    await screen.findByText('Oops! Invalid email format');

    // Verify inputs maintain focus and values
    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('invalid-email');
  });

  test('loading states are properly communicated', async () => {
    // Mock slow API response
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve([])
        }), 100)
      )
    );

    render(<UserList />);

    // Check loading message
    expect(screen.getByText('Loading users...')).toBeInTheDocument();

    // Wait for loading to complete
    await screen.findByText('No users found.');
  });

  test('success messages are announced', async () => {
    const user = userEvent.setup();
    const mockOnUserCreated = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test User', email: 'test@example.com' })
    });

    render(<UserForm onUserCreated={mockOnUserCreated} />);

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Check success message
    await screen.findByText('Welcome aboard! User created successfully.');
  });

  test('keyboard navigation works properly', async () => {
    const user = userEvent.setup();

    render(<UserForm />);

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    // Tab through form elements
    await user.tab();
    expect(nameInput).toHaveFocus();

    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  test('buttons have descriptive text', () => {
    render(<UserForm />);

    const submitButton = screen.getByRole('button', { name: 'Create User' });
    expect(submitButton).toBeInTheDocument();
  });

  test('empty state is clearly communicated', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<UserList />);

    await screen.findByText('No users found.');
  });
});