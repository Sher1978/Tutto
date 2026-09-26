import React, { useEffect, useState } from 'react'
import { Zap, Target, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface SplashScreenProps {
  isVisible: boolean
  onFinish: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible, onFinish }) => {
  const [progress, setProgress] = useState(0)
  const onFinishRef = React.useRef(onFinish)
  onFinishRef.current = onFinish

  useEffect(() => {
    if (!isVisible) {
      setProgress(0)
      return
    }

    if (typeof window !== 'undefined' && (window as any).isPlaywright) {
      onFinishRef.current()
      return
    }

    // Smooth 3-second progress bar fill
    const startTime = Date.now()
    const duration = 3000 // 3 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(currentProgress)

      if (elapsed >= duration) {
        clearInterval(interval)
        onFinishRef.current()
      }
    }, 30)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      // pointer-events-auto and click trap prevents dismissal on tap
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      className="fixed inset-0 z-[100] bg-[#070C15] text-white flex flex-col justify-between p-6 select-none animate-fadeIn cursor-default overflow-hidden"
    >
      {/* Background Animated Neon Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00F2FE]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#00F2FE]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar: Progress Timer */}
      <div className="relative z-10 w-full space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold tracking-widest text-cyan-400 uppercase">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-[#00F2FE] text-[#00F2FE] animate-pulse" />
            <span>TUTTOMINUTTO REVERSE AUCTION</span>
          </span>
          <span className="text-[#00F2FE] font-mono">{Math.ceil((3000 - (progress * 30)) / 1000)}s</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#00F2FE] via-[#00F2FE] to-[#00F2FE] transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Middle Content Section */}
      <div className="relative z-10 max-w-md mx-auto w-full my-auto space-y-6 text-center">
        {/* Logo Branding */}
        <div>
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-wider flex items-center justify-center gap-2">
            <span className="glow-tutto text-[#00F2FE]">TUTTO</span>
            <span className="glow-minutto text-[#00F2FE]">MINUTTO</span>
          </h1>
          <p className="text-[12px] font-bold text-cyan-300 tracking-widest uppercase mt-1">
            Платформа обратных аукционов №1
          </p>
        </div>

        {/* Core Value Statement Box */}
        <div
          className="p-5 rounded-3xl text-center space-y-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            boxShadow: '0 0 30px rgba(0, 242, 254, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F2FE]/15 border border-[#00F2FE]/40 text-[#00F2FE] text-[11px] font-extrabold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ГЛАВНЫЙ ПРИНЦИП ПЛАТФОРМЫ</span>
          </div>
          <h2
            className="text-[17px] sm:text-[19px] font-black leading-snug text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Экосистема, где <span className="text-[#00F2FE] underline decoration-[#00F2FE]/60 underline-offset-4">цену определяешь ты</span>. Первые офферы за 1 минуту.
          </h2>
        </div>

        {/* 3 Step Instruction Card */}
        <div
          className="p-5 rounded-3xl text-left space-y-3.5 shadow-xl"
          style={{
            background: 'rgba(10, 16, 29, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          <h3 className="text-[13px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
            <Target className="w-4 h-4 text-[#00F2FE]" />
            <span>КАК ПОЛЬЗОВАТЬСЯ ПЛАТФОРМОЙ:</span>
          </h3>

          <div className="space-y-3 text-[13px] text-gray-200">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#00F2FE]/20 border border-[#00F2FE]/60 text-[#00F2FE] font-extrabold text-[12px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p className="leading-tight font-medium">
                <strong className="text-white font-bold">Создайте быструю заявку в системе</strong> (укажите услугу, локацию и ваш желаемый бюджет).
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#00F2FE]/20 border border-[#00F2FE]/60 text-[#00F2FE] font-extrabold text-[12px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p className="leading-tight font-medium">
                <strong className="text-white font-bold">Выберите подходящее предложение от бизнесов</strong> и ИИ-менеджеров за 1 минуту.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/60 text-amber-400 font-extrabold text-[12px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <p className="leading-tight font-medium">
                <strong className="text-white font-bold">Договоритесь о деталях в переписке</strong> и получите услугу на ваших условиях!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Tip */}
      <div className="relative z-10 w-full text-center pb-2">
        <p className="text-[11px] font-semibold text-gray-400 tracking-wide flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span>Загрузка интерфейса аукциона... ({Math.ceil(progress)}%)</span>
        </p>
      </div>
    </div>
  )
}
