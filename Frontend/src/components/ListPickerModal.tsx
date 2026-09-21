import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { AccountListSummary } from '../types/media';
import { CreateListForm } from './CreateListForm';

interface ListPickerModalProps {
  isOpen: boolean;
  isListsLoading: boolean;
  accountLists: AccountListSummary[];
  listItemPresenceById: Record<number, boolean>;
  selectedListIds: number[];
  setSelectedListIds: React.Dispatch<React.SetStateAction<number[]>>;
  newListName: string;
  setNewListName: (value: string) => void;
  newListDescription: string;
  setNewListDescription: (value: string) => void;
  onCreateListSubmit: (event: FormEvent) => Promise<void>;
  onSave: () => Promise<void>;
  onClose: () => void;
}

export function ListPickerModal({
  isOpen,
  isListsLoading,
  accountLists,
  listItemPresenceById,
  selectedListIds,
  setSelectedListIds,
  newListName,
  setNewListName,
  newListDescription,
  setNewListDescription,
  onCreateListSubmit,
  onSave,
  onClose,
}: ListPickerModalProps) {
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);

  const filteredAccountLists = useMemo(() => {
    const term = listSearchTerm.trim().toLowerCase();
    if (!term) {
      return accountLists;
    }

    return accountLists.filter((list) => list.name.toLowerCase().includes(term));
  }, [accountLists, listSearchTerm]);

  const toggleListSelection = (listId: number) => {
    if (listItemPresenceById[listId]) {
      return;
    }

    setSelectedListIds((current) =>
      current.includes(listId) ? current.filter((id) => id !== listId) : [...current, listId],
    );
  };

  const handleClose = () => {
    setSelectedListIds([]);
    setListSearchTerm('');
    setIsCreateListOpen(false);
    onClose();
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
            onSubmit={(event) => void onCreateListSubmit(event)}
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
          <button type="button" disabled={selectedListIds.length === 0} onClick={() => void onSave()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
