import { useState } from 'react'
import UserList from './components/UserList'
import UserForm from './components/UserForm'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'


function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUserCreated = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex flex-col items-center justify-center py-12 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 drop-shadow-lg">User Management</h1>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
        <ErrorBoundary>
          <UserForm onUserCreated={handleUserCreated} />
        </ErrorBoundary>
      </div>
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <ErrorBoundary>
          <UserList key={refreshKey} />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App
