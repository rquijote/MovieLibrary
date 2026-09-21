import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { AccountListSummary, AccountListsResponse, StatusDto } from '../../types/media';
import { CreateListForm } from '../lists/CreateListForm';

interface ListPickerModalProps {
  isOpen: boolean;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  onNotify: (kind: 'success' | 'error', message: string) => void;
  onClose: () => void;
}

interface ListItemStatusResponse {
  id: number;
  item_present: boolean;
}

export function ListPickerModal({
  isOpen,
  mediaId,
  mediaType,
  onNotify,
  onClose,
}: ListPickerModalProps) {
  const [isListsLoading, setIsListsLoading] = useState(false);
  const [accountLists, setAccountLists] = useState<AccountListSummary[]>([]);
  const [listItemPresenceById, setListItemPresenceById] = useState<Record<number, boolean>>({}); // Identifies that the item is already in a list, and will be unclickable.
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]); // The selected lists within a given toggle.
  const [hasLoadedLists, setHasLoadedLists] = useState(false);
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const filteredAccountLists = useMemo(() => {
    const term = listSearchTerm.trim().toLowerCase();
    if (!term) {
      return accountLists;
    }

    return accountLists.filter((list) => list.name.toLowerCase().includes(term));
  }, [accountLists, listSearchTerm]);

  const loadListItemPresence = async (lists: AccountListSummary[]) => {
    if (lists.length === 0) {
      setListItemPresenceById({});
      return;
    }

    // Loads all lists and identifies if media is already inside these lists. 
    const statuses = await Promise.all(
      lists.map(async (list) => {
        try {
          const itemStatus = await apiGet<ListItemStatusResponse>(
            `/api/Lists/${list.id}/item_status?media_type=${mediaType}&media_id=${mediaId}`,
          );

          return [list.id, itemStatus.item_present] as const;
        } catch {
          // Treat per-list failures as "not present" so one bad request doesn't block the whole picker.
          return [list.id, false] as const;
        }
      }),
    );

    const nextPresence = Object.fromEntries(statuses); // Key = list id, value = bool if item already exists in list.
    setListItemPresenceById(nextPresence);
    // If refresh shows a list already contains this media item, drop it from pending manual selections.
    setSelectedListIds((current) => current.filter((id) => !nextPresence[id]));
  };

  const loadAccountLists = async (force: boolean) => {
    if (isListsLoading) {
      return;
    }

    // Cache after first successful load; force=true is used after create/save refreshes.
    if (!force && hasLoadedLists) {
      return;
    }

    try {
      setIsListsLoading(true);
      const result = await apiGet<AccountListsResponse>('/api/Account/lists?page=1');
      const sortedLists = [...result.results].sort((left, right) => right.id - left.id);
      setAccountLists(sortedLists);
      await loadListItemPresence(sortedLists);
      setHasLoadedLists(true);
    } catch (error) {
      onNotify('error', error instanceof Error ? error.message : 'Failed to load account lists.');
    } finally {
      setIsListsLoading(false);
    }
  };

  const handleCreateList = async (name: string, description: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      onNotify('error', 'List name is required.');
      return;
    }

    try {
      const result = await apiPost<StatusDto>('/api/Lists', {
        name: trimmedName,
        description: description.trim() || null,
        language: 'en',
      });

      onNotify('success', result.status_message ?? 'List created.');
      await loadAccountLists(true);
    } catch (error) {
      onNotify('error', error instanceof Error ? error.message : 'Failed to create list.');
    }
  };

  // Can save to multiple lists by toggling them.
  const handleSaveSelectedLists = async () => {
    if (selectedListIds.length === 0) {
      onNotify('error', 'Select at least one list.');
      return;
    }

    try {
      for (const listId of selectedListIds) {
        await apiPost<StatusDto>(`/api/Lists/${listId}/add_movie`, mediaId);
      }

      onNotify(
        'success',
        selectedListIds.length === 1 ? 'Added to 1 list.' : `Added to ${selectedListIds.length} lists.`,
      );

      setSelectedListIds([]);
      // Refresh cache after save so list counts/presence are up to date.
      await loadAccountLists(true);
      handleClose();
    } catch (error) {
      onNotify('error', error instanceof Error ? error.message : 'List update failed.');
    }
  };

  const toggleListSelection = (listId: number) => {
    if (listItemPresenceById[listId]) {
      return;
    }

    setSelectedListIds((current) =>
      current.includes(listId) ? current.filter((id) => id !== listId) : [...current, listId],
    );
  };

  const handleClose = () => {
    // Reset transient modal UI state so each open starts clean.
    setSelectedListIds([]);
    setListSearchTerm('');
    setIsCreateListOpen(false);
    setNewListName('');
    setNewListDescription('');
    onClose();
  };

  const handleCreateListSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleCreateList(newListName, newListDescription);
    setNewListName('');
    setNewListDescription('');
  };

  const handleModalMount = (node: HTMLDivElement | null) => {
    // Runs once when modal DOM mounts; kicks off initial load without effect-based state sync.
    if (!node || isListsLoading || hasLoadedLists) {
      return;
    }

    void loadAccountLists(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="list-picker-overlay" role="presentation" onClick={handleClose}>
      <div
        className="list-picker-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        ref={handleModalMount}
      >
        <div className="list-picker-header">
          <h3>Add to list</h3>
          <button type="button" onClick={handleClose}>
            Close
          </button>
        </div>

        <div className="list-picker-toolbar">
          <button type="button" onClick={() => setIsCreateListOpen((current) => !current)}>
            Create new list
          </button>
          <input
            type="text"
            placeholder="Search lists"
            value={listSearchTerm}
            onChange={(event) => setListSearchTerm(event.target.value)}
          />
        </div>

        {isCreateListOpen ? (
          <CreateListForm
            newListName={newListName}
            newListDescription={newListDescription}
            onNewListNameChange={setNewListName}
            onNewListDescriptionChange={setNewListDescription}
            onSubmit={(event) => void handleCreateListSubmit(event)}
          />
        ) : null}

        {isListsLoading ? <p>Loading lists...</p> : null}

        {!isListsLoading && accountLists.length === 0 ? <p>No custom lists found.</p> : null}
        {!isListsLoading && accountLists.length > 0 && filteredAccountLists.length === 0 ? <p>No matching lists found.</p> : null}

        {!isListsLoading
          ? filteredAccountLists.map((list) => (
              <div
                key={list.id}
                className={`list-picker-item list-picker-selectable ${selectedListIds.includes(list.id) ? 'selected' : ''} ${listItemPresenceById[list.id] ? 'disabled' : ''}`}
                onClick={() => toggleListSelection(list.id)}
              >
                <div className="list-item-row">
                  <strong>{list.name}</strong>
                  <div className="list-item-meta">
                    <span>
                      {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                    </span>
                    <span>{listItemPresenceById[list.id] || selectedListIds.includes(list.id) ? '✓' : ''}</span>
                  </div>
                </div>
              </div>
            ))
          : null}

        <div className="list-picker-save-actions">
          <button type="button" disabled={selectedListIds.length === 0} onClick={() => void handleSaveSelectedLists()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
