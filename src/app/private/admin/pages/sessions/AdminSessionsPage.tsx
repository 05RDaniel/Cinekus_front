import { FormEvent, useCallback, useState } from 'react';
import { Movie } from '../../../../features/movies/models/movie.model';
import { getMovies } from '../../../../features/movies/services/movies.service';
import { Room } from '../../../../features/rooms/models/room.model';
import { getRooms } from '../../../../features/rooms/services/rooms.service';
import {
  CinemaLanguage,
  PRIMARY_SESSION_LANGUAGE_CODE,
  Session,
  formatSessionTime,
  roomIsOccupied,
} from '../../../../features/screenings/models/screening.model';
import {
  createSession,
  deleteSession,
  getLanguages,
  getSessions,
  updateSession,
} from '../../../../features/screenings/services/screenings.service';
import { ConfirmModal } from '../../../../shared/components/crud/ConfirmModal';
import { CrudModal } from '../../../../shared/components/crud/CrudModal';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { useCrudModal } from '../../../../shared/hooks/useCrudModal';
import { useInitialLoad } from '../../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../../lang';
import { useLanguage } from '../../../../core/context/LanguageContext';
import {
  AdminSessionForm,
  createEmptySessionForm,
  SessionFormValues,
} from './AdminSessionForm';
import { AdminSessionsWeekGrid } from './AdminSessionsWeekGrid';

type SessionsPageData = {
  sessions: Session[];
  movies: Movie[];
  rooms: Room[];
  languages: CinemaLanguage[];
};

const emptyData: SessionsPageData = { sessions: [], movies: [], rooms: [], languages: [] };

export function AdminSessionsPage() {
  const texts = usePageTexts('admin-sessions');
  const { language } = useLanguage();
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
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

  const openCreateModal = (startDate = '', startTime = '', roomId = '') =>
    openCreate({
      ...createEmptySessionForm(rows.languages),
      start_date: startDate,
      start_time: startTime,
      room_id: roomId,
    });

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
    if (
      roomIsOccupied(
        rows.sessions,
        rows.movies,
        roomId,
        formValues.start_date,
        formValues.start_time,
        movieId,
        editingId
      )
    ) {
      setFormError(errorMessages.roomOccupied);
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

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setPendingDelete(null);
  };

  const onDelete = (session: Session) => {
    setPendingDelete(session);
  };

  const onMoveSession = async (session: Session, date: string, time: string, roomId: number) => {
    if (
      session.room_id === roomId &&
      session.start_date === date &&
      formatSessionTime(session.start_time) === time
    ) {
      return;
    }
    if (roomIsOccupied(rows.sessions, rows.movies, roomId, date, time, session.movie_id, session.id)) {
      setMoveError(errorMessages.roomOccupied);
      return;
    }
    setMoveError(null);
    try {
      await updateSession(session.id, {
        room_id: roomId,
        start_date: date,
        start_time: time,
      });
      await reload();
    } catch (error) {
      setMoveError(mapApiError(error, errorMessages));
    }
  };

  const onConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteSession(pendingDelete.id);
      setPendingDelete(null);
      await reload();
    } catch {
      setHasLoadError(true);
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="admin-page admin-page--sessions">
      <div className="admin-page__inner">
        <AdminPageHeader
          backTo="/admin/home"
          title={texts.title}
          action={
            <button type="button" className="admin-btn" onClick={() => openCreateModal()}>
              {texts.addButton}
            </button>
          }
        />

        {moveError ? <div className="admin-alert admin-alert--error">{moveError}</div> : null}

        <AdminSessionsWeekGrid
          sessions={rows.sessions}
          movies={rows.movies}
          rooms={rows.rooms}
          locale={language}
          isLoading={isLoading}
          hasLoadError={hasLoadError}
          labels={{
            ...texts.week,
            types: texts.table.types,
          }}
          onCreateAt={(date, time, roomId) => openCreateModal(date, time, String(roomId))}
          onMove={(session, date, time, roomId) => void onMoveSession(session, date, time, roomId)}
          onEdit={openEditModal}
          onDelete={onDelete}
        />

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
