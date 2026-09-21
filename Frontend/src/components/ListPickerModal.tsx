import type { FormEvent } from 'react';
import type { AccountListSummary } from '../types/media';
import { CreateListForm } from './CreateListForm';

interface ListPickerModalProps {
  isOpen: boolean;
  isListsLoading: boolean;
  accountLists: AccountListSummary[];
  filteredAccountLists: AccountListSummary[];
  listItemPresenceById: Record<number, boolean>;
  selectedListIds: number[];
  isCreateListOpen: boolean;
  listSearchTerm: string;
  newListName: string;
  newListDescription: string;
  onClose: () => void;
  onToggleCreateList: () => void;
  onSearchChange: (value: string) => void;
  onNewListNameChange: (value: string) => void;
  onNewListDescriptionChange: (value: string) => void;
  onCreateListSubmit: (event: FormEvent) => Promise<void>;
  onToggleListSelection: (listId: number) => void;
  onSave: () => Promise<void>;
}

export function ListPickerModal({
  isOpen,
  isListsLoading,
  accountLists,
  filteredAccountLists,
  listItemPresenceById,
  selectedListIds,
  isCreateListOpen,
  listSearchTerm,
  newListName,
  newListDescription,
  onClose,
  onToggleCreateList,
  onSearchChange,
  onNewListNameChange,
  onNewListDescriptionChange,
  onCreateListSubmit,
  onToggleListSelection,
  onSave,
}: ListPickerModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="list-picker-overlay" role="presentation" onClick={onClose}>
      <div className="list-picker-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="list-picker-header">
          <h3>Add to list</h3>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="list-picker-toolbar">
          <button type="button" onClick={onToggleCreateList}>
            Create new list
          </button>
          <input
            type="text"
            placeholder="Search lists"
            value={listSearchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        {isCreateListOpen ? (
          <CreateListForm
            newListName={newListName}
            newListDescription={newListDescription}
            onNewListNameChange={onNewListNameChange}
            onNewListDescriptionChange={onNewListDescriptionChange}
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
                onClick={() => onToggleListSelection(list.id)}
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
