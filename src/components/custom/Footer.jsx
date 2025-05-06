import React from 'react';
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white py-8 mt-auto border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Copyright */}
          <div className="mb-6 md:mb-0">
            <img src="/trip-logo-image.png" alt="AI Trip Planner Logo" className="h-10 mb-3" />
            <p className="text-sm text-gray-500">
              © 2025 AI Trip Planner. All rights reserved.
            </p>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <a href="mailto:baskaran030708@gmail.com" className="text-gray-600 hover:text-blue-500 transition-colors">
              <FaEnvelope className="h-6 w-6" />
            </a>
            <a href="https://github.com/baskaran0708" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
              <FaGithub className="h-6 w-6" />
            </a>
            <a href="https://linkedin.com/in/baskaran-a-b6757625a" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
              <FaLinkedin className="h-6 w-6" />
            </a>
            <span className="text-sm text-gray-600 ml-3 font-medium">Built by Baskaran A</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 