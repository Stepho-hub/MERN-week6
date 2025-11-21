import { memo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

function UserList() {
  const [users] = useLocalStorage('users', []);

  return (
    <div className="max-w-lg mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50 shadow-md">
      <h2 className="text-center mb-5 text-gray-800 text-xl font-semibold">Users</h2>
      {users.length === 0 ? (
        <p className="text-center text-gray-500 italic">No users found.</p>
      ) : (
        <ul className="list-none p-0">
          {users.map((user, index) => (
            <li key={index} className="p-3 mb-2 bg-white border border-gray-200 rounded flex justify-between items-center">
              <span className="font-bold text-gray-800">{user.name}</span> - <span className="text-gray-600">{user.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(UserList);