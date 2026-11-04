import { GenrePreferencesForm } from '../components/header/GenrePreferencesForm';
import { LetterboxdImport } from '../components/header/LetterboxdImport';
import './SettingsPage.css';

export function SettingsPage() {
  return <section className="settings-page" aria-labelledby="settings-title">
    <header>
      <h1 id="settings-title">Settings</h1>
      <p>Personalize your genres and bring your Letterboxd library with you.</p>
    </header>
    <div className="settings-panel">
      <GenrePreferencesForm />
    </div>
    <div className="settings-panel">
      <LetterboxdImport />
    </div>
  </section>;
}
