import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Plugin System
import { pluginRegistry } from './core/plugin/PluginRegistry';
import { PLUGIN_DEFINITIONS } from './config/plugins';

/**
 * Bootstrap: Register all plugins
 */
async function bootstrap() {
  // Register plugins
  for (const { manifest, loader } of PLUGIN_DEFINITIONS) {
    pluginRegistry.register(manifest, loader);
  }

  // Render app
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Start app
bootstrap().catch(error => {
  console.error('❌ Bootstrap failed:', error);
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-center: height: 100vh; background: #0a1628; color: white; font-family: sans-serif;">
      <div style="text-align: center;">
        <h1>❌ Failed to start Sport-Scoreboard</h1>
        <p>${error.message}</p>
      </div>
    </div>
  `;
});
