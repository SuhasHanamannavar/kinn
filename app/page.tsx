import Link from 'next/link';
import KinCharacter from '@/components/ui/KinCharacter';
import Button from '@/components/ui/Button';
import { CategoryPill, ImportanceBadge } from '@/components/ui/Badges';
import { sampleSignals } from '@/lib/sample-data';
import { 
  Link2, Globe, RefreshCw, Sparkles, CheckCircle2,
  GraduationCap, Briefcase, LineChart, X
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1E] font-sans">
      {/* ============================================================
           NAVIGATION
           ============================================================ */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[1100px] mx-auto px-8 py-4 flex items-center">
          <div className="flex items-center gap-[10px]">
            <KinCharacter size={28} animate={false} showShadow={false} />
            <span className="font-bold text-[17px] tracking-tight">Kin</span>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <Link 
              href="#how" 
              className="text-[13px] text-[#5A5D6B] hover:text-[#1A1A1E] transition-colors hidden sm:block"
            >
              How it works
            </Link>
            <Link 
              href="#signals" 
              className="text-[13px] text-[#5A5D6B] hover:text-[#1A1A1E] transition-colors hidden sm:block"
            >
              Signals
            </Link>
            <Link 
              href="/auth/sign-in" 
              className="text-[13px] text-[#5A5D6B] hover:text-[#1A1A1E] font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
           HERO
           ============================================================ */}
      <section className="max-w-[1100px] mx-auto px-8 pt-16 pb-20 text-center">
        <div className="eyebrow flex justify-center">AI-Powered Website Monitoring</div>
        
        <h1 
          className="font-bold tracking-tight leading-[1.05] mt-3 mb-4"
          style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
        >
          Add a URL.<br />
          <span className="text-[#5A5D6B] font-medium">Kin tells you when it matters.</span>
        </h1>
        
        <p 
          className="text-[#5A5D6B] max-w-[520px] mx-auto mb-8 leading-relaxed"
          style={{ fontSize: 'clamp(15px, 1.6vw, 17px)' }}
        >
          Kin quietly monitors any website, detects meaningful changes, 
          and sends you plain-English alerts. No more manual checking.
        </p>

        {/* Hero input */}
        <div 
          className="flex items-center bg-white border border-[rgba(0,0,0,0.12)] rounded-[14px] p-[6px] max-w-[520px] mx-auto"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <Link2 size={18} className="text-[#8A8D9A] ml-3 mr-2 flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            placeholder="Paste your first URL…"
            className="flex-1 border-none outline-none bg-transparent px-2 py-3 text-[15px] text-[#1A1A1E] placeholder:text-[#8A8D9A]"
          />
          <Link href="/auth/sign-up">
            <Button>Start Tracking</Button>
          </Link>
        </div>

        <p className="text-[12px] text-[#8A8D9A] mt-4">
          Free for 3 URLs · No credit card · Set up in 60 seconds
        </p>

        {/* Kin character */}
        <div className="mt-14 inline-block relative">
          <div 
            className="absolute"
            style={{
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: 12,
              background: 'rgba(0,0,0,0.08)',
              borderRadius: '50%',
              filter: 'blur(6px)',
            }}
          />
          <KinCharacter size={180} state="found" />
        </div>
      </section>

      {/* ============================================================
           HOW IT WORKS
           ============================================================ */}
      <section id="how" className="bg-white border-t border-[rgba(0,0,0,0.06)] py-20 px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <div className="eyebrow flex justify-center">How Kin works</div>
            <h2 className="section-title">
              Set it once.<br />
              <span className="text-[#5A5D6B] font-medium">It runs itself.</span>
            </h2>
            <p className="section-sub mx-auto max-w-md">
              A quiet pipeline that turns noisy websites into clear, actionable signals.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {[
              { icon: <Link2 size={22} strokeWidth={2} />, color: '#2D5F8A', num: '1', title: 'Add URL', desc: 'Paste any website you want to monitor.' },
              { icon: <Globe size={22} strokeWidth={2} />, color: '#0891B2', num: '2', title: 'Discover', desc: 'Kin maps the site and finds what matters.' },
              { icon: <RefreshCw size={22} strokeWidth={2} />, color: '#7C3AED', num: '3', title: 'Scrape Daily', desc: 'Automated checks. No effort from you.' },
              { icon: <Sparkles size={22} strokeWidth={2} />, color: '#D97706', num: '4', title: 'Analyze', desc: 'Kin classifies changes by type and importance.' },
              { icon: <CheckCircle2 size={22} strokeWidth={2} />, color: '#059669', num: '5', title: 'Act', desc: 'Get clear signals. Know what to do next.' },
            ].map((step, i) => (
              <div 
                key={i}
                className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[22px] text-center animate-fade-up hover:border-[rgba(0,0,0,0.14)] hover:shadow-card-hover transition-all"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div 
                  className="w-11 h-11 rounded-[12px] flex items-center justify-center mx-auto mb-[14px]"
                  style={{ background: `${step.color}14`, color: step.color }}
                >
                  {step.icon}
                </div>
                <div className="text-[13px] font-bold text-[#1A1A1E] mb-1">
                  {step.num}. {step.title}
                </div>
                <div className="text-[12.5px] text-[#5A5D6B] leading-[1.5]">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           PROBLEM SECTION
           ============================================================ */}
      <section className="py-20 px-8 bg-[#FAFAF7]">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 gap-[60px] items-center">
          <div>
            <div className="eyebrow">The problem</div>
            <h2 className="section-title">
              The web changes constantly.<br />
              <span className="text-[#5A5D6B] font-medium">You can't check it all.</span>
            </h2>
            <p className="text-[16px] text-[#5A5D6B] leading-[1.7] mt-4">
              Scholarship deadlines pass. Pricing changes silently. New features launch unnoticed. 
              Important updates hide in pages you don't have time to visit every day.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                'Manual checking is tedious and unreliable',
                'Raw diffs are technical and overwhelming',
                'You miss what matters in the noise',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-[10px] text-[14px] text-[#5A5D6B]">
                  <span 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}
                  >
                    <X size={12} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Code block */}
          <div 
            className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] p-7 font-mono text-[12.5px] leading-[1.7]"
          >
            <div className="text-[#8A8D9A] mb-3">// Before Kin</div>
            <div className="text-[#1A1A1E]">
              <span style={{ color: '#7C3AED' }}>const</span>{' '}
              <span style={{ color: '#2D5F8A' }}>scholarshipPage</span> ={' '}
              <span style={{ color: '#92400E' }}>"https://univ.edu/scholarships"</span>;
            </div>
            <div className="text-[#1A1A1E] mt-1">
              <span style={{ color: '#7C3AED' }}>let</span> missedDeadline ={' '}
              <span style={{ color: '#059669' }}>true</span>;{' '}
              <span style={{ color: '#8A8D9A' }}>// 😔</span>
            </div>
            
            <div 
              className="border-t border-dashed border-[rgba(0,0,0,0.1)] my-4 pt-4 text-[#8A8D9A]"
            >
              // 47 lines of raw HTML diff later…
            </div>
            
            <div className="text-[#8A8D9A] mt-1">
              <span 
                style={{ background: '#FEE2E2', color: '#991B1B', padding: '1px 4px', borderRadius: 3 }}
              >
                - deadline: "March 1"
              </span>
            </div>
            <div className="text-[#8A8D9A]">
              <span 
                style={{ background: '#D1FAE5', color: '#065F46', padding: '1px 4px', borderRadius: 3 }}
              >
                + deadline: "February 15"
              </span>
            </div>
            <div className="text-[#8A8D9A] mt-2">/* What changed? Is it important? */</div>
            <div className="text-[#8A8D9A]">/* You still don't really know. */</div>
          </div>
        </div>
      </section>

      {/* ============================================================
           INTELLIGENCE DEMO — Noise → Signal
           ============================================================ */}
      <section className="bg-white border-t border-[rgba(0,0,0,0.06)] py-20 px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow flex justify-center">From noise to intelligence</div>
            <h2 className="section-title">
              Kin doesn't dump data.<br />
              <span className="text-[#5A5D6B] font-medium">It explains what matters.</span>
            </h2>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* Raw HTML */}
            <div 
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] overflow-hidden"
            >
              <div 
                className="flex items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.06)]"
                style={{ background: '#FAFAF7' }}
              >
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FF5F57' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#FEBC2E' }} />
                <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#28C840' }} />
                <span className="ml-3 text-[12px] text-[#8A8D9A] font-mono">raw_scrape.html</span>
              </div>
              <div className="p-[18px] font-mono text-[11.5px] leading-[1.8] text-[#5A5D6B] max-h-[280px] overflow-hidden">
                <div>{`<`}<span style={{ color: '#9D174D' }}>div</span>{` `}<span style={{ color: '#0E7490' }}>class</span>{`=`}<span style={{ color: '#92400E' }}>"scholarship"</span>{`>`}</div>
                <div className="pl-4">{`<`}<span style={{ color: '#9D174D' }}>h2</span>{`>`}Spring 2026 Awards{`<`}<span style={{ color: '#9D174D' }}>/h2</span>{`>`}</div>
                <div className="pl-4">
                  {`<`}<span style={{ color: '#9D174D' }}>p</span>{`>`}Application{' '}
                  <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '0 3px', borderRadius: 2 }}>March 1</span>
                  {`<`}<span style={{ color: '#9D174D' }}>/p</span>{`>`}
                </div>
                <div className="pl-4 opacity-35">{`<`}<span style={{ color: '#9D174D' }}>p</span>{`>`}Eligibility:…</div>
                <div className="pl-4 opacity-25">{`<`}<span style={{ color: '#9D174D' }}>div</span>{` `}<span style={{ color: '#0E7490' }}>class</span>{`=`}<span style={{ color: '#92400E' }}>"footer"</span>{`>`}</div>
                <div className="pl-6 opacity-15">© 2026 University</div>
                <div style={{ color: '#065F46' }}>+ &nbsp;{`<`}<span style={{ color: '#9D174D' }}>p</span>{`>`}New: AI Research Fellowship{`<`}<span style={{ color: '#9D174D' }}>/p</span>{`>`}</div>
                <div style={{ color: '#065F46' }}>+ &nbsp;{`<`}<span style={{ color: '#9D174D' }}>p</span>{`>`}Amount: $15,000{`<`}<span style={{ color: '#9D174D' }}>/p</span>{`>`}</div>
                <div style={{ color: '#DC2626' }}>- &nbsp;deadline: "March 1"</div>
                <div style={{ color: '#065F46' }}>+ &nbsp;deadline: "Feb 15"</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full bg-[#1A1A1E] text-white flex items-center justify-center mx-auto mb-2"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="text-[11px] text-[#8A8D9A] font-semibold tracking-[0.05em]">
                KIN<br />ANALYZES
              </div>
            </div>

            {/* Signal card */}
            <div 
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] overflow-hidden border-l-[3px] border-l-[#DC2626]"
            >
              <div className="p-[18px]">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <CategoryPill category="deadline" label="Deadline Change" />
                  <ImportanceBadge level="high" label="HIGH" />
                  <span className="ml-auto text-[11px] text-[#8A8D9A]">Detected just now</span>
                </div>
                <div className="font-bold text-[15px] text-[#1A1A1E] mb-[6px]">
                  Deadline moved up by 14 days
                </div>
                <div className="text-[13.5px] text-[#5A5D6B] leading-[1.6] mb-3">
                  The application deadline for Spring 2026 scholarships has changed from{' '}
                  <b>March 1</b> to <b>February 15</b>.
                </div>
                <div 
                  className="p-[10px_12px] rounded-lg"
                  style={{ 
                    background: 'rgba(220,38,38,0.06)', 
                    border: '1px solid rgba(220,38,38,0.12)' 
                  }}
                >
                  <div 
                    className="text-[11px] font-bold uppercase tracking-[0.05em] mb-[3px]"
                    style={{ color: '#991B1B' }}
                  >
                    Why it matters
                  </div>
                  <div 
                    className="text-[12.5px] leading-[1.5]"
                    style={{ color: '#7F1D1D' }}
                  >
                    You have two weeks less than expected. Start your application immediately.
                  </div>
                </div>
                <div className="mt-[10px] text-[11.5px] text-[#8A8D9A]">
                  Source: univ.edu/scholarships
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           SIGNAL FEED
           ============================================================ */}
      <section id="signals" className="bg-[#FAFAF7] border-t border-[rgba(0,0,0,0.06)] py-20 px-8">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-9">
            <div className="eyebrow flex justify-center">Live signals</div>
            <h2 className="section-title">Intelligence, organized.</h2>
            <p className="section-sub mx-auto max-w-md">
              Every signal classified by Kin. Click to go deeper.
            </p>
          </div>

          {/* Signal feed - show top 4 */}
          <div className="flex flex-col gap-[10px]">
            {sampleSignals.slice(0, 4).map(signal => (
              <div 
                key={signal.id}
                className={`bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-[16px_18px] hover:border-[rgba(0,0,0,0.14)] hover:shadow-[0_3px_14px_rgba(0,0,0,0.04)] transition-all cursor-pointer ${signal.importance === 'high' ? 'border-l-[3px] border-l-[#DC2626]' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <CategoryPill category={signal.category} label={signal.categoryName} />
                  <ImportanceBadge level={signal.importance} label={signal.importanceLabel} />
                  <span className="ml-auto text-[11px] text-[#8A8D9A]">{signal.time}</span>
                </div>
                <div className="font-bold text-[15px] text-[#1A1A1E] mb-[6px]">
                  {signal.title}
                </div>
                <p className="text-[13.5px] text-[#5A5D6B] leading-[1.6]">
                  {signal.summary}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/auth/sign-up">
              <Button>See all your signals →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
           KIN AI AGENT
           ============================================================ */}
      <section className="bg-white border-t border-[rgba(0,0,0,0.06)] py-20 px-8">
        <div 
          className="max-w-[1000px] mx-auto grid gap-14 items-center"
          style={{ gridTemplateColumns: '280px 1fr' }}
        >
          {/* Kin character */}
          <div className="text-center">
            <div className="inline-block">
              <KinCharacter size={180} state="listening" />
            </div>
            <div className="mt-4">
              <div className="text-[20px] font-bold text-[#1A1A1E]">Kin</div>
              <div className="text-[13px] text-[#5A5D6B] mt-[2px]">Your AI agent</div>
            </div>
          </div>

          {/* Kin states */}
          <div>
            <div className="eyebrow">Meet Kin</div>
            <h2 className="section-title">
              More than a mascot.<br />
              <span className="text-[#5A5D6B] font-medium">Your AI companion.</span>
            </h2>
            <p className="text-[16px] text-[#5A5D6B] leading-[1.65] mt-[14px] mb-6">
              Kin doesn't just decorate the interface. Kin communicates what the system is doing, 
              what it found, and what you should pay attention to. Every state, every reaction, 
              every signal has meaning.
            </p>
            <div className="grid grid-cols-2 gap-[10px]">
              {[
                { label: 'Idle', desc: 'Quietly waiting', emoji: '😌', color: 'rgba(0,0,0,0.04)' },
                { label: 'Listening', desc: 'Attentive to you', emoji: '👂', color: 'rgba(45,95,138,0.08)' },
                { label: 'Scanning', desc: 'Exploring pages', emoji: '🔍', color: 'rgba(8,145,178,0.08)' },
                { label: 'Analyzing', desc: 'Making sense of data', emoji: '🤔', color: 'rgba(124,58,237,0.08)' },
                { label: 'Found something', desc: 'Meaningful change', emoji: '✨', color: 'rgba(5,150,105,0.08)' },
                { label: 'Important', desc: 'Needs attention', emoji: '⚠️', color: 'rgba(217,119,6,0.08)' },
              ].map((state, i) => (
                <div 
                  key={i}
                  className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-[14px] flex items-center gap-3"
                >
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: state.color }}
                  >
                    {state.emoji}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">{state.label}</div>
                    <div className="text-[11.5px] text-[#8A8D9A]">{state.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           USE CASES
           ============================================================ */}
      <section className="bg-[#FAFAF7] border-t border-[rgba(0,0,0,0.06)] py-20 px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow flex justify-center">Who it's for</div>
            <h2 className="section-title">
              Built for people who<br />
              <span className="text-[#5A5D6B] font-medium">can't miss important changes.</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {[
              { icon: <GraduationCap size={28} />, title: 'Students', desc: 'Never miss scholarship deadlines, program updates, or application requirement changes. Kin tells you when dates shift.' },
              { icon: <Briefcase size={28} />, title: 'Professionals', desc: 'Track competitors, partners, and industry portals. Stay ahead of pricing shifts, policy updates, and new features.' },
              { icon: <LineChart size={28} />, title: 'Researchers', desc: 'Monitor government portals, research publications, and data sources. Get alerts when policies or datasets update.' },
            ].map((uc, i) => (
              <div 
                key={i}
                className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[26px] animate-fade-up hover:border-[rgba(0,0,0,0.14)] hover:shadow-card-hover transition-all"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="text-[28px] mb-3">{uc.icon}</div>
                <div className="text-[16px] font-bold text-[#1A1A1E] mb-[6px]">{uc.title}</div>
                <div className="text-[14px] text-[#5A5D6B] leading-[1.6]">{uc.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           FINAL CTA
           ============================================================ */}
      <section className="bg-white border-t border-[rgba(0,0,0,0.06)] py-24 px-8">
        <div className="max-w-[640px] mx-auto text-center">
          <div className="inline-block mb-5">
            <KinCharacter size={64} />
          </div>
          <h2 
            className="font-bold tracking-tight leading-[1.1] mb-[14px]"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Stop refreshing.<br />
            <span className="text-[#5A5D6B] font-medium">Start knowing.</span>
          </h2>
          <p className="text-[16px] text-[#5A5D6B] leading-[1.6] mb-7">
            Free for 3 URLs. Set up in under a minute. Kin is ready when you are.
          </p>

          <div 
            className="flex items-center bg-white border border-[rgba(0,0,0,0.12)] rounded-[14px] p-[6px] max-w-[500px] mx-auto"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <Link2 size={18} className="text-[#8A8D9A] ml-3 mr-2 flex-shrink-0" strokeWidth={2} />
            <input
              type="text"
              placeholder="Paste your first URL…"
              className="flex-1 border-none outline-none bg-transparent px-2 py-3 text-[15px] text-[#1A1A1E] placeholder:text-[#8A8D9A]"
            />
            <Link href="/auth/sign-up">
              <Button>Start Tracking</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
           FOOTER
           ============================================================ */}
      <footer className="bg-[#FAFAF7] border-t border-[rgba(0,0,0,0.06)] py-9 px-8">
        <div 
          className="max-w-[1100px] mx-auto flex items-center justify-between text-[13px] text-[#8A8D9A]"
        >
          <div className="flex items-center gap-[10px]">
            <KinCharacter size={20} animate={false} showShadow={false} />
            <span className="font-bold text-[#5A5D6B]">Kin</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#1A1A1E] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1A1A1E] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1A1A1E] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
