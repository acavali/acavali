import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { FiCheck } from 'react-icons/fi';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Stickers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();

  const categories = [
    { id: 'all', name: 'Tutti', name_pt: 'Todos' },
    { id: 'sagomato', name: 'Sagomato', name_pt: 'Sagomado' },
    { id: 'tondo', name: 'Tondo', name_pt: 'Redondo' },
    { id: 'rettangolare', name: 'Rettangolare', name_pt: 'Retangular' },
    { id: 'ovale', name: 'Ovale', name_pt: 'Oval' },
    { id: 'quadrato', name: 'Quadrato', name_pt: 'Quadrado' },
    { id: 'fogli', name: 'Fogli', name_pt: 'Folhas' }
  ];

  const features = [
    { icon: <FiCheck />, text: 'Spedizione Gratuita', text_pt: 'Envio Grátis' },
    { icon: <FiCheck />, text: 'Controllo File', text_pt: 'Verificação de Arquivo' },
    { icon: <FiCheck />, text: 'Produzione in 4 giorni', text_pt: 'Produção em 4 dias' },
    { icon: <FiCheck />, text: 'Qualità Impeccabile', text_pt: 'Qualidade Impecável' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const endpoint = selectedCategory === 'all' 
        ? `${API}/products`
        : `${API}/products?category=${selectedCategory}`;
      const response = await axios.get(endpoint);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 50, 'medium'); // Default 50 units, medium size
    toast.success(`${product.name_it} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full blur-3xl" style={{ background: '#0F172A' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              Totalmente
              <span className="block mt-2">Scimmiati per gli Stickers!</span>
            </h1>
            <p className="text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Realize subito i tuoi stickers personalizzati di qualità ed adatti a tutte le esigenze
            </p>
            <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30">
              <p className="text-lg font-semibold">✨ Sistema Easy-Peel GRATUITO ✨</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="text-white py-8" style={{ background: '#0F172A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <div className="text-xl" style={{ color: '#EC4899' }}>{feature.icon}</div>
                <span className="font-semibold">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1D3557] mb-4">
              Realizza subito i tuoi stickers personalizzati
            </h2>
            <p className="text-xl text-gray-600">
              Scegli il formato perfetto per le tue esigenze
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-bold transition-all ${
                  selectedCategory === category.id
                    ? 'text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
                style={{
                  background: selectedCategory === category.id 
                    ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' 
                    : 'white'
                }}
                data-testid={`category-${category.id}`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#E63946] border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Caricamento prodotti...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">Nessun prodotto trovato in questa categoria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Anatomy Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-[#1D3557] text-center mb-12">
            Anatomia dello Sticker Personalizzato
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Protezione',
                description: 'Strato esterno che protegge l\'adesivo. Stampe protette con tecnologia latex.'
              },
              {
                title: 'Stampa',
                description: 'Inchiostri HP Latex per colori brillanti e resistenti, ecologici e certificati Greenguard Gold.'
              },
              {
                title: 'Supporto',
                description: 'Vinile di alta qualità, morbido e resistente. Solo i migliori materiali!'
              },
              {
                title: 'Colla',
                description: 'Adesivo molto potente, adatto a tutte le superfici e resistente all\'acqua.'
              },
              {
                title: 'Liner',
                description: 'Carta siliconata speciale che protegge la colla prima dell\'utilizzo.'
              },
              {
                title: 'Easy-Peel',
                description: 'Sistema esclusivo GRATUITO per facilitare l\'applicazione degli stickers.'
              }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-black mb-3 gradient-text">{item.title}</h3>
                <p style={{ color: '#64748B' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D3557] text-center mb-12">
            USIAMO SOLO I MIGLIORI MATERIALI
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['3M', 'Avery', 'HP', 'Oracal'].map((brand, index) => (
              <div key={index} className="bg-white rounded-xl p-6 flex items-center justify-center shadow-md">
                <img
                  src={`https://placehold.co/150x80/${index % 2 === 0 ? '6366F1' : 'EC4899'}/white?text=${brand}`}
                  alt={brand}
                  className="h-16 object-contain"
                />
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">
            * Tutti i marchi esposti sono di proprietà dei rispettivi detentori dei copyright.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 text-white"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Tocca con mano i nostri prodotti!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Richiedi i nostri campioni gratuiti e scopri la qualità dei nostri stickers
          </p>
          <a
            href="https://wa.me/393484520701?text=Vorrei%20richiedere%20campioni%20gratuiti"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-white"
          >
            Richiedi Campioni Gratuiti
          </a>
        </div>
      </section>
    </div>
  );
};

export default Stickers;