import React from 'react';

const ServiceCard = ({ icon, title, description, features }) => {
  return (
    <div className="card hover-lift">
      <div 
        className="icon-box"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' }}
      >
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-3" style={{ color: '#0F172A' }}>{title}</h3>
      <p className="mb-4" style={{ color: '#64748B' }}>{description}</p>
      {features && features.length > 0 && (
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="text-sm flex items-start" style={{ color: '#0F172A' }}>
              <span 
                className="w-1.5 h-1.5 rounded-full mr-2 mt-2 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366F1, #EC4899)' }}
              ></span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServiceCard;
