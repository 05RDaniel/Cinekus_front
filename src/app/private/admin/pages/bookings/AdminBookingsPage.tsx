import { FormEvent, useCallback, useState } from 'react';
import axios from 'axios';
import { formatSessionSchedule } from '../../../../features/screenings/models/screening.model';
import { Booking, formatBookingUser } from '../../../../features/bookings/models/booking.model';
import {
  AdminBookingsFilters,
  deleteBooking,
  getAllBookingsAdmin,
} from '../../../../features/bookings/services/bookings.service';
import { AdminTableStates } from '../../../../shared/components/crud/AdminTableStates';
import { CrudModal } from '../../../../shared/components/crud/CrudModal';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { useInitialLoad } from '../../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../../lang';
import { BookingDetailView } from './BookingDetailView';

export function AdminBookingsPage() {
  const texts = usePageTexts('admin-bookings');
  const loadBookings = useCallback(() => getAllBookingsAdmin(), []);
  const { rows, setRows, isLoading, hasLoadError, reload, setHasLoadError, setIsLoading } = useInitialLoad<Booking[]>(
    loadBookings,
    []
  );

  const [filterUserId, setFilterUserId] = useState('');
  const [filterSessionId, setFilterSessionId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detail, setDetail] = useState<Booking | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
    const userId = filterUserId.trim() ? Number(filterUserId) : undefined;
    const sessionId = filterSessionId.trim() ? Number(filterSessionId) : undefined;
    const filters: AdminBookingsFilters = {};
    if (userId !== undefined && Number.isFinite(userId) && userId > 0) filters.userId = userId;
    if (sessionId !== undefined && Number.isFinite(sessionId) && sessionId > 0) filters.sessionId = sessionId;
    await fetchBookings(Object.keys(filters).length ? filters : undefined);
  };

  const onClearFilters = async () => {
    setFilterUserId('');
    setFilterSessionId('');
    await fetchBookings();
  };

  const openView = (booking: Booking) => {
    setDetail(booking);
    setActionError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDetail(null);
    setActionError(null);
  };

  const onDelete = async (booking: Booking) => {
    if (!window.confirm(texts.table.confirmDelete)) return;
    setActionError(null);
    try {
      await deleteBooking(booking.id);
      await reload();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setActionError(texts.errors.deleteNotAvailable);
      } else {
        setActionError(mapApiError(error, texts.errors));
      }
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
                <th>{texts.table.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              <AdminTableStates
                colSpan={8}
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
                    <td>{row.status_id}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openView(row)}>
                          {texts.table.actions.view}
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
          title={texts.modal.titleView}
          onClose={closeModal}
          closeAriaLabel={texts.modal.closeAriaLabel}
          footer={
            <button type="button" className="admin-btn" onClick={closeModal}>
              {texts.modal.buttons.close}
            </button>
          }
        >
          {detail && <BookingDetailView booking={detail} labels={texts.modal.fields} />}
        </CrudModal>
      </div>
    </section>
  );
}
