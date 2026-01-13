import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Plugin System
import { pluginRegistry } from './core/plugin/PluginRegistry';
import { getPluginDefinitions } from './config/plugins';

/**
 * Bootstrap: Register all plugins
 */
async function bootstrap() {
  console.log('🚀 Starting Sport-Scoreboard...');

  // Get plugin definitions
  const pluginDefinitions = getPluginDefinitions();
  console.log(`📦 Registering ${pluginDefinitions.length} plugins`);

  // Register all plugins
  for (const { manifest, loader } of pluginDefinitions) {
    pluginRegistry.register(manifest, loader);
  }

  console.log('✅ All plugins registered');

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
