import { FormEvent, useCallback } from 'react';
import { Movie } from '../../../../features/movies/models/movie.model';
import { getMovies } from '../../../../features/movies/services/movies.service';
import { Room } from '../../../../features/rooms/models/room.model';
import { getRooms } from '../../../../features/rooms/services/rooms.service';
import {
  CinemaLanguage,
  PRIMARY_SESSION_LANGUAGE_CODE,
  Session,
  formatSessionTime,
  sessionTypeLabel,
} from '../../../../features/screenings/models/screening.model';
import {
  createSession,
  deleteSession,
  getLanguages,
  getSessions,
  updateSession,
} from '../../../../features/screenings/services/screenings.service';
import { AdminTableStates } from '../../../../shared/components/crud/AdminTableStates';
import { CrudModal } from '../../../../shared/components/crud/CrudModal';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { useCrudModal } from '../../../../shared/hooks/useCrudModal';
import { useInitialLoad } from '../../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../../lang';
import {
  AdminSessionForm,
  createEmptySessionForm,
  SessionFormValues,
} from './AdminSessionForm';

type SessionsPageData = {
  sessions: Session[];
  movies: Movie[];
  rooms: Room[];
  languages: CinemaLanguage[];
};

const emptyData: SessionsPageData = { sessions: [], movies: [], rooms: [], languages: [] };

export function AdminSessionsPage() {
  const texts = usePageTexts('admin-sessions');
  const loadData = useCallback(async () => {
    const [sessions, movies, rooms, languages] = await Promise.all([
      getSessions(),
      getMovies(),
      getRooms(),
      getLanguages(),
    ]);
    return { sessions, movies, rooms, languages };
  }, []);
  const { rows, isLoading, hasLoadError, reload, setHasLoadError } = useInitialLoad(loadData, emptyData);

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
  } = useCrudModal<SessionFormValues>(createEmptySessionForm([]));

  const errorMessages = texts.modal.errors;
  const subtitleLabels = texts.table.subtitles;

  const formatSubtitles = (session: Session) => {
    if (session.language_code === PRIMARY_SESSION_LANGUAGE_CODE || !session.subtitles) {
      return '—';
    }
    if (session.subtitles === 'none') return subtitleLabels.none;
    if (session.subtitles === 'es') return subtitleLabels.es;
    return subtitleLabels.en;
  };

  const openCreateModal = () => openCreate(createEmptySessionForm(rows.languages));

  const openEditModal = (session: Session) =>
    openEdit(session.id, {
      movie_id: String(session.movie_id),
      room_id: String(session.room_id),
      language_id: String(session.language_id),
      session_type: session.session_type,
      subtitles: session.subtitles ?? '',
      start_date: session.start_date,
      start_time: formatSessionTime(session.start_time),
    });

  const buildPayload = (values: SessionFormValues) => {
    const language = rows.languages.find((item) => String(item.id) === values.language_id);
    const isPrimary = language?.code === PRIMARY_SESSION_LANGUAGE_CODE;

    return {
      movie_id: Number(values.movie_id),
      room_id: Number(values.room_id),
      language_id: Number(values.language_id),
      session_type: values.session_type,
      subtitles: isPrimary ? null : values.subtitles || null,
      start_date: values.start_date,
      start_time: values.start_time,
    };
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const movieId = Number(formValues.movie_id);
    const roomId = Number(formValues.room_id);
    const languageId = Number(formValues.language_id);
    const language = rows.languages.find((item) => item.id === languageId);
    const isPrimary = language?.code === PRIMARY_SESSION_LANGUAGE_CODE;

    if (
      !formValues.movie_id ||
      !formValues.room_id ||
      !formValues.language_id ||
      !formValues.start_date ||
      !formValues.start_time
    ) {
      setFormError(errorMessages.missingFields);
      return;
    }
    if (!Number.isFinite(movieId) || !Number.isFinite(roomId) || !Number.isFinite(languageId)) {
      setFormError(errorMessages.missingFields);
      return;
    }
    if (!isPrimary && !formValues.subtitles) {
      setFormError(errorMessages.missingSubtitles);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload = buildPayload(formValues);

      if (editingId) {
        await updateSession(editingId, payload);
      } else {
        await createSession(payload);
      }
      await reload();
      setIsModalOpen(false);
    } catch (error) {
      setFormError(mapApiError(error, errorMessages));
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (session: Session) => {
    if (!window.confirm(texts.table.confirmDelete)) return;
    try {
      await deleteSession(session.id);
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
                <th>{texts.table.columns.movie}</th>
                <th>{texts.table.columns.room}</th>
                <th>{texts.table.columns.language}</th>
                <th>{texts.table.columns.type}</th>
                <th>{texts.table.columns.subtitles}</th>
                <th>{texts.table.columns.startDate}</th>
                <th>{texts.table.columns.startTime}</th>
                <th>{texts.table.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              <AdminTableStates
                colSpan={9}
                isLoading={isLoading}
                hasLoadError={hasLoadError}
                isEmpty={rows.sessions.length === 0}
                loadingText={texts.table.states.loading}
                errorText={texts.table.states.loadError}
                emptyText={texts.table.states.empty}
              >
                {rows.sessions.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.movie_title ?? row.movie_id}</td>
                    <td>{row.room_name ?? row.room_id}</td>
                    <td>{row.language_name ?? row.language_code ?? row.language_id}</td>
                    <td>{sessionTypeLabel(row.session_type, texts.table.types)}</td>
                    <td>{formatSubtitles(row)}</td>
                    <td>{row.start_date}</td>
                    <td>{formatSessionTime(row.start_time)}</td>
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
          size="lg"
          scrollable
          cancelLabel={texts.modal.buttons.cancel}
          submitLabel={editingId ? texts.modal.buttons.saveChanges : texts.modal.buttons.create}
          savingLabel={texts.modal.buttons.saving}
        >
          <AdminSessionForm
            values={formValues}
            onChange={setFormValues}
            movies={rows.movies}
            rooms={rows.rooms}
            languages={rows.languages}
            labels={texts.modal.fields}
          />
        </CrudModal>
      </div>
    </section>
  );
}
