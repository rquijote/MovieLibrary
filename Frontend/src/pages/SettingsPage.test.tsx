import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SettingsPage } from './SettingsPage';

vi.mock('../lib/genrePreferences', () => ({
  readGenrePreferences: () => ({ movies: [28, 12, 16, 35, 80, 99, 18], tv: [18] }),
  saveGenrePreferences: vi.fn(),
}));

describe('settings page', () => {
  it('renders genre editing, explicit save and reset actions, and the CSV importer on one page', () => {
    const markup = renderToStaticMarkup(<SettingsPage />);

    expect(markup).toContain('<h1 id="settings-title">Settings</h1>');
    expect(markup).toContain('Genre preferences');
    expect(markup).toContain('Save preferences');
    expect(markup).toContain('Reset changes');
    expect(markup).toContain('Remove all');
    expect(markup).toContain('7 selected');
    expect(markup).toContain('Select as many genres as you like');
    expect(markup).not.toContain('disabled=""');
    expect(markup).toContain('Import Letterboxd CSV');
    expect(markup).toContain('letterboxd-import-types');
    expect(markup).not.toContain('Not imported:');
    expect(markup).toContain('type="file"');
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('saved for your account on this browser');
    expect(markup).not.toContain('role="dialog"');
    const controls = markup.match(/<(?:form|input|select|textarea)\b[^>]*>/g) ?? [];
    expect(controls.length).toBeGreaterThan(0);
    for (const control of controls) {
      expect(control).toContain('autoComplete="off"');
    }
  });
});
