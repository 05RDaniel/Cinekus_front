import { FormEvent, useCallback } from 'react';
import {
  clampDimension,
  createSeatGrid,
  gridFromRoomSeats,
  MAX_ROOM_COLS,
  MAX_ROOM_ROWS,
  Room,
  seatsFromGrid,
} from '../../../../features/rooms/models/room.model';
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRooms,
  updateRoom,
} from '../../../../features/rooms/services/rooms.service';
import { AdminTableStates } from '../../../../shared/components/crud/AdminTableStates';
import { CrudModal } from '../../../../shared/components/crud/CrudModal';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { useCrudModal } from '../../../../shared/hooks/useCrudModal';
import { useInitialLoad } from '../../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../../lang';
import { AdminRoomForm, emptyRoomForm, RoomFormValues } from './AdminRoomForm';

export function AdminRoomsPage() {
  const texts = usePageTexts('admin-rooms');
  const loadRooms = useCallback(() => getRooms(), []);
  const { rows, isLoading, hasLoadError, reload, setHasLoadError } = useInitialLoad<Room[]>(loadRooms, []);

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
  } = useCrudModal<RoomFormValues>(emptyRoomForm);

  const errorMessages = texts.modal.errors;

  const openCreateModal = () => openCreate({ ...emptyRoomForm, grid: createSeatGrid(5, 8) });

  const openEditModal = async (room: Room) => {
    try {
      setFormError(null);
      const detail = await getRoom(room.id);
      const rowCount = clampDimension(detail.rows || 1, 1, MAX_ROOM_ROWS);
      const colCount = clampDimension(detail.columns || 1, 1, MAX_ROOM_COLS);
      openEdit(room.id, {
        name: detail.name ?? '',
        rows: rowCount,
        columns: colCount,
        grid: gridFromRoomSeats(rowCount, colCount, detail.seats ?? []),
      });
    } catch (error) {
      setHasLoadError(true);
      setFormError(mapApiError(error, errorMessages));
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formValues.name.trim()) {
      setFormError(errorMessages.missingFields);
      return;
    }

    const seats = seatsFromGrid(formValues.grid);
    if (seats.length === 0) {
      setFormError(errorMessages.noSeats);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload = {
        name: formValues.name.trim(),
        rows: formValues.rows,
        columns: formValues.columns,
        seats,
      };
      if (editingId) {
        await updateRoom(editingId, payload);
      } else {
        await createRoom(payload);
      }
      await reload();
      setIsModalOpen(false);
    } catch (error) {
      setFormError(mapApiError(error, errorMessages));
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (room: Room) => {
    if (!window.confirm(texts.table.confirmDelete)) return;
    try {
      await deleteRoom(room.id);
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
                <th>{texts.table.columns.name}</th>
                <th>{texts.table.columns.size}</th>
                <th>{texts.table.columns.seats}</th>
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
                    <td>{row.name}</td>
                    <td>
                      {row.rows && row.columns ? `${row.rows}×${row.columns}` : '—'}
                    </td>
                    <td>{row.seat_count ?? '—'}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() => void openEditModal(row)}
                        >
                          {texts.table.actions.edit}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger admin-btn--sm"
                          onClick={() => void onDelete(row)}
                        >
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
          size="fullscreen"
          cancelLabel={texts.modal.buttons.cancel}
          submitLabel={editingId ? texts.modal.buttons.saveChanges : texts.modal.buttons.create}
          savingLabel={texts.modal.buttons.saving}
        >
          <AdminRoomForm
            values={formValues}
            onChange={setFormValues}
            labels={{
              name: texts.modal.fields.name,
              rows: texts.modal.fields.rows,
              columns: texts.modal.fields.columns,
              map: texts.modal.fields.map,
              screen: texts.modal.fields.screen,
              types: texts.modal.types,
              selectAll: texts.modal.fields.selectAll,
              clearSelection: texts.modal.fields.clearSelection,
              selectedCount: texts.modal.fields.selectedCount,
              assign: texts.modal.fields.assign,
              zoomReset: texts.modal.fields.zoomReset,
            }}
          />
        </CrudModal>
      </div>
    </section>
  );
}
