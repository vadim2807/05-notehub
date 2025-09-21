import { useState } from 'react';
import { type NoteTag } from '../../types/note';
import css from './NoteForm.module.css';

interface NoteFormProps {
  onSubmit: (noteData: { title: string; content: string; tag: NoteTag }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  content: string;
  tag: NoteTag;
}

interface FormErrors {
  title?: string;
  content?: string;
}

function NoteForm({ onSubmit, onCancel, isLoading = false }: NoteFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    tag: 'Todo'
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 50) {
      newErrors.title = 'Title must be at most 50 characters';
    }

    if (formData.content.length > 500) {
      newErrors.content = 'Content must be at most 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit({
      title: formData.title.trim(),
      content: formData.content,
      tag: formData.tag
    });
  };

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          value={formData.title}
          onChange={handleInputChange('title')}
          style={{
            borderColor: errors.title ? '#dc3545' : '#ced4da'
          }}
          placeholder="Enter note title"
        />
        {errors.title && (
          <span className={css.error}>
            {errors.title}
          </span>
        )}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          className={css.textarea}
          value={formData.content}
          onChange={handleInputChange('content')}
          rows={4}
          style={{
            borderColor: errors.content ? '#dc3545' : '#ced4da'
          }}
          placeholder="Enter note content"
        />
        {errors.content && (
          <span className={css.error}>
            {errors.content}
          </span>
        )}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={formData.tag}
          onChange={handleInputChange('tag')}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create note'}
        </button>
      </div>
    </form>
  );
}

export default NoteForm;