import { useState, useEffect, memo } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    console.log('[DEBUG] UserList: Fetching users from /api/users');
    console.time('[PERF] UserList: API request duration');
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      console.log('[DEBUG] UserList: API response status:', response.status);

      if (!response.ok) {
        console.error('[DEBUG] UserList: Failed to fetch users, status:', response.status);
        throw new Error('Failed to fetch users');
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('[DEBUG] UserList: Failed to parse response:', jsonErr);
        throw new Error('Invalid response from server');
      }
      console.timeEnd('[PERF] UserList: API request duration');
      console.log('[DEBUG] UserList: Fetched users:', data);
      setUsers(data);
      setError(null);
    } catch (err) {
      console.timeEnd('[PERF] UserList: API request duration');
      console.error('[DEBUG] UserList: Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="text-center p-5 text-gray-600">Loading users...</div>;
  }

  if (error) {
    return <div className="mt-3 p-3 bg-red-100 text-red-800 border border-red-300 rounded text-center">Error: {error}</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50 shadow-md">
      <h2 className="text-center mb-5 text-gray-800 text-xl font-semibold">Users</h2>
      {users.length === 0 ? (
        <p className="text-center text-gray-500 italic">No users found.</p>
      ) : (
        <ul className="list-none p-0">
          {users.map(user => (
            <li key={user._id} className="p-3 mb-2 bg-white border border-gray-200 rounded flex justify-between items-center">
              <span className="font-bold text-gray-800">{user.name}</span> - <span className="text-gray-600">{user.email}</span>
            </li>
          ))}
        </ul>
      )}
      <button onClick={fetchUsers} className="block mx-auto mt-5 p-3 bg-green-500 text-white border-none rounded hover:bg-green-700 cursor-pointer transition">Refresh</button>
    </div>
  );
}

export default memo(UserList);