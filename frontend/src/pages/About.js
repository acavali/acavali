import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#1D3557] mb-4">Chi Siamo</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Point Sign Milano - La tua scelta per comunicazione visiva professionale
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img
              src="https://placehold.co/600x400/1D3557/white?text=Point+Sign"
              alt="Point Sign Milano"
              className="rounded-2xl shadow-2xl"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#1D3557] mb-6">La Nostra Storia</h2>
            <p className="text-gray-600 mb-4">
              Point Sign Milano è un'azienda leader nel settore della comunicazione visiva e della stampa digitale, 
              con oltre 15 anni di esperienza nel mercato.
            </p>
            <p className="text-gray-600 mb-4">
              Specializzati in soluzioni complete per fachadas, insegne luminose, adesivi personalizzati e 
              molto altro, serviamo clienti in tutta la regione di Milano e oltre.
            </p>
            <p className="text-gray-600">
              La nostra missione è fornire prodotti di altissima qualità utilizzando solo materiali premium 
              come 3M, Avery Dennison, HP e Oracal.
            </p>
          </div>
        </div>

        <div 
          className="text-white rounded-3xl p-12 mb-20"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' }}
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-5xl font-bold mb-2">15+</h3>
              <p className="text-xl">Anni di Esperienza</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2">500+</h3>
              <p className="text-xl">Progetti Completati</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2">98%</h3>
              <p className="text-xl">Clienti Soddisfatti</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: 'Missione',
              description: 'Fornire soluzioni di comunicazione visiva di alta qualità che aiutano le aziende a distinguersi e crescere.'
            },
            {
              title: 'Visione',
              description: 'Essere il partner di riferimento per la comunicazione visiva in Italia, riconosciuti per eccellenza e innovazione.'
            },
            {
              title: 'Valori',
              description: 'Qualità, innovazione, sostenibilità e un servizio clienti eccezionale sono al centro di tutto ciò che facciamo.'
            }
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-black mb-4 gradient-text">{item.title}</h3>
              <p style={{ color: '#64748B' }}>{item.description}</p>
            </div>
          ))}
        </div>

        <div 
          className="text-center text-white rounded-3xl p-12"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
        >
          <h2 className="text-4xl font-bold mb-6">Pronto a Iniziare?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contattaci oggi per un preventivo gratuito!
          </p>
          <Link
            to="/contact"
            className="btn-primary"
          >
            Contattaci
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;