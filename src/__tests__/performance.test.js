import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import ErrorBoundary from '../components/ErrorBoundary';

// Mock fetch globally
global.fetch = jest.fn();

// Mock performance API
global.performance = {
  now: jest.fn(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
};

describe('Performance Tests', () => {
  beforeEach(() => {
    global.fetch.mockClear();
    jest.clearAllTimers();
  });

  test('UserForm handles rapid submissions without performance degradation', async () => {
    const user = userEvent.setup();
    const mockOnUserCreated = jest.fn();

    // Mock successful API responses
    global.fetch.mockResolvedValue(new Response(JSON.stringify({ id: 1, name: 'Test', email: 'test@example.com' }), { status: 201 }));

    render(<UserForm onUserCreated={mockOnUserCreated} />);

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: 'Create User' });

    const startTime = Date.now();

    // Simulate rapid form submissions
    for (let i = 0; i < 5; i++) {
      await user.clear(nameInput);
      await user.clear(emailInput);
      await user.type(nameInput, `User ${i}`);
      await user.type(emailInput, `user${i}@example.com`);
      await user.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText('Welcome aboard! User created successfully.')).toBeInTheDocument();
      });
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should complete within reasonable time (allowing for async operations)
    expect(totalTime).toBeLessThan(5000); // 5 seconds max
    expect(mockOnUserCreated).toHaveBeenCalledTimes(5);
  });

  test('UserList renders large user lists efficiently', async () => {
    // Create a large dataset
    const largeUserList = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`
    }));

    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify(largeUserList), { status: 200 }));

    const startTime = performance.now();
    render(<UserList />);
    const endTime = performance.now();

    // Initial render should be fast
    expect(endTime - startTime).toBeLessThan(100); // 100ms max for initial render

    // Wait for data to load and verify all users are rendered
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    // Verify large list renders correctly
    await waitFor(() => {
      largeUserList.slice(0, 10).forEach(user => {
        expect(screen.getByText(user.name)).toBeInTheDocument();
        expect(screen.getByText(user.email)).toBeInTheDocument();
      });
    });
  });

  test('API calls include performance timing logs', async () => {
    const consoleSpy = jest.spyOn(console, 'time').mockImplementation(() => {});
    const consoleSpyEnd = jest.spyOn(console, 'timeEnd').mockImplementation(() => {});

    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    render(<UserList />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('[PERF] UserList: API request duration');
      expect(consoleSpyEnd).toHaveBeenCalledWith('[PERF] UserList: API request duration');
    });

    consoleSpy.mockRestore();
    consoleSpyEnd.mockRestore();
  });

  test('form validation prevents unnecessary API calls', async () => {
    const user = userEvent.setup();

    render(<UserForm />);

    const submitButton = screen.getByRole('button', { name: 'Create User' });

    // Try to submit empty form
    await user.click(submitButton);

    // Should not make API call
    expect(global.fetch).not.toHaveBeenCalled();

    // Try to submit with only name
    const nameInput = screen.getByLabelText('Full Name');
    await user.type(nameInput, 'Test User');
    await user.click(submitButton);

    // Should still not make API call (email required)
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('error boundaries prevent cascading failures', async () => {
    // Mock a component that throws an error
    const ThrowErrorComponent = () => {
      throw new Error('Component error');
    };

    // This test ensures error boundaries work without performance impact
    const startTime = performance.now();

    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(500); // Error handling should be fast
  });
});