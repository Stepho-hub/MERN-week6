import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createApp } from '../../server/app.js';
import UserList from './UserList';

// Mock fetch globally
global.fetch = jest.fn();

describe('UserList Integration Tests', () => {
  let server;
  let dbPath;

  beforeAll(() => {
    // Start test server
    dbPath = `./test-integration-${Date.now()}.db`;
    server = createApp(dbPath).listen(3001);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    // Reset fetch mock
    global.fetch.mockClear();
  });

  test('displays loading state initially', () => {
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve([])
      }), 100))
    );

    render(<UserList />);
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  test('displays users after successful fetch', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers)
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  test('displays empty state when no users', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });
  });

  test('displays error message on fetch failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  test('displays error message on API error response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch users')).toBeInTheDocument();
    });
  });

  test('refreshes data when refresh button is clicked', async () => {
    const initialUsers = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
    const updatedUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(initialUsers)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedUsers)
      });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});