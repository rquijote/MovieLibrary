import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ListEditorPage } from './ListEditorPage';

vi.mock('../lib/api', () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiUpdateList: vi.fn() }));

describe('new list editor', () => {
  it('uses the simplified title and retains description actions', () => {
    const markup = renderToStaticMarkup(<MemoryRouter><ListEditorPage /></MemoryRouter>);
    expect(markup).toContain('<h1>New list</h1>');
    expect(markup).toContain('list-heading-divider');
    expect(markup).toContain('list-description-panel');
    expect(markup).toContain('>Save</button>');
    expect(markup).toContain('>Cancel</button>');
    expect(markup).not.toContain('Create a list');
  });
});
