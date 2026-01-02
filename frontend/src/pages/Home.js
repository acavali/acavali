import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { 
  FaStore, FaPaintBrush, FaLightbulb, FaTruck, 
  FaSignsPost, FaTshirt 
} from 'react-icons/fa';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  const services = [
    {
      icon: <FaStore />,
      title: 'Fachadas',
      description: 'Fachadas bem estruturadas e criativas que fazem toda diferença.',
      features: [
        'Projetos personalizados',
        'Materiais de alta qualidade',
        'Instalaç ão profissional'
      ]
    },
    {
      icon: <FaPaintBrush />,
      title: 'Letras Caixa',
      description: 'Letreiros modernos e sofisticados para identificação da sua empresa.',
      features: [
        'ACM, PVC, Acrílico',
        'Com ou sem iluminação',
        'Design personalizado'
      ]
    },
    {
      icon: <FaLightbulb />,
      title: 'Luminosos',
      description: 'Painéis luminosos com design incrível e alta durabilidade.',
      features: [
        'LED de alta eficiência',
        'Diversos tamanhos',
        'Resistente às intempéries'
      ]
    },
    {
      icon: <FaTruck />,
      title: 'Envelopamento',
      description: 'Personalização de frotas para divulgar sua empresa.',
      features: [
        'Adesivos de alta qualidade',
        'Aplicação profissional',
        'Durabilidade garantida'
      ]
    },
    {
      icon: <FaSignsPost />,
      title: 'Sinalização',
      description: 'Placas e sinalizações para todos os ambientes.',
      features: [
        'Placas fotoluminescentes',
        'Sinalização de segurança',
        'Personalização completa'
      ]
    },
    {
      icon: <FaTshirt />,
      title: 'Têxtil e Brindes',
      description: 'Camisetas, uniformes e brindes personalizados.',
      features: [
        'Diversos materiais',
        'Estampas de qualidade',
        'Preços competitivos'
      ]
    }
  ];

  const stats = [
    { number: '40%', label: 'Aumento em vendas*' },
    { number: '500+', label: 'Projetos concluídos' },
    { number: '98%', label: 'Clientes satisfeitos' },
    { number: '15+', label: 'Anos de experiência' }
  ];

  const brands = [
    { name: '3M', logo: 'https://placehold.co/150x80/1D3557/white?text=3M' },
    { name: 'Avery Dennison', logo: 'https://placehold.co/150x80/E63946/white?text=AVERY' },
    { name: 'HP', logo: 'https://placehold.co/150x80/1D3557/white?text=HP' },
    { name: 'Oracal', logo: 'https://placehold.co/150x80/E63946/white?text=ORACAL' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1D3557] via-[#1D3557] to-[#457B9D] text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-[#E63946] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#A8DADC] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Fachadas de Impacto
                <span className="text-[#E63946]"> Podem Aumentar</span> Suas Vendas em até 40%*
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Destaque sua marca com fachadas, letreiros e comunicação visual de alto impacto.
                Projetos personalizados que unem tecnologia, inovação e qualidade.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="bg-[#E63946] hover:bg-[#C1121F] text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl"
                  data-testid="hero-cta-button"
                >
                  <span>Solicitar Orçamento</span>
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/stickers"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold transition-all border border-white/20"
                >
                  Stickers Personalizados
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-6">
                *De acordo com pesquisa Sebrae-SP sobre visual merchandising
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl font-bold text-[#E63946] mb-2">{stat.number}</div>
                      <div className="text-sm text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1D3557] mb-4">
              Nossos Serviços
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Soluções completas em comunicação visual para transformar seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center space-x-2 text-[#E63946] hover:text-[#C1121F] font-semibold text-lg"
            >
              <span>Ver todos os serviços</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D3557] text-center mb-12">
            Trabalhamos Apenas com os Melhores Materiais
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {brands.map((brand, index) => (
              <div key={index} className="flex items-center justify-center">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-16 object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-[#1D3557] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                Por Que Escolher a Point Sign Milano?
              </h2>
              <div className="space-y-6">
                {[
                  'Experiência de mais de 15 anos no mercado',
                  'Equipe especializada e qualificada',
                  'Materiais de primeira qualidade (3M, Avery, HP)',
                  'Projetos personalizados e exclusivos',
                  'Atendimento rápido e eficiente',
                  'Garantia de satisfação',
                  'Prazos cumpridos rigorosamente',
                  'Preços competitivos'
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-[#E63946] rounded-full p-1 flex-shrink-0 mt-1">
                      <FiCheck className="w-4 h-4" />
                    </div>
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6">Solicite um Orçamento</h3>
              <p className="text-gray-300 mb-6">
                Preencha o formulário e nossa equipe entrará em contato em até 24 horas.
              </p>
              <Link
                to="/contact"
                className="block w-full bg-[#E63946] hover:bg-[#C1121F] text-white text-center px-6 py-4 rounded-lg font-semibold transition-all"
              >
                Falar com Consultor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#E63946] to-[#C1121F] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto Para Transformar Seu Negócio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Entre em contato agora e descubra como podemos ajudar sua empresa a se destacar!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-white text-[#E63946] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Falar no WhatsApp
            </Link>
            <Link
              to="/portfolio"
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/30"
            >
              Ver Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
