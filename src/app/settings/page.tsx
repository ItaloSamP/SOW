'use client';

import './SettingsPage.css';

export default function SettingsPage() {
  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Settings</h1>
        <p className="settings-subtitle">Configure your SOW workspace.</p>
      </header>

      <div className="settings-sections">
        <section className="settings-section">
          <h2>General</h2>
          <div className="settings-row">
            <div>
              <strong>Language</strong>
              <p>Interface language</p>
            </div>
            <select className="settings-select">
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h2>AI Integration</h2>
          <p className="settings-hint">
            Your API key is stored locally in IndexedDB — it never leaves your device.
          </p>
          <div className="settings-row">
            <div>
              <strong>Provider</strong>
              <p>AI service for note refinement, flashcard generation, and chat</p>
            </div>
            <select className="settings-select">
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <strong>API Key</strong>
              <p>Bring Your Own Key (BYOK)</p>
            </div>
            <input
              type="password"
              className="settings-input"
              placeholder="Paste your API key..."
            />
          </div>
          <div className="settings-row">
            <button className="settings-btn primary" disabled>
              Save & Test Connection
            </button>
          </div>
          <p className="settings-hint coming-soon">AI features coming in Phase 4.</p>
        </section>

        <section className="settings-section">
          <h2>GitHub</h2>
          <p className="settings-hint">
            Connect via Personal Access Token (PAT) for issues, commits, and PR alerts.
          </p>
          <div className="settings-row">
            <div>
              <strong>Personal Access Token</strong>
              <p>Requires <code>repo</code> and <code>notifications</code> scopes</p>
            </div>
            <input
              type="password"
              className="settings-input"
              placeholder="ghp_..."
            />
          </div>
          <div className="settings-row">
            <button className="settings-btn primary" disabled>
              Connect GitHub
            </button>
          </div>
          <p className="settings-hint coming-soon">GitHub features coming in Phase 6.</p>
        </section>

        <section className="settings-section">
          <h2>About</h2>
          <div className="settings-row">
            <span className="settings-label">Version</span>
            <span className="settings-value">0.1.0 — Phase 1</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Storage</span>
            <span className="settings-value">IndexedDB (local, offline-first)</span>
          </div>
        </section>
      </div>
    </div>
  );
}
