import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FiShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Il tuo carrello è vuoto</h2>
          <p className="text-gray-600 mb-8">
            Aggiungi alcuni stickers personalizzati al tuo carrello!
          </p>
          <Link
            to="/stickers"
            className="btn-primary"
          >
            Scopri i Prodotti
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#1D3557]">Carrello</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-semibold flex items-center space-x-2"
          >
            <FiTrash2 />
            <span>Svuota carrello</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="bg-white rounded-xl shadow-md p-6"
                data-testid={`cart-item-${item.id}`}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={item.image_url}
                    alt={item.name_it}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1D3557] mb-2">
                      {item.name_it}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Dimensione: <span className="font-semibold capitalize">{item.size}</span>
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 10)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          data-testid={`decrease-qty-${item.id}`}
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold min-w-[60px] text-center">
                          {item.quantity} un.
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 10)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          data-testid={`increase-qty-${item.id}`}
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-red-600 hover:text-red-700 p-2"
                        data-testid={`remove-${item.id}`}
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#E63946]">
                      €{(item.base_price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      €{item.base_price.toFixed(2)} / un.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-[#1D3557] mb-6">Riepilogo Ordine</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotale</span>
                  <span>€{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Spedizione</span>
                  <span>GRATIS</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-[#1D3557]">
                    <span>Totale</span>
                    <span className="text-[#E63946]">€{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary block w-full text-center"
                data-testid="checkout-button"
              >
                Procedi al Checkout
              </Link>
              
              <Link
                to="/stickers"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 rounded-lg font-semibold transition-all"
              >
                Continua lo Shopping
              </Link>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-semibold">✓ Spedizione Gratuita</p>
                <p className="text-sm text-green-800 font-semibold">✓ Produzione in 4 giorni</p>
                <p className="text-sm text-green-800 font-semibold">✓ Controllo File Incluso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;