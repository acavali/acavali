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
    { path: '/brands', label: 'Marchi' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contatti' },
  ];

  return (
    <header className="fixed top-0 w-full glass z-50 border-b border-white/10 shadow-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 gradient-red rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100"></div>
              <span className="text-white font-black text-2xl relative z-10">P</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1D3557] tracking-tight">Point Sign</h1>
              <p className="text-xs text-gray-500 font-semibold">Milano</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-[#E63946] to-[#FF6B35] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {!isActive(link.path) && (
                  <span className="absolute inset-0 bg-gradient-to-r from-[#E63946] to-[#FF6B35] opacity-0 group-hover:opacity-10 transition-opacity"></span>
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Cart & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative p-3 hover:bg-gradient-to-r hover:from-[#E63946]/10 hover:to-[#FF6B35]/10 rounded-xl transition-all duration-300 group"
              data-testid="cart-button"
            >
              <FiShoppingCart className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#E63946] to-[#FF6B35] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse-slow">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden p-3 hover:bg-gray-100 rounded-xl transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6 text-gray-700" />
              ) : (
                <FiMenu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-[#E63946] to-[#FF6B35] text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
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