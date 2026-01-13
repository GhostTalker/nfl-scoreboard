import type { PluginManifest, PluginLoader } from '../core/plugin/types';

/**
 * Plugin Definitions
 *
 * To add a new plugin:
 * 1. Create plugin module in src/plugins/<name>/
 * 2. Add entry here with manifest + loader
 * 3. Done! App will auto-discover it
 */

export interface PluginDefinition {
  manifest: PluginManifest;
  loader: PluginLoader;
}

export const PLUGIN_DEFINITIONS: PluginDefinition[] = [
  // NFL Plugin
  {
    manifest: {
      id: 'nfl',
      version: '1.0.0',
      name: 'NFL Plugin',
      displayName: 'NFL',
      description: 'American Football',
      icon: '/title/nfl-logo.png',
      hasStats: true,
      celebrationTypes: ['touchdown', 'fieldgoal', 'interception', 'sack', 'fumble', 'safety'],
      competitions: ['nfl'],
      coreVersion: '^3.0.0',
    },
    loader: () => import('../plugins/nfl'),
  },

  // Bundesliga Plugin
  {
    manifest: {
      id: 'bundesliga',
      version: '1.0.0',
      name: 'Bundesliga Plugin',
      displayName: 'Bundesliga',
      description: 'Deutscher Fußball',
      icon: '/title/bundesliga-logo.png',
      hasStats: false,
      celebrationTypes: ['goal', 'penalty', 'own_goal', 'red_card', 'yellow_red_card'],
      competitions: ['bundesliga', 'dfb-pokal'],
      coreVersion: '^3.0.0',
    },
    loader: () => import('../plugins/bundesliga'),
  },

  // Future plugins go here...
  // {
  //   manifest: { id: 'premier-league', ... },
  //   loader: () => import('../plugins/premier-league'),
  // },
];

/**
 * Type-safe SportType - auto-generated from plugin definitions
 */
export type SportType = typeof PLUGIN_DEFINITIONS[number]['manifest']['id'];
