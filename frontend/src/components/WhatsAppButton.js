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
      className="fixed bottom-8 right-8 bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 group animate-float"
      data-testid="whatsapp-button"
    >
      <FaWhatsapp className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
      
      {/* Pulse rings */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></span>
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse opacity-50"></span>
      
      {/* Tooltip */}
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 glass-dark text-white text-sm px-4 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-semibold shadow-xl">
        💬 Fale conosco!
        <span className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-900/30"></span>
      </span>
    </a>
  );
};

export default WhatsAppButton;