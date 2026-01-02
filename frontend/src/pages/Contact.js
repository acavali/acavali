import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#1D3557] mb-4">Contatti</h1>
          <p className="text-xl text-gray-600">Siamo qui per aiutarti! Contattaci oggi stesso.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-[#1D3557] mb-6">Invia un Messaggio</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 outline-none transition"
                  placeholder="Il tuo nome"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 outline-none transition"
                  placeholder="tua@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 outline-none transition"
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Argomento *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 outline-none transition"
                  placeholder="Richiesta preventivo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Messaggio *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 outline-none transition resize-none"
                  placeholder="Scrivi qui il tuo messaggio..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
                data-testid="submit-contact-form"
              >
                {loading ? (
                  <span>Invio in corso...</span>
                ) : (
                  <>
                    <FiSend />
                    <span>Invia Messaggio</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1D3557] to-[#457B9D] text-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Informazioni di Contatto</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                    <FiMapPin className="w-6 h-6" style={{ color: '#6366F1' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Indirizzo</h3>
                    <p className="text-white/90">
                      Via Montale n.13<br />
                      Opera (MI), CAP 20073
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                    <FiPhone className="w-6 h-6" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Telefono</h3>
                    <a href="tel:+393484520701" className="text-white/90 hover:text-white">
                      +39 348 452 0701
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                    <FiMail className="w-6 h-6" style={{ color: '#EC4899' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:info@pointsign.it" className="text-white/90 hover:text-white">
                      info@pointsign.it
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                    <FiClock className="w-6 h-6" style={{ color: '#6366F1' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Orari di Apertura</h3>
                    <p className="text-white/90">
                      Lunedì - Venerdì: 8:30 - 18:30<br />
                      Sabato - Domenica: Chiuso
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-[#1D3557] mb-4">WhatsApp Diretto</h3>
              <p className="text-gray-600 mb-6">
                Preferisci parlare via WhatsApp? Contattaci direttamente!
              </p>
              <a
                href="https://wa.me/393484520701?text=Olá!%20Gostaria%20de%20mais%20informações"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-center py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Apri WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;