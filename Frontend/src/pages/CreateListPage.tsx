import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../lib/api';
import type { StatusDto } from '../types/media';

export function CreateListPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setStatusMessage('Name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const result = await apiPost<StatusDto>('/api/Lists', {
        name: trimmedName,
        description: description.trim() || null,
        language: 'en',
      });

      setStatusMessage(result.status_message ?? 'List created.');
      navigate('/library');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to create list.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="create-list-page">
      <h1>New List</h1>

      <form className="list-create-form" onSubmit={(event) => void handleSubmit(event)}>
        <input type="text" placeholder="List name" value={name} onChange={(event) => setName(event.target.value)} />
        <textarea
          placeholder="Description (optional)"
          value={description}
          rows={5}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="list-create-actions">
          <button type="submit" disabled={isSaving}>{isSaving ? 'Creating...' : 'Create List'}</button>
          <button type="button" onClick={() => navigate('/library')}>Cancel</button>
        </div>
      </form>

      {statusMessage ? <p>{statusMessage}</p> : null}
    </section>
  );
}
