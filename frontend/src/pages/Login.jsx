import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();
  const { signin } = useAuth();

  const bgImages = [
    "https://images.unsplash.com/photo-1534011546717-407bced4d25c?w=1920",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await signin(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden">
      {/* Dynamic Background */}
      {bgImages.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-2000 ${
            currentImage === idx ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={img} alt="Background" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90"></div>
        </div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)]">
          {/* Left Side - Dynamic Message */}
          <div className="text-center md:text-left animate-slide-up">
            <div className="inline-block p-4 bg-afro-orange/20 rounded-2xl backdrop-blur-sm mb-8">
              <div className="text-6xl animate-float">✦</div>
            </div>
            <h1 className="text-7xl md:text-8xl font-bebas text-white mb-4 animate-glow">WELCOME<br/>BACK</h1>
            <p className="text-afro-gold text-xl mb-6">The exclusive circle awaits.</p>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-2 h-2 bg-afro-orange rounded-full"></div>
                <span>Access limited drops first</span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-2 h-2 bg-afro-orange rounded-full"></div>
                <span>Exclusive member pricing</span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-2 h-2 bg-afro-orange rounded-full"></div>
                <span>Direct negotiations with curator</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="animate-zoom-in">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-afro-gold/30 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bebas text-afro-gold">SIGN IN</h2>
                <p className="text-gray-300 text-sm mt-2">Enter the realm of the few</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-afro-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-afro-orange transition placeholder:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-afro-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-afro-orange transition placeholder:text-gray-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-afro-orange to-afro-gold text-black py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-afro-orange/50 transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Accessing...
                    </span>
                  ) : (
                    'ENTER THE DROP'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Not part of the circle?{' '}
                  <Link to="/signup" className="text-afro-orange hover:text-afro-gold transition font-semibold">
                    Join Now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;