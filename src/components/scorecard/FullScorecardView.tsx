/**
 * Screen 12: Full Scorecard View
 * Comprehensive match scorecard with innings breakdown, batting tables,
 * bowling tables, extras, fall of wickets, and export/share capabilities.
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  MapPin,
  Trophy,
  ArrowLeft,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { Match, Team, Player, Innings } from '../../types/cricket';
import { ScoringEngine } from '../../services/scoringEngine';

interface FullScorecardViewProps {
  match: Match;
  teams: Team[];
  players: Player[];
  onBack: () => void;
}

export const FullScorecardView: React.FC<FullScorecardViewProps> = ({
  match,
  teams,
  players,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [copied, setCopied] = useState(false);

  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);

  const inn1 = match.innings[1];
  const inn2 = match.innings[2];

  const currentInnings: Innings | undefined = activeTab === 1 ? inn1 : inn2;

  const getPlayerName = (id: string) => {
    const p = players.find((player) => player.id === id);
    return p ? p.fullName : 'Player';
  };

  const getTeamName = (id: string) => {
    const t = teams.find((team) => team.id === id);
    return t ? t.name : 'Team';
  };

  const handleCopyTextScorecard = () => {
    let summaryText = `🏏 ${match.title}\n📅 ${match.date} | ${match.venue || 'Stadium'}\n\n`;

    if (inn1) {
      summaryText += `1st Innings: ${getTeamName(inn1.battingTeamId)} - ${inn1.totalRuns}/${inn1.wickets} (${ScoringEngine.formatOvers(inn1.legalDeliveries)} ov)\n`;
    }
    if (inn2) {
      summaryText += `2nd Innings: ${getTeamName(inn2.battingTeamId)} - ${inn2.totalRuns}/${inn2.wickets} (${ScoringEngine.formatOvers(inn2.legalDeliveries)} ov)\n`;
    }
    if (match.resultSummary) {
      summaryText += `\n🏆 Result: ${match.resultSummary}\n`;
    }
    summaryText += `Scored on Mahi Crick Pro`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-4 pb-24 select-none">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={handleCopyTextScorecard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Share Summary'}</span>
        </button>
      </div>

      {/* Match Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0e1b3d] to-[#0a1226] border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-amber-400 uppercase tracking-widest">
            {match.matchFormat} • {match.oversPerInnings} Overs
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {match.date}
            </span>
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {match.venue}
              </span>
            )}
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white">{match.title}</h2>

        {/* Results Banner */}
        {match.resultSummary && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{match.resultSummary}</span>
          </div>
        )}
      </div>

      {/* Innings Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 1
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1st Innings ({inn1 ? getTeamName(inn1.battingTeamId) : 'Team 1'})
          {inn1 && ` - ${inn1.totalRuns}/${inn1.wickets}`}
        </button>

        {inn2 && (
          <button
            onClick={() => setActiveTab(2)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 2
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2nd Innings ({getTeamName(inn2.battingTeamId)})
            {` - ${inn2.totalRuns}/${inn2.wickets}`}
          </button>
        )}
      </div>

      {/* Active Innings Details */}
      {currentInnings ? (
        <div className="space-y-4">
          {/* Batting Table */}
          <div className="rounded-2xl bg-[#0a1228] border border-slate-800 overflow-hidden">
            <div className="p-3 bg-[#0d1630] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Batting • {getTeamName(currentInnings.battingTeamId)}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {currentInnings.totalRuns} / {currentInnings.wickets} (
                {ScoringEngine.formatOvers(currentInnings.legalDeliveries)} ov)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-900/40">
                    <th className="py-2.5 px-3">Batter</th>
                    <th className="py-2.5 px-2">Dismissal</th>
                    <th className="py-2.5 px-2 text-right">R</th>
                    <th className="py-2.5 px-2 text-right">B</th>
                    <th className="py-2.5 px-2 text-right">4s</th>
                    <th className="py-2.5 px-2 text-right">6s</th>
                    <th className="py-2.5 px-3 text-right">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {Object.values(currentInnings.batters).map((b) => {
                    const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
                    let dismissalDesc = 'not out';
                    if (b.isOut) {
                      if (b.dismissalType === 'bowled') dismissalDesc = 'b ' + getPlayerName(b.bowlerCreditedId || '');
                      else if (b.dismissalType === 'caught') dismissalDesc = 'c ' + getPlayerName(b.fielderId || '') + ' b ' + getPlayerName(b.bowlerCreditedId || '');
                      else if (b.dismissalType === 'lbw') dismissalDesc = 'lbw b ' + getPlayerName(b.bowlerCreditedId || '');
                      else if (b.dismissalType === 'run_out') dismissalDesc = 'run out';
                      else if (b.dismissalType === 'stumped') dismissalDesc = 'st ' + getPlayerName(b.fielderId || '') + ' b ' + getPlayerName(b.bowlerCreditedId || '');
                      else dismissalDesc = b.dismissalType || 'out';
                    }

                    return (
                      <tr key={b.playerId} className="hover:bg-slate-900/30">
                        <td className="py-2.5 px-3 font-sans font-semibold text-white">
                          {getPlayerName(b.playerId)}
                        </td>
                        <td className="py-2.5 px-2 font-sans text-[11px] text-slate-400 truncate max-w-[140px]">
                          {dismissalDesc}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-amber-400">{b.runs}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{b.balls}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{b.fours}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{b.sixes}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{sr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Extras Row */}
            <div className="p-3 border-t border-slate-800 bg-[#070d1e] flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Extras:{' '}
                <span className="font-mono text-slate-300">
                  (w {currentInnings.extras.wides}, nb {currentInnings.extras.noballs}, b{' '}
                  {currentInnings.extras.byes}, lb {currentInnings.extras.legbyes})
                </span>
              </span>
              <span className="font-mono font-bold text-white">{currentInnings.extras.total}</span>
            </div>
          </div>

          {/* Bowling Table */}
          <div className="rounded-2xl bg-[#0a1228] border border-slate-800 overflow-hidden">
            <div className="p-3 bg-[#0d1630] border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Bowling • {getTeamName(currentInnings.bowlingTeamId)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-900/40">
                    <th className="py-2.5 px-3">Bowler</th>
                    <th className="py-2.5 px-2 text-right">O</th>
                    <th className="py-2.5 px-2 text-right">M</th>
                    <th className="py-2.5 px-2 text-right">R</th>
                    <th className="py-2.5 px-2 text-right">W</th>
                    <th className="py-2.5 px-3 text-right">ECON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {Object.values(currentInnings.bowlers).map((bw) => {
                    const ov = ScoringEngine.formatOvers(bw.balls);
                    const econ =
                      bw.balls > 0 ? (bw.runs / (bw.balls / 6)).toFixed(2) : '0.00';

                    return (
                      <tr key={bw.playerId} className="hover:bg-slate-900/30">
                        <td className="py-2.5 px-3 font-sans font-semibold text-white">
                          {getPlayerName(bw.playerId)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{ov}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{bw.maidens}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{bw.runs}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-amber-400">
                          {bw.wickets}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{econ}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fall of Wickets */}
          {currentInnings.fallOfWickets.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Fall of Wickets
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {currentInnings.fallOfWickets.map((fow, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-300"
                  >
                    <span className="font-bold text-amber-400">
                      {fow.runs}/{fow.wicketNumber}
                    </span>{' '}
                    <span className="text-slate-400 text-[11px]">
                      ({getPlayerName(fow.batterId)}, {fow.overStr} ov)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400">
          Innings details not yet available.
        </div>
      )}
    </div>
  );
};
