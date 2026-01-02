import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{ background: '#0F172A', color: 'rgba(255, 255, 255, 0.9)' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-black mb-4 gradient-text">Point Sign Milano</h3>
            <p className="text-gray-300 text-sm mb-4">
              Comunicazione visiva creativa e stampa digitale professionale a Milano.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/393484520701"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#E63946] transition-colors"
              >
                <FaWhatsapp className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-[#E63946] transition-colors">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-[#E63946] transition-colors">
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-[#E63946] transition-colors">
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Link Rapidi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  Chi Siamo
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Servizi
                </Link>
              </li>
              <li>
                <Link to="/stickers" className="text-gray-300 hover:text-white transition-colors">
                  Stickers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Servizi</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Fachadas e Letras Caixa</li>
              <li>Adesivi Personalizzati</li>
              <li>Luminosos e Insegne</li>
              <li>Envelopamento Frotas</li>
              <li>Sinalização</li>
              <li>Brindes e Têxtil</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contatti</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <FiMapPin className="w-5 h-5 text-[#E63946] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Via Montale n.13<br />Opera (MI), CAP 20073
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone className="w-5 h-5 text-[#E63946] flex-shrink-0" />
                <a href="tel:+393484520701" className="text-gray-300 hover:text-white">
                  +39 348 452 0701
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FiMail className="w-5 h-5 text-[#E63946] flex-shrink-0" />
                <a href="mailto:info@pointsign.it" className="text-gray-300 hover:text-white">
                  info@pointsign.it
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <FiClock className="w-5 h-5 text-[#E63946] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Lun-Ven: 8:30-18:30
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} Point Sign Milano. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;