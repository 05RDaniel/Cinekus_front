import { FormEvent, useCallback } from 'react';
import { AdminUser } from '../../../../features/users/models/user.model';
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../../../../features/users/services/users.service';
import { AdminTableStates } from '../../../../shared/components/crud/AdminTableStates';
import { CrudModal } from '../../../../shared/components/crud/CrudModal';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { useCrudModal } from '../../../../shared/hooks/useCrudModal';
import { useInitialLoad } from '../../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../../lang';
import { AdminUserForm, emptyUserForm, UserFormValues } from './AdminUserForm';

export function AdminUsersPage() {
  const texts = usePageTexts('admin-users');
  const loadUsers = useCallback(() => getUsers(), []);
  const { rows, isLoading, hasLoadError, reload, setHasLoadError } = useInitialLoad<AdminUser[]>(loadUsers, []);

  const {
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
  } = useCrudModal<UserFormValues>(emptyUserForm);

  const errorMessages = texts.modal.errors;

  const openCreateModal = () => openCreate();

  const openEditModal = (user: AdminUser) =>
    openEdit(user.id, {
      username: user.username ?? '',
      email: user.email ?? '',
      password: '',
      rol: user.rol === 'ADMIN' ? 'ADMIN' : 'USER',
    });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formValues.username.trim() || !formValues.email.trim()) {
      setFormError(errorMessages.missingFields);
      return;
    }
    if (!editingId && !formValues.password) {
      setFormError(errorMessages.missingFields);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      if (editingId) {
        const payload: { username: string; email: string; rol: 'ADMIN' | 'USER'; password?: string } = {
          username: formValues.username.trim(),
          email: formValues.email.trim(),
          rol: formValues.rol,
        };
        if (formValues.password) payload.password = formValues.password;
        await updateUser(editingId, payload);
      } else {
        await createUser({
          username: formValues.username.trim(),
          email: formValues.email.trim(),
          password: formValues.password,
          rol: formValues.rol,
        });
      }
      await reload();
      setIsModalOpen(false);
    } catch (error) {
      setFormError(mapApiError(error, errorMessages));
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (user: AdminUser) => {
    if (!window.confirm(texts.table.confirmDelete)) return;
    try {
      await deleteUser(user.id);
      await reload();
    } catch {
      setHasLoadError(true);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__inner">
        <AdminPageHeader
          backTo="/admin/home"
          title={texts.title}
          action={
            <button type="button" className="admin-btn" onClick={openCreateModal}>
              {texts.addButton}
            </button>
          }
        />

        <div className="admin-table-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{texts.table.columns.id}</th>
                <th>{texts.table.columns.username}</th>
                <th>{texts.table.columns.email}</th>
                <th>{texts.table.columns.role}</th>
                <th>{texts.table.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              <AdminTableStates
                colSpan={5}
                isLoading={isLoading}
                hasLoadError={hasLoadError}
                isEmpty={rows.length === 0}
                loadingText={texts.table.states.loading}
                errorText={texts.table.states.loadError}
                emptyText={texts.table.states.empty}
              >
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.username}</td>
                    <td>{row.email}</td>
                    <td>{row.rol}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openEditModal(row)}>
                          {texts.table.actions.edit}
                        </button>
                        <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => void onDelete(row)}>
                          {texts.table.actions.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </AdminTableStates>
            </tbody>
          </table>
        </div>

        <CrudModal
          isOpen={isModalOpen}
          title={editingId ? texts.modal.titleEdit : texts.modal.titleCreate}
          onClose={closeModal}
          closeAriaLabel={texts.modal.closeAriaLabel}
          onSubmit={onSubmit}
          isSaving={isSaving}
          error={formError}
          cancelLabel={texts.modal.buttons.cancel}
          submitLabel={editingId ? texts.modal.buttons.saveChanges : texts.modal.buttons.create}
          savingLabel={texts.modal.buttons.saving}
        >
          <AdminUserForm
            values={formValues}
            onChange={setFormValues}
            isEditing={!!editingId}
            labels={texts.modal.fields}
          />
        </CrudModal>
      </div>
    </section>
  );
}
