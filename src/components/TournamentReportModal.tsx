import React, { useState } from 'react';
import { useCricketStore } from '../store/useCricketStore';
import { X, FileText, Copy, Download, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TournamentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentReportModal: React.FC<TournamentReportModalProps> = ({ isOpen, onClose }) => {
  const { currentTournament } = useCricketStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !currentTournament) return null;

  const awards = currentTournament.awards;

  const generateMarkdownReport = () => {
    let report = `# 🏏 ${currentTournament.name}\n\n`;
    report += `**Status**: ${currentTournament.status}\n`;
    report += `**Total Teams**: ${currentTournament.totalTeams}\n`;
    report += `**Pitch Condition**: ${currentTournament.pitchType || 'BALANCED'}\n\n`;

    if (currentTournament.champion) {
      report += `## 🏆 Tournament Champion\n`;
      report += `🥇 **Champion**: ${currentTournament.champion.name} (${currentTournament.champion.officialName})\n`;
      if (currentTournament.runnerUp) {
        report += `🥈 **Runner-Up**: ${currentTournament.runnerUp.name}\n`;
      }
      report += `\n`;
    }

    if (awards) {
      report += `## 📊 Tournament Highlights & Individual Awards\n`;
      report += `- **Orange Cap (Top Batter)**: ${awards.orangeCap ? `${awards.orangeCap.player} (${awards.orangeCap.team.name}) - ${awards.orangeCap.runs} Runs` : 'N/A'}\n`;
      report += `- **Purple Cap (Top Bowler)**: ${awards.purpleCap ? `${awards.purpleCap.player} (${awards.purpleCap.team.name}) - ${awards.purpleCap.wickets} Wickets` : 'N/A'}\n`;
      report += `- **Total Matches Played**: ${awards.totalMatches}\n`;
      report += `- **Total Runs Scored**: ${awards.totalRuns}\n`;
      report += `- **Total Wickets Taken**: ${awards.totalWickets}\n`;
      report += `- **Total Sixes Hit 💥**: ${awards.totalSixes}\n`;
      report += `- **Total Fours Hit 🏏**: ${awards.totalFours}\n\n`;
    }

    report += `## ⚔️ Round-by-Round Results\n`;
    currentTournament.rounds.forEach((round) => {
      report += `### ${round.name}\n`;
      round.matches.forEach((m) => {
        if (m.isBye) {
          report += `- ${m.homeTeam.name} received a BYE\n`;
        } else {
          const winnerName = m.winnerId === m.homeTeam.id ? m.homeTeam.name : m.awayTeam.name;
          report += `- **${m.homeTeam.name}** (${m.homeRuns}/${m.homeWickets}) vs **${m.awayTeam.name}** (${m.awayRuns}/${m.awayWickets}) -> Winner: **${winnerName}**${m.isSuperOver ? ' [Super Over ⚡]' : ''}\n`;
        }
      });
      report += `\n`;
    });

    return report;
  };

  const markdownText = generateMarkdownReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([markdownText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentTournament.name.replace(/\s+/g, '_')}_Report.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-[2px]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Tournament Summary Report</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Export World Cup bracket results as Markdown
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center border border-slate-700"
              title="Close Report"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-end space-x-2 pt-3 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center space-x-1.5 transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .MD</span>
            </button>
          </div>

          {/* Scrollable Report Content */}
          <div className="overflow-y-auto pr-1 space-y-4 pt-3 flex-1 scrollbar-thin">
            <pre className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
              {markdownText}
            </pre>

            <div className="pt-1 text-center text-[10px] text-amber-400/70 font-mono pb-2">
              ⚠️ Disclaimer: All tournament report data and player records are procedurally simulated and may be incorrect or fictional.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
