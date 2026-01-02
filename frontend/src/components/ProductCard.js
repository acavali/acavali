import React from 'react';
import { FiStar } from 'react-icons/fi';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image_url}
          alt={product.name_it}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.rating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
            <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold">{product.rating}</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#1D3557] mb-2">{product.name_it}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description_it}</p>
        
        {product.features && product.features.length > 0 && (
          <ul className="space-y-1 mb-4">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-xs text-gray-500 flex items-center">
                <span className="w-1.5 h-1.5 bg-[#E63946] rounded-full mr-2"></span>
                {feature}
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-[#E63946]">€{product.base_price.toFixed(2)}</span>
            <span className="text-sm text-gray-500 ml-1">/ unità</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-[#E63946] hover:bg-[#C1121F] text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            data-testid={`add-to-cart-${product.id}`}
          >
            Personalizza
          </button>
        </div>
        
        {product.reviews_count > 0 && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            {product.reviews_count} recensioni
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;