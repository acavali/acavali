import React from 'react';

const ServiceCard = ({ icon, title, description, features }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group p-6">
      <div className="text-[#E63946] text-4xl mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-[#1D3557] mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {features && features.length > 0 && (
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start">
              <span className="w-1.5 h-1.5 bg-[#E63946] rounded-full mr-2 mt-2 flex-shrink-0"></span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServiceCard;