import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { CartProvider } from './contexts/CartContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Stickers from './pages/Stickers';
import Cart from './pages/Cart';
import Contact from './pages/Contact';

// Simple placeholder pages
const Services = () => (
  <div className="min-h-screen pt-32 pb-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-[#1D3557] mb-8 text-center">Nossos Serviços</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: 'Fachadas', desc: 'Projetos personalizados de fachadas' },
          { title: 'Letras Caixa', desc: 'Letreiros 3D modernos' },
          { title: 'Luminosos', desc: 'Painéis com iluminação LED' },
          { title: 'Envelopamento', desc: 'Adesivação de frotas' },
          { title: 'Sinalização', desc: 'Placas e sinalizações' },
          { title: 'Têxtil', desc: 'Uniformes e camisetas' }
        ].map((service, index) => (
          <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-black mb-3 gradient-text">{service.title}</h3>
            <p style={{ color: '#64748B' }}>{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Portfolio = () => (
  <div className="min-h-screen pt-32 pb-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-[#1D3557] mb-8 text-center">Portfolio</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="aspect-square bg-gray-300 rounded-xl overflow-hidden shadow-lg">
            <img
              src={`https://placehold.co/400x400/${index % 3 === 0 ? '6366F1' : index % 3 === 1 ? '8B5CF6' : 'EC4899'}/white?text=Projeto+${index + 1}`}
              alt={`Projeto ${index + 1}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Brands = () => (
  <div className="min-h-screen pt-32 pb-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-[#1D3557] mb-4 text-center">Marcas Parceiras</h1>
      <p className="text-xl text-gray-600 text-center mb-12">Trabalhamos apenas com os melhores materiais</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        {['3M', 'Avery', 'HP', 'Oracal'].map((brand, index) => (
          <div key={index} className="bg-white p-8 rounded-2xl shadow-lg flex items-center justify-center">
            <img
              src={`https://placehold.co/200x100/${index % 3 === 0 ? '6366F1' : index % 3 === 1 ? '8B5CF6' : 'EC4899'}/white?text=${brand}`}
              alt={brand}
              className="h-20 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Blog = () => (
  <div className="min-h-screen pt-32 pb-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-[#1D3557] mb-8 text-center">Blog</h1>
      <p className="text-xl text-gray-600 text-center mb-12">Em breve, artigos e dicas sobre comunicação visual</p>
    </div>
  </div>
);

const Checkout = () => (
  <div className="min-h-screen pt-32 pb-20 bg-gray-50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-5xl font-bold text-[#1D3557] mb-8">Checkout</h1>
      <p className="text-xl text-gray-600 mb-8">
        O sistema de pagamento será integrado em breve.<br />
        Por enquanto, entre em contato via WhatsApp para finalizar seu pedido!
      </p>
      <a
        href="https://wa.me/393484520701?text=Gostaria%20de%20finalizar%20meu%20pedido"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-[#25D366] hover:bg-[#20BA5A] text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg"
      >
        Continuar no WhatsApp
      </a>
    </div>
  </div>
);

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/stickers" element={<Stickers />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
