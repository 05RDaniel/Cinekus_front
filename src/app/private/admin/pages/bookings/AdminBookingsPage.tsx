import { FormEvent, useCallback, useState } from 'react';
import axios from 'axios';
import { formatSessionSchedule } from '../../../../features/screenings/models/screening.model';
import {
  Booking,
  formatBookingStatus,
  formatBookingUser,
  isBookingCancelled,
} from '../../../../features/bookings/models/booking.model';
import {
  AdminBookingsFilters,
  deleteBooking,
  getAllBookingsAdmin,
  getBookingAdmin,
  updateBookingStatus,
} from '../../../../features/bookings/services/bookings.service';
import { AdminTableStates } from '../../../../shared/components/crud/AdminTableStates';
import { CrudModal } from '../../../../shared/components/crud/CrudModal';
import { ConfirmModal } from '../../../../shared/components/crud/ConfirmModal';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { useInitialLoad } from '../../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../../lang';
import { BookingDetailView } from './BookingDetailView';

export function AdminBookingsPage() {
  const texts = usePageTexts('admin-bookings');
  const loadBookings = useCallback(() => getAllBookingsAdmin(), []);
  const { rows, setRows, isLoading, hasLoadError, setHasLoadError, setIsLoading } = useInitialLoad<Booking[]>(
    loadBookings,
    []
  );

  const [filterUserId, setFilterUserId] = useState('');
  const [filterSessionId, setFilterSessionId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detail, setDetail] = useState<Booking | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentFilters = (): AdminBookingsFilters | undefined => {
    const userId = filterUserId.trim() ? Number(filterUserId) : undefined;
    const sessionId = filterSessionId.trim() ? Number(filterSessionId) : undefined;
    const filters: AdminBookingsFilters = {};
    if (userId !== undefined && Number.isFinite(userId) && userId > 0) filters.userId = userId;
    if (sessionId !== undefined && Number.isFinite(sessionId) && sessionId > 0) filters.sessionId = sessionId;
    return Object.keys(filters).length ? filters : undefined;
  };

  const fetchBookings = async (filters?: AdminBookingsFilters) => {
    try {
      setIsLoading(true);
      const data = await getAllBookingsAdmin(filters);
      setRows(data);
      setHasLoadError(false);
    } catch {
      setRows([]);
      setHasLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onApplyFilters = async (event: FormEvent) => {
    event.preventDefault();
    await fetchBookings(currentFilters());
  };

  const onClearFilters = async () => {
    setFilterUserId('');
    setFilterSessionId('');
    await fetchBookings();
  };

  const openView = async (booking: Booking) => {
    setActionError(null);
    setIsModalOpen(true);
    setDetail(booking);
    try {
      const full = await getBookingAdmin(booking.id);
      setDetail(full);
    } catch (error) {
      setActionError(mapApiError(error, texts.errors));
    }
  };

  const closeModal = () => {
    if (isUpdatingStatus) return;
    setIsModalOpen(false);
    setDetail(null);
    setActionError(null);
  };

  const applyUpdatedBooking = (updated: Booking) => {
    setDetail(updated);
    setRows((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
  };

  const onToggleStatus = async (booking: Booking) => {
    const nextStatus = isBookingCancelled(booking) ? 'confirmed' : 'cancelled';
    const confirmMessage =
      nextStatus === 'cancelled' ? texts.modal.confirmCancel : texts.modal.confirmRestore;
    if (!window.confirm(confirmMessage)) return;
    setActionError(null);
    setIsUpdatingStatus(true);
    try {
      const updated = await updateBookingStatus(booking.id, nextStatus);
      applyUpdatedBooking(updated);
    } catch (error) {
      setActionError(mapApiError(error, texts.errors));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setPendingDelete(null);
  };

  const onDelete = (booking: Booking) => {
    setActionError(null);
    setPendingDelete(booking);
  };

  const onConfirmDelete = async () => {
    if (!pendingDelete) return;
    setActionError(null);
    setIsDeleting(true);
    try {
      await deleteBooking(pendingDelete.id);
      if (detail?.id === pendingDelete.id) closeModal();
      setPendingDelete(null);
      await fetchBookings(currentFilters());
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setActionError(texts.errors.deleteNotAvailable);
      } else {
        setActionError(mapApiError(error, texts.errors));
      }
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__inner">
        <AdminPageHeader backTo="/admin/home" title={texts.title} />

        {actionError && !isModalOpen && (
          <div className="admin-alert admin-alert--error">{actionError}</div>
        )}

        <form className="admin-filters" onSubmit={onApplyFilters}>
          <div className="admin-filters__field">
            <label htmlFor="filter-user-id">{texts.filters.userId}</label>
            <input
              id="filter-user-id"
              type="number"
              min={1}
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
            />
          </div>
          <div className="admin-filters__field">
            <label htmlFor="filter-session-id">{texts.filters.sessionId}</label>
            <input
              id="filter-session-id"
              type="number"
              min={1}
              value={filterSessionId}
              onChange={(e) => setFilterSessionId(e.target.value)}
            />
          </div>
          <div className="admin-filters__actions">
            <button type="submit" className="admin-btn admin-btn--sm">
              {texts.filters.apply}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => void onClearFilters()}>
              {texts.filters.clear}
            </button>
          </div>
        </form>

        <div className="admin-table-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{texts.table.columns.id}</th>
                <th>{texts.table.columns.userId}</th>
                <th>{texts.table.columns.sessionId}</th>
                <th>{texts.table.columns.movie}</th>
                <th>{texts.table.columns.sessionStart}</th>
                <th>{texts.table.columns.createdAt}</th>
                <th>{texts.table.columns.statusId}</th>
                <th>{texts.table.columns.total}</th>
                <th>{texts.table.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              <AdminTableStates
                colSpan={9}
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
                    <td>{formatBookingUser(row)}</td>
                    <td>{row.session_id}</td>
                    <td>{row.movie_title ?? '—'}</td>
                    <td>{formatSessionSchedule(row.session_start_date, row.session_start_time)}</td>
                    <td>{row.created_at ? new Date(row.created_at).toLocaleString() : '—'}</td>
                    <td>{formatBookingStatus(row, texts.status)}</td>
                    <td>{row.total_price != null ? `${Number(row.total_price).toFixed(2)} €` : '—'}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => void openView(row)}>
                          {texts.table.actions.view}
                        </button>
                        <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => onDelete(row)}>
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
          title={texts.modal.titleView}
          onClose={closeModal}
          closeAriaLabel={texts.modal.closeAriaLabel}
          size="xl"
          error={actionError}
          footer={
            <>
              {detail && (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  disabled={isUpdatingStatus}
                  onClick={() => void onToggleStatus(detail)}
                >
                  {isUpdatingStatus
                    ? texts.modal.buttons.updating
                    : isBookingCancelled(detail)
                      ? texts.modal.buttons.restore
                      : texts.modal.buttons.cancelBooking}
                </button>
              )}
              <button type="button" className="admin-btn" onClick={closeModal} disabled={isUpdatingStatus}>
                {texts.modal.buttons.close}
              </button>
            </>
          }
        >
          {detail && (
            <BookingDetailView booking={detail} labels={texts.modal.fields} statusLabels={texts.status} />
          )}
        </CrudModal>

        <ConfirmModal
          isOpen={pendingDelete != null}
          title={texts.modal.titleDelete}
          message={texts.table.confirmDelete}
          confirmLabel={texts.table.actions.delete}
          cancelLabel={texts.modal.buttons.cancel}
          closeAriaLabel={texts.modal.closeAriaLabel}
          confirmingLabel={texts.modal.buttons.deleting}
          isConfirming={isDeleting}
          onCancel={closeDeleteConfirm}
          onConfirm={() => void onConfirmDelete()}
        />
      </div>
    </section>
  );
}
