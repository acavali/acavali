import React, { useState } from 'react';
import { FiStar, FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-3xl overflow-hidden hover-lift relative card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ border: '1px solid #F1F5F9' }}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image_url}
          alt={product.name_it}
          className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        
        {product.rating && (
          <div 
            className="absolute top-4 right-4 glass-light px-4 py-2 rounded-full flex items-center space-x-2 animate-fade-in"
            style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}
          >
            <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold" style={{ color: '#0F172A' }}>{product.rating}</span>
          </div>
        )}
      </div>
      
      <div className="p-6 relative z-10">
        <h3 
          className="text-2xl font-black mb-3 transition-all duration-300"
          style={{ 
            color: isHovered ? 'transparent' : '#0F172A',
            backgroundImage: isHovered ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' : 'none',
            WebkitBackgroundClip: isHovered ? 'text' : 'unset',
            backgroundClip: isHovered ? 'text' : 'unset'
          }}
        >
          {product.name_it}
        </h3>
        <p className="text-sm mb-4 line-clamp-2" style={{ color: '#64748B' }}>
          {product.description_it}
        </p>
        
        {product.features && product.features.length > 0 && (
          <ul className="space-y-2 mb-5">
            {product.features.slice(0, 3).map((feature, index) => (
              <li 
                key={index} 
                className="text-xs flex items-center animate-fade-in" 
                style={{ 
                  color: '#64748B',
                  animationDelay: `${index * 100}ms` 
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #EC4899)' }}
                ></span>
                {feature}
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex items-end justify-between">
          <div>
            <span 
              className="text-3xl font-black gradient-text"
            >
              €{product.base_price.toFixed(2)}
            </span>
            <span className="text-xs font-semibold ml-2" style={{ color: '#64748B' }}>/ unità</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="btn-primary hidden md:flex items-center space-x-2"
            data-testid={`add-to-cart-${product.id}`}
          >
            <FiShoppingCart />
            <span>Aggiungi</span>
          </button>
        </div>
        
        {product.reviews_count > 0 && (
          <p className="text-xs font-semibold mt-4 text-center" style={{ color: '#64748B' }}>
            ⭐ {product.reviews_count} recensioni
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
