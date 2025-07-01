import React, { useEffect, useState } from 'react';
import { Sparkles, Rocket, Save, Upload, Plus, Star, Heart, Zap } from 'lucide-react';

interface CelebrationOverlayProps {
  type: 'push' | 'save' | 'create';
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ type }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'push':
        return <Upload className="w-8 h-8" />;
      case 'save':
        return <Save className="w-8 h-8" />;
      case 'create':
        return <Plus className="w-8 h-8" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'push':
        return 'Successfully pushed to GitHub! 🚀';
      case 'save':
        return 'File saved successfully! ✨';
      case 'create':
        return 'New file created! 🎉';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'push':
        return 'from-green-400 via-emerald-500 to-teal-600';
      case 'save':
        return 'from-blue-400 via-purple-500 to-indigo-600';
      case 'create':
        return 'from-pink-400 via-purple-500 to-indigo-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-pulse" />
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '2s',
          }}
        >
          {Math.random() > 0.5 ? (
            <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
          ) : Math.random() > 0.5 ? (
            <Star className="w-3 h-3 text-purple-400 animate-pulse" />
          ) : Math.random() > 0.5 ? (
            <Heart className="w-3 h-3 text-pink-400 animate-pulse" />
          ) : (
            <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
          )}
        </div>
      ))}

      {/* Central celebration message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl animate-bounce">
          <div className="text-center">
            <div className={`w-16 h-16 bg-gradient-to-r ${getColor()} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse`}>
              <div className="text-white">
                {getIcon()}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
              {getMessage()}
            </h2>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Rocket className="w-4 h-4 animate-bounce" />
              <span className="text-sm">CodeVanta AI</span>
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
          </div>
        </div>
      </div>

      {/* Confetti effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};