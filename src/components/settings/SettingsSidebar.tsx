import { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { PluginManager } from './PluginManager';

export function SettingsSidebar() {
  const [showPluginOverlay, setShowPluginOverlay] = useState(false);
  const debugMode = useUIStore((state) => state.debugMode);
  const toggleDebugMode = useUIStore((state) => state.toggleDebugMode);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Plugins Button */}
        <button
          onClick={() => setShowPluginOverlay(true)}
          className="
            flex items-center justify-center gap-2
            px-4 py-3 rounded-lg
            bg-slate-700 hover:bg-slate-600
            text-white font-medium
            transition-all
          "
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Plugins</span>
        </button>

        {/* Debug Mode Toggle */}
        <button
          onClick={toggleDebugMode}
          className={`
            flex items-center justify-between gap-2
            px-4 py-3 rounded-lg
            font-medium
            transition-all
            ${debugMode ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}
          `}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Debug</span>
          </div>
          <div
            className={`
              w-10 h-6 rounded-full flex items-center transition-colors
              ${debugMode ? 'bg-orange-400' : 'bg-slate-600'}
            `}
          >
            <div
              className={`
                w-5 h-5 rounded-full bg-white transition-transform
                ${debugMode ? 'translate-x-5' : 'translate-x-0.5'}
              `}
            />
          </div>
        </button>
      </div>

      {/* Plugin Overlay */}
      {showPluginOverlay && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          onClick={() => setShowPluginOverlay(false)}
        >
          <div
            className="bg-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Plugin Management</h2>
              <button
                onClick={() => setShowPluginOverlay(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Plugin Manager Content */}
            <PluginManager />
          </div>
        </div>
      )}
    </>
  );
}
