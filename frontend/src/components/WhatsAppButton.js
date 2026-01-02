import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  const phoneNumber = '393484520701';
  const message = 'Olá! Gostaria de mais informações sobre os serviços.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:scale-110 text-white p-5 rounded-full shadow-2xl transition-all duration-300 z-50 group"
      style={{ 
        animation: 'float 3s ease-in-out infinite',
        boxShadow: '0 10px 30px rgba(37, 211, 102, 0.3)'
      }}
      data-testid="whatsapp-button"
    >
      <FaWhatsapp className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
      
      {/* Pulse ring */}
      <span 
        className="absolute inset-0 rounded-full animate-ping opacity-75"
        style={{ background: '#25D366' }}
      ></span>
      
      {/* Tooltip */}
      <span 
        className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-semibold shadow-xl px-4 py-3 rounded-xl text-sm"
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          color: 'white'
        }}
      >
        💬 Fale conosco!
      </span>
    </a>
  );
};

export default WhatsAppButton;
