import React, { useState } from 'react';
import { FiStar, FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group card-3d relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#E63946]/5 via-transparent to-[#2EC4B6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`}></div>
      
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image_url}
          alt={product.name_it}
          className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-125 rotate-3' : 'scale-100'}`}
        />
        
        {/* Shimmer effect on hover */}
        <div className={`absolute inset-0 shimmer ${isHovered ? 'opacity-30' : 'opacity-0'} transition-opacity`}></div>
        
        {product.rating && (
          <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full flex items-center space-x-2 animate-fade-in">
            <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-white">{product.rating}</span>
          </div>
        )}
        
        {/* Quick view on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => onAddToCart(product)}
            className="w-full bg-white hover:bg-gray-50 text-[#E63946] py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg hover-lift"
          >
            <FiShoppingCart className="w-5 h-5" />
            <span>Aggiungi</span>
          </button>
        </div>
      </div>
      
      <div className="p-6 relative z-10">
        <h3 className="text-2xl font-black text-[#1D3557] mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#E63946] group-hover:to-[#FF6B35] transition-all duration-300">
          {product.name_it}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description_it}</p>
        
        {product.features && product.features.length > 0 && (
          <ul className="space-y-2 mb-5">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-xs text-gray-500 flex items-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="w-2 h-2 gradient-red rounded-full mr-2 group-hover:animate-pulse-slow"></span>
                {feature}
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-black gradient-red bg-clip-text text-transparent">
              €{product.base_price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 ml-2 font-semibold">/ unità</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="hidden md:block bg-gradient-to-r from-[#E63946] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#E63946] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-xl hover-lift"
            data-testid={`add-to-cart-${product.id}`}
          >
            Personalizza
          </button>
        </div>
        
        {product.reviews_count > 0 && (
          <p className="text-xs text-gray-400 mt-4 text-center font-semibold">
            ⭐ {product.reviews_count} recensioni
          </p>
        )}
      </div>
      
      {/* 3D shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

export default ProductCard;