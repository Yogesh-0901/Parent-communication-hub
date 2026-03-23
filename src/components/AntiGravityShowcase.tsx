import React from 'react';
import { FloatingElement } from './FloatingElement.tsx';
import { Star, Sparkles, Zap, Heart, Infinity, Rocket } from 'lucide-react';

export const AntiGravityShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <FloatingElement magneticStrength={0.1} floatingIntensity="slow">
          <h1 className="text-6xl font-bold text-center text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Anti-Gravity UI System
          </h1>
        </FloatingElement>
        
        <FloatingElement magneticStrength={0.08} delay={0.2}>
          <p className="text-xl text-center text-gray-300 mb-16">
            Experience weightless interface elements with magnetic interactions
          </p>
        </FloatingElement>

        {/* Floating Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: <Star size={32} />, title: "Floating Elements", description: "Smooth continuous motion", delay: 0 },
            { icon: <Sparkles size={32} />, title: "Magnetic Pull", description: "Interactive hover effects", delay: 0.1 },
            { icon: <Zap size={32} />, title: "Zero Gravity", description: "Weightless animations", delay: 0.2 },
            { icon: <Heart size={32} />, title: "Smooth Transitions", description: "Fluid page changes", delay: 0.3 },
            { icon: <Infinity size={32} />, title: "Parallax Depth", description: "Spatial immersion", delay: 0.4 },
            { icon: <Rocket size={32} />, title: "Performance", description: "Optimized rendering", delay: 0.5 }
          ].map((item, index) => (
            <FloatingElement 
              key={index}
              magneticStrength={0.15}
              delay={item.delay}
              floatingIntensity="normal"
            >
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                <div className="text-purple-400 mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-center">{item.title}</h3>
                <p className="text-gray-400 text-center">{item.description}</p>
              </div>
            </FloatingElement>
          ))}
        </div>

        {/* Interactive Demo Area */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
          <FloatingElement magneticStrength={0.12}>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Interactive Demo</h2>
          </FloatingElement>
          
          <div className="flex flex-wrap justify-center gap-4">
            {["Hover Me", "Magnetic Pull", "Floating", "Weightless"].map((text, index) => (
              <FloatingElement 
                key={index}
                magneticStrength={0.2}
                delay={index * 0.1}
                enableHover={true}
                enableGlow={true}
              >
                <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all">
                  {text}
                </button>
              </FloatingElement>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
