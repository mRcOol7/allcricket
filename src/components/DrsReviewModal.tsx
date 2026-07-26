import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tv, Activity, CheckCircle, XCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundFx';
import { speakTVCommentary } from '../utils/cricketCommentary';

export interface DrsReviewData {
  batterName: string;
  bowlerName: string;
  reviewType: 'LBW' | 'CATCH';
  originalDecision: 'OUT' | 'NOT_OUT';
  finalDecision: 'OUT' | 'NOT_OUT';
  pitching: 'IN_LINE' | 'OUTSIDE_STUMPS';
  impact: 'IN_LINE' | 'OUTSIDE_OFF';
  wickets: 'HITTING' | 'MISSING';
  hasEdgeSpike: boolean;
}

interface DrsReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewData: DrsReviewData | null;
}

export const DrsReviewModal: React.FC<DrsReviewModalProps> = ({ isOpen, onClose, reviewData }) => {
  const [step, setStep] = useState<'ULTRA_EDGE' | 'HAWKEYE' | 'DECISION'>('ULTRA_EDGE');

  useEffect(() => {
    if (isOpen && reviewData) {
      setStep('ULTRA_EDGE');
      soundFx.playSuperOver();
      speakTVCommentary(`Third umpire reviewing the decision. Ultra Edge first please.`);

      // Step 1 -> Step 2 (Hawkeye) after 2 seconds
      const t1 = setTimeout(() => {
        setStep('HAWKEYE');
        speakTVCommentary(`Ultra Edge complete. Ball tracking on screen now.`);
      }, 2200);

      // Step 2 -> Step 3 (Decision) after 4.4 seconds
      const t2 = setTimeout(() => {
        setStep('DECISION');
        if (reviewData.finalDecision === 'OUT') {
          soundFx.playWicket();
          speakTVCommentary(`Wickets hitting. Decision is OUT!`);
        } else {
          soundFx.playFanfare();
          speakTVCommentary(`Decision is NOT OUT! Stay with on-field decision.`);
        }
      }, 4400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen, reviewData]);

  if (!isOpen || !reviewData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-mono select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-5 shadow-2xl text-slate-100 flex flex-col overflow-hidden"
        >
          {/* TV Broadcast Banner Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
                <Tv className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-cyan-300 tracking-wider">
                  TV UMPIRE DRS DECISION REVIEW SYSTEM 📺
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  {reviewData.bowlerName} to {reviewData.batterName} ({reviewData.reviewType} APPEAL)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* DRS Replay Animation Box */}
          <div className="py-4 space-y-4">
            
            {/* Step 1: UltraEdge Snickometer */}
            {step === 'ULTRA_EDGE' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 space-y-3 text-center"
              >
                <div className="flex items-center justify-between text-xs text-cyan-400 font-bold">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>ULTRAEDGE SNICKOMETER REPLAY</span>
                  </span>
                  <span className="text-[10px] text-slate-400">FPS: 300hz</span>
                </div>

                {/* Animated Audio Waveform */}
                <div className="relative w-full h-24 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-x-0 h-0.5 bg-slate-700" />
                  
                  {/* Waveform Bars */}
                  <div className="flex items-center space-x-1 z-10">
                    {[12, 18, 14, 28, 45, reviewData.hasEdgeSpike ? 85 : 15, reviewData.hasEdgeSpike ? 95 : 14, reviewData.hasEdgeSpike ? 70 : 16, 32, 16, 12, 10].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.4}%`] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.05 }}
                        className={`w-2.5 rounded-full ${reviewData.hasEdgeSpike && i >= 4 && i <= 7 ? 'bg-rose-500 shadow-rose-500 shadow-lg' : 'bg-cyan-400'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-xs font-extrabold text-slate-300">
                  {reviewData.hasEdgeSpike ? (
                    <span className="text-rose-400 font-bold block animate-bounce">⚡ ULTRAEDGE SPIKE DETECTED! BAT EDGE CONFIRMED!</span>
                  ) : (
                    <span className="text-cyan-300 block">FLAT LINE ON ULTRAEDGE. NO BAT EDGE DETECTED.</span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Hawkeye Ball Tracking */}
            {step === 'HAWKEYE' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 space-y-3 text-center"
              >
                <div className="text-xs font-bold text-cyan-400 flex items-center justify-between">
                  <span>3D HAWKEYE BALL TRACKING STUMPS PATH</span>
                  <span className="text-[10px] text-emerald-400 font-bold">VIRTUAL EYE 3D</span>
                </div>

                {/* Hawkeye Pitch Visualizer */}
                <div className="relative w-full h-32 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center p-2">
                  
                  {/* Pitch Line */}
                  <div className="w-16 h-full bg-amber-300/40 border-x border-amber-400/80 relative">
                    
                    {/* Wickets Top */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex space-x-1">
                      <span className={`w-1.5 h-4 rounded-xs ${reviewData.wickets === 'HITTING' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
                      <span className={`w-1.5 h-4 rounded-xs ${reviewData.wickets === 'HITTING' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
                      <span className={`w-1.5 h-4 rounded-xs ${reviewData.wickets === 'HITTING' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
                    </div>

                    {/* Ball Trajectory Line */}
                    <motion.div
                      initial={{ y: 80, x: 0 }}
                      animate={{ y: reviewData.wickets === 'HITTING' ? 10 : -10, x: reviewData.wickets === 'HITTING' ? 0 : 25 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-cyan-400 shadow-xl flex items-center justify-center text-[8px]"
                    >
                      🔴
                    </motion.div>
                  </div>
                </div>

                {/* Tracking Metrics Badges */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block uppercase">Pitching</span>
                    <span className={reviewData.pitching === 'IN_LINE' ? 'text-emerald-400' : 'text-rose-400'}>
                      {reviewData.pitching}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block uppercase">Impact</span>
                    <span className={reviewData.impact === 'IN_LINE' ? 'text-emerald-400' : 'text-rose-400'}>
                      {reviewData.impact}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block uppercase">Wickets</span>
                    <span className={reviewData.wickets === 'HITTING' ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}>
                      {reviewData.wickets}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Final Umpire Decision Announcement */}
            {step === 'DECISION' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border-2 text-center space-y-3 shadow-2xl ${
                  reviewData.finalDecision === 'OUT'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  TV THIRD UMPIRE FINAL DECISION
                </div>

                <div className="font-mono font-black text-3xl tracking-widest flex items-center justify-center space-x-2">
                  {reviewData.finalDecision === 'OUT' ? (
                    <>
                      <XCircle className="w-8 h-8 text-rose-500 animate-bounce" />
                      <span className="text-rose-500">OUT 🔴</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
                      <span className="text-emerald-400">NOT OUT 🟢</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-mono">
                  {reviewData.finalDecision === 'OUT'
                    ? `Decision Overturned / Upheld! ${reviewData.batterName} HAS TO WALK!`
                    : `Decision Overturned / Upheld! ${reviewData.batterName} IS NOT OUT!`}
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition shadow-lg"
                >
                  Resume Live Play 🏏
                </button>
              </motion.div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
