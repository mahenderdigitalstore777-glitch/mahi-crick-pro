/**
 * Screen 15: Settings Screen
 * Preferences, in-app automated rules test suite runner, backup & restore, and Android APK deployment guide
 */

import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Vibrate,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  PlayCircle,
  Smartphone,
  Info,
  Check,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { AppSettings, MatchFormat } from '../../types/cricket';
import { storageService } from '../../services/storage';
import { ScoringEngine } from '../../services/scoringEngine';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onRefreshAllData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onRefreshAllData,
}) => {
  const [testResults, setTestResults] = useState<{ name: string; passed: boolean; message: string }[] | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleToggleSound = () => {
    onUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleToggleHaptic = () => {
    onUpdateSettings({ hapticEnabled: !settings.hapticEnabled });
  };

  const handleFormatChange = (fmt: MatchFormat) => {
    let ov = 20;
    if (fmt === 'T5') ov = 5;
    else if (fmt === 'T10') ov = 10;
    else if (fmt === 'T15') ov = 15;
    else if (fmt === 'T20') ov = 20;
    else if (fmt === 'ODI') ov = 50;
    onUpdateSettings({ defaultFormat: fmt, defaultOvers: ov });
  };

  // Run in-app automated tests
  const handleRunTests = () => {
    const results = ScoringEngine.runAutomatedTests();
    setTestResults(results);
  };

  // Export JSON
  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mahi-crick-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importBackupJSON(content);
      if (res.success) {
        setImportStatus('Backup restored successfully!');
        onRefreshAllData();
      } else {
        setImportStatus(`Restore failed: ${res.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Reset demo
  const handleResetDefaults = () => {
    storageService.resetToDefaults();
    setResetConfirm(false);
    onRefreshAllData();
  };

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-5 pb-24 select-none">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          Application Settings
        </h2>
        <p className="text-xs text-slate-400">
          Scoring configurations, local database backup, and Android optimization
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-4 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Scoring & Audio Preferences
        </h3>

        {/* Sound FX */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-sm font-semibold text-white block">Synthesized Audio FX</span>
            <span className="text-xs text-slate-400">
              Web Audio chimes for boundaries (4s & 6s), wickets, and button clicks
            </span>
          </div>
          <button
            onClick={handleToggleSound}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.soundEnabled ? 'bg-amber-400' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                settings.soundEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Haptic Feedback */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-sm font-semibold text-white block">Haptic Vibration</span>
            <span className="text-xs text-slate-400">
              Tactile vibration response on delivery entry and wicket falls
            </span>
          </div>
          <button
            onClick={handleToggleHaptic}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.hapticEnabled ? 'bg-amber-400' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                settings.hapticEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Default Format */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Default Match Format Preset
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(['T5', 'T10', 'T15', 'T20', 'ODI'] as MatchFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleFormatChange(fmt)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  settings.defaultFormat === fmt
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Automated Cricket Rules Test Suite */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1228] border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-amber-400" />
              Automated Scoring Test Suite
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify legal deliveries, wide ball rules, strike rotation, target chase, and undo
            </p>
          </div>
          <button
            onClick={handleRunTests}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md"
          >
            Run Tests
          </button>
        </div>

        {testResults && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{t.name}</span>
                  <span className="text-[11px] text-slate-400">{t.message}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    t.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {t.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Management & SQLite Backup */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            Local Data Management & Backup
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mahi Crick Pro stores all records locally. Export regular backups to prevent data loss.
          </p>
        </div>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-white text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-400 text-white text-xs font-bold transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Restore From File (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Reset to initial realistic IPL squads</span>
          <button
            onClick={() => setResetConfirm(true)}
            className="text-xs text-rose-400 hover:underline font-semibold"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* Android & APK Guide Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Android PWA & APK Installation</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Mahi Crick Pro is built with zero-latency local caching. On your Android smartphone or tablet:
        </p>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>Open the Chrome menu (three dots) on your Android device.</li>
          <li>Tap <strong className="text-white">&ldquo;Add to Home screen&rdquo;</strong> or <strong className="text-white">&ldquo;Install app&rdquo;</strong>.</li>
          <li>It installs as a standalone Android application with offline caching and native app drawer icon!</li>
        </ul>
      </div>

      {/* About Box */}
      <div className="p-4 rounded-2xl bg-[#070d1e] border border-slate-800/80 text-center space-y-1">
        <h4 className="text-sm font-bold text-white">Mahi Crick Pro</h4>
        <p className="text-xs text-amber-400 font-semibold">Version 1.0.0 Pro • Offline Release</p>
        <p className="text-[11px] text-slate-400">
          Dedicated to cricket lovers and scorers worldwide. Zero tracking • 100% Offline.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setResetConfirm(false)} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-[#0a1228] border border-rose-500/40 rounded-2xl p-5 z-10 text-center space-y-3">
            <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Reset All Records?</h3>
            <p className="text-xs text-slate-300">
              This will restore CSK, MI, RCB squads and reset custom matches to original defaults.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
