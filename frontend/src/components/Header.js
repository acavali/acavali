import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const location = useLocation();
  const cartCount = getCartCount();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'Chi Siamo' },
    { path: '/services', label: 'Servizi' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/stickers', label: 'Stickers' },
    { path: '/contact', label: 'Contatti' },
  ];

  return (
    <header className="fixed top-0 w-full glass z-50 border-b border-gray-200/30" style={{ borderBottomColor: 'rgba(99, 102, 241, 0.1)' }}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' }}
            >
              <div className="w-5 h-5 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight gradient-text">Point Sign</h1>
              <p className="text-xs font-semibold" style={{ color: '#64748B' }}>Milano</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-white'
                    : ''
                }`}
                style={{
                  background: isActive(link.path) ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' : 'transparent',
                  color: isActive(link.path) ? 'white' : '#0F172A'
                }}
              >
                {!isActive(link.path) && (
                  <>
                    <span className="relative z-10">{link.label}</span>
                    <span 
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-3/4"
                      style={{ 
                        background: 'linear-gradient(to right, #6366F1, #EC4899)',
                        opacity: 0
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                    ></span>
                  </>
                )}
                {isActive(link.path) && link.label}
              </Link>
            ))}
          </div>

          {/* Cart & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative p-3 hover:bg-gray-50 rounded-xl transition-all duration-300 group"
              data-testid="cart-button"
            >
              <FiShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: '#0F172A' }} />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse-slow"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #EC4899)' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden p-3 hover:bg-gray-50 rounded-xl transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6" style={{ color: '#0F172A' }} />
              ) : (
                <FiMenu className="w-6 h-6" style={{ color: '#0F172A' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200/30 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${
                  isActive(link.path)
                    ? 'text-white'
                    : ''
                }`}
                style={{
                  background: isActive(link.path) ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' : 'transparent',
                  color: isActive(link.path) ? 'white' : '#0F172A'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
