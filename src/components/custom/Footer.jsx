import React from 'react';
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 mt-auto border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left Section */}
          <div className="text-gray-600 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <img src="/trip-logo-image.png" alt="AI Trip Planner Logo" className="h-8 mr-2" />
            </div>
            <p className="text-sm">
              © 2025 AI Trip Planner. All rights reserved.
            </p>
          </div>
          
          {/* Center Section */}
          <div className="text-gray-600 flex items-center">
            <span className="font-medium">Built with <span className="text-red-500 mx-1">❤️</span> by Baskaran A</span>
          </div>
          
          {/* Right Section */}
          <div className="text-gray-600 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-4 mb-2">
              <a href="mailto:baskaran030708@gmail.com" className="hover:text-blue-600 transition-colors">
                <FaEnvelope className="h-5 w-5" />
              </a>
              <a href="https://github.com/baskaran0708" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                <FaGithub className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/in/baskaran-a-b6757625a" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm">
              Contact: <a href="mailto:baskaran030708@gmail.com" className="text-blue-600 hover:underline">
                baskaran030708@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 