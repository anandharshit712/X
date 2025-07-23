import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '🧩',
    title: 'Offerwall SDK',
    description: 'Plug-and-play offerwall integration to monetize non-paying users.',
    color: 'text-green-600',
  },
  {
    icon: '🎯',
    title: 'Rewarded Ads',
    description: 'Boost revenue with engaging video and playable ad formats.',
    color: 'text-blue-600',
  },
  {
    icon: '📈',
    title: 'Performance Campaigns',
    description: 'Launch CPI, CPA, and CPE campaigns that drive real installs.',
    color: 'text-purple-600',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    description: 'Track revenue, offers, and user data in real time.',
    color: 'text-indigo-600',
  },
];

const testimonials = [
  {
    quote: 'Our revenue grew by 40% in the first month. Super intuitive platform!',
    author: 'Studio Lead, GameVerse',
  },
  {
    quote: 'Incredible support and seamless setup. Highly recommend.',
    author: 'UA Manager, AppLaunch',
  },
];

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <section className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-800 overflow-hidden">
        {/* Background Pattern (fixed) */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <nav className="relative z-50">
          <div className="mx-16 mt-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="w-[220px]">
                <div className="w-50">
                  <img src="/logo_white.png" alt="engageX" />
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <button
                  className="block py-2 text-2xl text-white hover:text-purple-700"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
                <button
                  className="block py-2 text-2xl text-white hover:text-purple-700"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </button>
              </div>

              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="text-white text-3xl">{isMenuOpen ? '✖' : '☰'}</span>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-4 py-2 space-y-2">
                <button
                  className="block py-2 text-gray-700"
                  onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                >
                  Sign In
                </button>
                <button
                  className="block py-2 text-gray-700"
                  onClick={() => { setIsMenuOpen(false); navigate('/signup'); }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </nav>

        <div className="relative container mx-auto px-4 flex flex-col lg:flex-row items-center mt-20 pt-20">
          {/* Left Content */}
          <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <div className="animate-fade-in">
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Monetize{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  Smarter
                </span>
                .<br />
                Grow{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Faster
                </span>
                .<br />
                Acquire{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                  Better
                </span>
                .
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-2xl">
                A complete platform for app monetization and performance marketing — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  className="bg-white text-purple-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </button>
                <button
                  className="border border-white text-white hover:bg-white hover:text-purple-900 font-semibold px-8 py-4 text-lg rounded-lg flex items-center justify-center"
                  onClick={() => navigate('/login')}
                >
                  Already have an account? <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white/0 backdrop-blur-sm rounded-3xl p-8 border border-white/0">
                <img src="/hero.png" alt="Hero" className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gray-600 text-lg font-medium">Trusted by leading developers and advertisers</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-purple-600 mb-2">50M+</div>
              <div className="text-gray-600 font-medium">Engaged Users</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold text-blue-600 mb-2">300+</div>
              <div className="text-gray-600 font-medium">Publisher Apps</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-green-600 mb-2">$10M+</div>
              <div className="text-gray-600 font-medium">Paid Out</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold text-indigo-600 mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">What we offer</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to grow your app — from acquisition to monetization.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${feature.color} mb-6 text-5xl`}>{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Monetization & Acquisition</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Two ways to grow — one powerful dashboard.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in">
              <div className="text-green-600 mb-6 text-6xl">💵</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Monetization</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Turn user engagement into revenue with flexible ad formats and offerwalls.</p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-purple-600 mb-6 text-6xl">🚀</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">User Acquisition</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Run global campaigns that drive quality users and real performance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="animate-fade-in">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Manage your apps, offers, and earnings — all in one place.</h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">Control everything from one clean, real-time dashboard. Launch campaigns, track performance, and optimize on the go.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="bg-purple-600 hover:bg-purple-700 px-8 py-4 text-lg rounded-lg text-white"
                    onClick={() => navigate('/signup')}
                  >
                    Sign Up!
                  </button>
                  <button
                    className="border border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg rounded-lg flex items-center justify-center"
                    onClick={() => navigate('/login')}
                  >
                    I already have an account <span className="ml-2">→</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="relative animate-scale-in">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-3xl blur-2xl opacity-20"></div>
                <img src="/curve.png" alt="Analytics Dashboard" className="relative rounded-3xl shadow-2xl w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">What our partners say</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl text-purple-600 mb-4">"</div>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">{testimonial.quote}</p>
                <p className="text-gray-500 font-medium">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-800">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to scale your growth?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">Join hundreds of developers using our platform to monetize smarter and acquire better.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-white text-purple-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg"
                onClick={() => navigate('/signup')}
              >
                Start Monetizing
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <img src="/logo_white.png" alt="EngageX" className="h-14 mb-8" />
              <p className="text-gray-400 mb-6 max-w-md">The complete platform for app monetization and performance marketing.</p>
              <p className="text-gray-400">Email: support@mobtions.com</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                {/* <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li> */}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                {/* <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li> */}
              </ul>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {/* <a href="#" className="text-gray-400 hover:text-white transition-colors text-2xl">in</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-2xl">▶</a> */}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 Mobtions — All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
