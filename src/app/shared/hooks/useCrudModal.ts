import { useState } from 'react';

export function useCrudModal<TFormValues>(emptyValues: TFormValues) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<TFormValues>(emptyValues);

  const openCreate = (values: TFormValues = emptyValues) => {
    setEditingId(null);
    setFormError(null);
    setFormValues(values);
    setIsModalOpen(true);
  };

  const openEdit = (id: number, values: TFormValues) => {
    setEditingId(id);
    setFormError(null);
    setFormValues(values);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editingId,
    isSaving,
    setIsSaving,
    formError,
    setFormError,
    formValues,
    setFormValues,
    openCreate,
    openEdit,
    closeModal,
  };
}
