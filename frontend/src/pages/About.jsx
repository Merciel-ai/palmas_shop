import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const settings = {
    brandName: 'PALMAS',
    tagline: 'MADEBYSOCIETY',
    supportEmail: 'mbsmgmnt@gmail.com',
    companyPhone: '698926139',
    companyAddress: 'Bonapriso 2382 carrefour armée de l\'air, Douala, Cameroon',
    whatsappNumber: '698179499',
    instagram: 'she.lovesanyass',
    locationLat: 4.0511,
    locationLng: 9.7679
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-7xl md:text-8xl font-bebas text-white tracking-tighter">
            {settings.brandName}
          </h1>
          <p className="text-xl text-[#FF5C00] tracking-[0.3em] mt-2">{settings.tagline}</p>
          <div className="w-20 h-0.5 bg-[#FF5C00] mx-auto mt-6"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Brand Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bebas text-white mb-4">THE MOVEMENT</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              PALMAS is not just a clothing brand. It's a movement born from the streets, 
              raised by society. We create limited pieces for the rare few who dare to be different.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Every drop tells a story. Every piece is a moment in time. We don't restock. 
              We don't follow trends. We set them.
            </p>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-[#1A1A1A] p-6 rounded-xl border border-[#FF5C00]/20"
          >
            <h3 className="text-xl font-bebas text-[#FF5C00] mb-4">CONTACT</h3>
            <div className="space-y-3">
              <p className="text-gray-300">📧 {settings.supportEmail}</p>
              <p className="text-gray-300">📞 {settings.companyPhone}</p>
              <p className="text-gray-300">💬 WhatsApp: {settings.whatsappNumber}</p>
              <p className="text-gray-300">📍 {settings.companyAddress}</p>
              <div className="pt-3">
                <a 
                  href={`https://instagram.com/${settings.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#FF5C00] hover:text-[#FF8C00] transition"
                >
                  📷 @{settings.instagram}
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Real-time Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bebas text-white mb-4">📍 OUR LOCATION</h2>
          <div className="rounded-xl overflow-hidden border border-[#FF5C00]/20 h-96">
            <iframe
              title="Palmas Location"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${settings.locationLng-0.01},${settings.locationLat-0.01},${settings.locationLng+0.01},${settings.locationLat+0.01}&layer=mapnik&marker=${settings.locationLat},${settings.locationLng}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">{settings.companyAddress}</p>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 text-center"
        >
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#FF5C00]/20">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bebas text-white">NEVER RESTOCKED</h3>
            <p className="text-sm text-gray-500 mt-2">Once it's gone, it's gone forever</p>
          </div>
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#FF5C00]/20">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bebas text-white">PREMIUM QUALITY</h3>
            <p className="text-sm text-gray-500 mt-2">Built to last, made for the few</p>
          </div>
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#FF5C00]/20">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-xl font-bebas text-white">DIRECT NEGOTIATION</h3>
            <p className="text-sm text-gray-500 mt-2">Chat with us, agree on price</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;