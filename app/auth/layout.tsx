import KinCharacter from '@/components/ui/KinCharacter';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex">
      {/* Left panel - branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1A1A28 0%, #2A2A3A 50%, #1A1A28 100%)'
        }}
      >
        {/* Background decoration */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(45,95,138,0.3), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(124,58,237,0.2), transparent 50%)'
          }}
        />
        
        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <KinCharacter size={36} animate={false} showShadow={false} />
          <span className="text-white font-bold text-[20px] tracking-tight">Kin</span>
          <span 
            className="text-[10px] font-bold text-white/60 px-2 py-[2px] rounded"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            BETA
          </span>
        </div>

        {/* Center - Kin character + tagline */}
        <div className="relative z-10 text-center">
          <div className="inline-block mb-8">
            <KinCharacter size={140} state="listening" />
          </div>
          <h2 className="text-white text-[28px] font-bold leading-tight mb-3">
            Stop refreshing.<br />
            <span className="text-white/60 font-medium">Start knowing.</span>
          </h2>
          <p className="text-white/60 text-[15px] max-w-sm mx-auto leading-relaxed">
            Kin quietly monitors the websites that matter to you and tells you when something important changes.
          </p>
        </div>

        {/* Footer features */}
        <div className="relative z-10 grid grid-cols-3 gap-4 text-white/70 text-[12px]">
          <div className="text-center">
            <div className="text-white font-semibold mb-1">AI-Powered</div>
            <div className="text-white/50">Plain English summaries</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold mb-1">Self-Healing</div>
            <div className="text-white/50">Scrapers adapt automatically</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold mb-1">Free to start</div>
            <div className="text-white/50">3 URLs, no credit card</div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <KinCharacter size={32} animate={false} showShadow={false} />
            <span className="font-bold text-[20px] tracking-tight text-[#1A1A1E]">Kin</span>
          </div>

          <h1 className="text-[28px] font-bold tracking-tight text-[#1A1A1E] mb-2">
            {title}
          </h1>
          <p className="text-[#5A5D6B] text-[14px] mb-8">{subtitle}</p>

          {children}

          <div className="mt-6 text-center text-[13px] text-[#8A8D9A]">
            <Link href="/" className="hover:text-[#1A1A1E] transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
