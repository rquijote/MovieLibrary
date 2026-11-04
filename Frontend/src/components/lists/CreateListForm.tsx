import type { FormEvent } from 'react';

interface CreateListFormProps {
  newListName: string;
  newListDescription: string;
  onNewListNameChange: (value: string) => void;
  onNewListDescriptionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function CreateListForm({
  newListName,
  newListDescription,
  onNewListNameChange,
  onNewListDescriptionChange,
  onSubmit,
}: CreateListFormProps) {
  return (
    <form className="list-create-form" autoComplete="off" onSubmit={onSubmit}>
      <h4>Create new list</h4>
      <input
        type="text"
        autoComplete="off"
        placeholder="List name"
        value={newListName}
        onChange={(event) => onNewListNameChange(event.target.value)}
      />
      <input
        type="text"
        autoComplete="off"
        placeholder="Description (optional)"
        value={newListDescription}
        onChange={(event) => onNewListDescriptionChange(event.target.value)}
      />
      <button type="submit">Create</button>
    </form>
  );
}
