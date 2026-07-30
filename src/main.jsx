import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Preferences } from '@capacitor/preferences'
import './index.css'
import App from './App.jsx'

// window.storage — backed by Capacitor Preferences, which is durable native storage
// (UserDefaults/SharedPreferences) on iOS/Android and automatically falls back to
// localStorage when running as a regular website.
window.storage = {
  get: async (key) => {
    const { value } = await Preferences.get({ key });
    return { value };
  },
  set: (key, value) => Preferences.set({ key, value }),
  delete: (key) => Preferences.remove({ key }),
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
