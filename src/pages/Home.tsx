import React, { useEffect, useRef } from 'react';
import { Terminal, Zap, Layout, Code, Cpu, Brain, FlaskConical } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, mode?: 'coding' | 'frontend') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }> = [];

    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#06B6D4'];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      }

      // Draw connections between nearby particles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="rounded-lg flex items-center justify-center min-h-screen relative overflow-hidden text-white">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-black" />

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10 z-10"></div>

      {/* Animated glow effects */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 w-64 h-64 rounded-full bg-green-500/20 blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>

      <div className="relative z-20 w-full max-w-7xl px-4 ">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="flex gap-4 items-center ">
            <h1
              className="lg:text-7xl text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 py-16 lg:py-20 drop-shadow-lg animate-fadeIn transform transition-transform duration-700 hover:scale-110 hover:rotate-2">
              CodeSense AI
            </h1>


          </div>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto relative">
            <span className="relative z-10">The next generation of AI-powered coding interviews and development</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl"></span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coding Interview Card */}
          <div className="group relative">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 rounded-2xl blur-xl transition-all duration-500 -z-10 opacity-0 group-hover:opacity-100"></div>

            <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-8 h-full 
                          transition-all duration-500 group-hover:border-blue-500/40 group-hover:translate-y-[-4px]
                          group-hover:shadow-xl group-hover:shadow-blue-500/10">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-900/30 rounded-lg p-3">
                  <Terminal size={32} className="text-blue-400" />
                </div>
                <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">FEATURED</span>
              </div>

              <h3 className="text-2xl font-bold text-blue-300 mb-4 tracking-tight">
                AI Interview Mode
              </h3>

              <p className="text-gray-300 mb-6">
                Experience the future of technical interviews with our AI that adapts to your skill level.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                  <span className="text-gray-300">Voice-based natural conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                  <span className="text-gray-300">Advanced code evaluation & analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                  <span className="text-gray-300">Personalized learning feedback</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('coding-interview', 'coding')}
                className="w-full relative overflow-hidden rounded-xl py-3.5 group/btn"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 z-0"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity z-0"></span>
                <span className="absolute inset-0 border border-white/10 rounded-xl z-0"></span>

                {/* Sparkles animation */}
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute h-1 w-1 bg-white/40 rounded-full left-[10%] top-[20%] blur-[1px] animate-float-slow"></span>
                  <span className="absolute h-1 w-1 bg-white/40 rounded-full right-[15%] top-[60%] blur-[1px] animate-float-medium"></span>
                  <span className="absolute h-1 w-1 bg-white/40 rounded-full left-[30%] bottom-[20%] blur-[1px] animate-float-fast"></span>
                </span>

                <span className="relative z-10 flex items-center justify-center gap-2 font-semibold tracking-wide">
                  <Zap size={18} className="text-blue-100" />
                  <span>Start Your Interview</span>
                </span>
              </button>
            </div>
          </div>

          {/* Frontend Test Card */}
          <div className="group relative">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 to-emerald-500/0 group-hover:from-teal-500/20 group-hover:to-emerald-500/20 rounded-2xl blur-xl transition-all duration-500 -z-10 opacity-0 group-hover:opacity-100"></div>

            <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-teal-500/20 p-8 h-full 
                          transition-all duration-500 group-hover:border-teal-500/40 group-hover:translate-y-[-4px]
                          group-hover:shadow-xl group-hover:shadow-teal-500/10">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-teal-900/30 rounded-lg p-3">
                  <Layout size={32} className="text-teal-400" />
                </div>
                <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full">INTERACTIVE</span>
              </div>

              <h3 className="text-2xl font-bold text-teal-300 mb-4 tracking-tight">
                React Playground
              </h3>

              <p className="text-gray-300 mb-6">
                Experience Frontend Interview with development environment.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-400"></div>
                  <span className="text-gray-300">Live code previews & hot reload</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-400"></div>
                  <span className="text-gray-300">Component quality suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-400"></div>
                  <span className="text-gray-300">Built-in UI component library</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('frontend-test', 'frontend')}
                className="w-full relative overflow-hidden rounded-xl py-3.5 group/btn"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-700 z-0"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-green-600 opacity-0 group-hover/btn:opacity-100 transition-opacity z-0"></span>
                <span className="absolute inset-0 border border-white/10 rounded-xl z-0"></span>

                {/* Sparkles animation */}
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute h-1 w-1 bg-white/40 rounded-full left-[20%] top-[30%] blur-[1px] animate-float-medium"></span>
                  <span className="absolute h-1 w-1 bg-white/40 rounded-full right-[25%] top-[50%] blur-[1px] animate-float-slow"></span>
                  <span className="absolute h-1 w-1 bg-white/40 rounded-full left-[40%] bottom-[30%] blur-[1px] animate-float-fast"></span>
                </span>

                <span className="relative z-10 flex items-center justify-center gap-2 font-semibold tracking-wide">
                  <Code size={18} className="text-teal-100" />
                  <span>Open React Playground</span>
                </span>
              </button>
            </div>
          </div>

          {/* New AI Lab Card */}
          <div className="group relative">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/20 rounded-2xl blur-xl transition-all duration-500 -z-10 opacity-0 group-hover:opacity-100"></div>

            <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 h-full 
                          transition-all duration-500 group-hover:border-purple-500/40 group-hover:translate-y-[-4px]
                          group-hover:shadow-xl group-hover:shadow-purple-500/10">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-purple-900/30 rounded-lg p-3">
                  <Brain size={32} className="text-purple-400" />
                </div>

                <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full">NEW</span>
              </div>

              <h3 className="text-2xl font-bold text-purple-300 mb-4 tracking-tight">
                AI Code Lab
              </h3>

              <p className="text-gray-300 mb-6">
                Experiment with cutting-edge AI algorithms and models in our collaborative sandbox.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                  <span className="text-gray-300">Machine learning code generators</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                  <span className="text-gray-300">Algorithm optimization tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                  <span className="text-gray-300">Neural network visualizations</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('ai-lab', 'ai')}
                className="w-full relative overflow-hidden rounded-xl py-3.5 group/btn"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 z-0"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity z-0"></span>
                <span className="absolute inset-0 border border-white/10 rounded-xl z-0"></span>

                {/* Sparkles animation */}
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute h-1 w-1 bg-white/40 rounded-full left-[15%] top-[40%] blur-[1px] animate-float-slow"></span>
                  <span className="absolute h-1 w-1 bg-white/40 rounded-full right-[20%] top-[30%] blur-[1px] animate-float-medium"></span>
                  <span className="absolute h-1 w-1 bg-white/40 rounded-full left-[35%] bottom-[25%] blur-[1px] animate-float-fast"></span>
                </span>

                <span className="relative z-10 flex items-center justify-center gap-2 font-semibold tracking-wide">
                  <FlaskConical size={18} className="text-purple-100" />
                  <span>Upcoming Soon</span>
                </span>
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};



export default Home;
