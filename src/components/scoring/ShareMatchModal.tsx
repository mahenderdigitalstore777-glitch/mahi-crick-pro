/**
 * Share Match Modal
 * Allows scorers to share live match link, copy Match Code, generate QR code,
 * and send pre-formatted match summary directly to WhatsApp.
 * Includes clear instructions for viewing on any phone or browser.
 */

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  X,
  MessageCircle,
  ExternalLink,
  Info,
  Radio,
  Smartphone,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Match, Innings } from '../../types/cricket';
import { ScoringEngine } from '../../services/scoringEngine';

interface ShareMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  teamAName: string;
  teamBName: string;
}

export const ShareMatchModal: React.FC<ShareMatchModalProps> = ({
  isOpen,
  onClose,
  match,
  teamAName,
  teamBName,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  const innNum = match.currentInningsNumber;
  const currentInn = match.innings[innNum];

  // Base URL calculation
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : '';
  const shareUrl = `${baseUrl}?liveMatchId=${match.id}&view=spectator`;

  // Score summary
  const scoreText = currentInn
    ? `${currentInn.totalRuns}/${currentInn.wickets} (${ScoringEngine.formatOvers(currentInn.legalDeliveries)} ov)`
    : 'Live';

  // Pre-formatted share text
  const shareMessage = `🏏 *LIVE CRICKET SCORECARD*\n` +
    `*${match.title}*\n` +
    `📊 Current Score: *${scoreText}*\n` +
    `🔑 Match Code: *${match.id}*\n\n` +
    `📱 Watch Ball-by-Ball Live Score & Commentary:\n${shareUrl}`;

  // Generate QR Code on open
  useEffect(() => {
    if (isOpen && shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code error:', err));
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(match.id);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Live Match: ${match.title}`,
          text: shareMessage,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#0a1226] border border-amber-400/40 rounded-3xl p-5 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Share Live Match</h3>
              <p className="text-[11px] text-slate-400">लाइव स्कोर दोस्तों के साथ शेयर करें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Match Info Chip */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                LIVE BROADCAST ACTIVE
              </span>
            </div>
            <div className="text-sm font-bold text-white">{match.title}</div>
            <div className="text-xs text-slate-400 font-mono">
              Score: <span className="text-amber-400 font-bold">{scoreText}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              Cloud Synced
            </span>
          </div>
        </div>

        {/* Tab Switcher: Share Link / QR Code */}
        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'link'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Link & WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Tab 1: Link & Code */}
        {activeTab === 'link' && (
          <div className="space-y-3.5">
            {/* 1. Direct WhatsApp Share (High Priority) */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Share Directly to WhatsApp</span>
            </button>

            {/* 2. Match Code Box */}
            <div className="p-3.5 rounded-2xl bg-[#0e172e] border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  Match Code (किसी भी फोन में डालने के लिए)
                </span>
                <span className="text-[10px] text-amber-400 font-mono">100% Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 px-3 py-2 rounded-xl text-white font-mono font-bold text-xs truncate border border-slate-800">
                  {match.id}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Spectator अपने फोन पर '🔴 Live Match Dekhein' में यह कोड डालकर मैच देख सकते हैं।
              </p>
            </div>

            {/* 3. Full Web URL */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Full Live Web Link:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-950 px-3 py-2 rounded-xl text-slate-300 font-mono text-xs truncate border border-slate-800 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 border border-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Native Share button */}
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>More Share Options...</span>
            </button>
          </div>
        )}

        {/* Tab 2: QR Code */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center justify-center p-3 space-y-3 bg-slate-950/70 rounded-2xl border border-slate-800">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <img
                  src={qrDataUrl}
                  alt="Live Match QR Code"
                  className="w-48 h-48 rounded-lg"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
            <p className="text-xs text-slate-300 text-center font-medium">
              Ground पर बैठे दर्शक अपने फोन के कैमरा से यह QR Code स्कैन करके तुरंत लाइव स्कोर देख सकते हैं।
            </p>
          </div>
        )}

        {/* Helpful Explanation Note: Why links might fail on other phones */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>फ़ोन पर लिंक खोलने संबंधी जानकारी (Help Guide)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            • यदि आप अभी <strong>Localhost / Private Sandbox</strong> में हैं, तो लिंक सिर्फ आपके डिवाइस पर चलता है। किसी दूसरे के फोन पर मैच देखने के लिए वे माही क्रिक प्रो में <strong>Match Code</strong> डालें।
          </p>
          <p className="text-[11px] leading-relaxed text-slate-300">
            • जब ऐप लाइव इंटरनेट डोमेन पर लाइव होगी, तो लिंक हर किसी के WhatsApp और ब्राउज़र में 1-क्लिक में खुलेगा!
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
