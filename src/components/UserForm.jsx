import { useState, memo } from 'react';

function UserForm({ onUserCreated }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[DEBUG] UserForm: Submitting form with data:', formData);
    console.time('[PERF] UserForm: API request duration');
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('[DEBUG] UserForm: Making API request to /api/users');
      console.log('[DEBUG] UserForm: Request payload:', JSON.stringify(formData));
      console.log('[DEBUG] UserForm: Current window location:', window.location.href);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('[DEBUG] UserForm: API response status:', response.status);
      console.log('[DEBUG] UserForm: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Failed to create user';
        try {
          const errorData = await response.json();
          console.error('[DEBUG] UserForm: API error response:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonErr) {
          console.error('[DEBUG] UserForm: Failed to parse error response:', jsonErr);
        }
        throw new Error(errorMessage);
      }

      let newUser;
      try {
        newUser = await response.json();
      } catch (jsonErr) {
        console.error('[DEBUG] UserForm: Failed to parse success response:', jsonErr);
        throw new Error('Invalid response from server');
      }
      console.timeEnd('[PERF] UserForm: API request duration');
      console.log('[DEBUG] UserForm: User created successfully:', newUser);
      setSuccess(true);
      setFormData({ name: '', email: '' });

      if (onUserCreated) {
        onUserCreated(newUser);
      }
    } catch (err) {
      console.timeEnd('[PERF] UserForm: API request duration');
      console.error('[DEBUG] UserForm: Error during submission:', err);
      console.error('[DEBUG] UserForm: Error type:', err.constructor.name);
      console.error('[DEBUG] UserForm: Error message:', err.message);
      console.error('[DEBUG] UserForm: Error stack:', err.stack);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.error('[DEBUG] UserForm: This appears to be a network connectivity issue');
        console.error('[DEBUG] UserForm: Check if the server is running and accessible');
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-8 relative overflow-hidden">
        {/* Vibrant gradient background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/40 via-emerald-50/30 to-blue-50/40 pointer-events-none"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full opacity-20 blur-2xl animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 -right-10 w-32 h-32 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-15 blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Add New User
            </h2>
            <p className="text-gray-600 mt-2 text-sm font-medium">Join our growing community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-cyan-500/30 focus:border-cyan-400 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:border-cyan-300"
                    placeholder="Enter your full name"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/30 focus:border-emerald-400 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:border-emerald-300"
                    placeholder="your.email@example.com"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg group relative overflow-hidden"
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -inset-x-32 -inset-y-8 bg-gradient-to-r from-transparent via-white/20 via-30% to-transparent transform rotate-12 translate-y-16 group-hover:translate-y-0 transition-transform duration-1000"></div>
              
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create User
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in slide-in-from-top duration-300 flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <span className="font-bold">Oops!</span> {error}
              </div>
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50/80 backdrop-blur-sm border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium animate-in slide-in-from-top duration-300 flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="font-bold">Welcome aboard!</span> User created successfully.
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add custom animation for pulsing effect */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default memo(UserForm);