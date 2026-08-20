import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Movie } from '../../../../features/movies/models/movie.model';
import {
  createMovie,
  deleteMovie,
  getGenres,
  getMovies,
  getTmdbMovieImport,
  updateMovie,
} from '../../../../features/movies/services/movies.service';
import { AdminTableStates } from '../../../../shared/components/crud/AdminTableStates';
import { CrudModal } from '../../../../shared/components/crud/CrudModal';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { useCrudModal } from '../../../../shared/hooks/useCrudModal';
import { useInitialLoad } from '../../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../../lang';
import {
  AdminMovieForm,
  emptyMovieForm,
  formValuesToPayload,
  movieToFormValues,
  MovieFormValues,
} from './AdminMovieForm';

export function AdminMoviesPage() {
  const texts = usePageTexts('admin-movies');
  const loadMovies = useCallback(() => getMovies(), []);
  const { rows, isLoading, hasLoadError, reload, setHasLoadError } = useInitialLoad<Movie[]>(loadMovies, []);

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
  } = useCrudModal<MovieFormValues>(emptyMovieForm);

  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingTmdb, setIsLoadingTmdb] = useState(false);
  const [tmdbError, setTmdbError] = useState<string | null>(null);

  const errorMessages = texts.modal.errors;

  useEffect(() => {
    void getGenres('es')
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  const openCreateModal = () => {
    setTmdbError(null);
    openCreate(emptyMovieForm);
  };

  const openEditModal = (movie: Movie) => {
    setTmdbError(null);
    openEdit(movie.id, movieToFormValues(movie));
  };

  const onTmdbImport = async (tmdbId: number) => {
    setIsLoadingTmdb(true);
    setTmdbError(null);

    try {
      const imported = await getTmdbMovieImport(tmdbId);
      setFormValues({
        title: imported.es.title,
        sinopsis: imported.es.sinopsis,
        duration: imported.duration ? String(imported.duration) : '',
        releaseYear: imported.release_year != null ? String(imported.release_year) : '',
        image: imported.image ?? '',
        trailerUrl: imported.trailer_url ?? '',
        rating: imported.rating != null ? String(imported.rating) : '',
        genreIds: imported.genre_ids,
        cast: imported.cast ?? [],
        en: {
          title: imported.en.title,
          sinopsis: imported.en.sinopsis,
          isAvailable: imported.en.is_available,
        },
      });
    } catch (error) {
      setTmdbError(mapApiError(error, { ...errorMessages, generic: errorMessages.tmdbLoadFailed }));
    } finally {
      setIsLoadingTmdb(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formValues.title || !formValues.sinopsis || !formValues.duration || !formValues.image) {
      setFormError(errorMessages.missingFields);
      return;
    }

    const parsedDuration = Number(formValues.duration);
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setFormError(errorMessages.invalidDuration);
      return;
    }

    if (formValues.rating.trim() !== '') {
      const parsedRating = Number(formValues.rating);
      if (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 10) {
        setFormError(errorMessages.invalidRating);
        return;
      }
    }

    if (formValues.releaseYear.trim() !== '') {
      const parsedYear = Number(formValues.releaseYear);
      if (!Number.isFinite(parsedYear) || parsedYear < 1800 || parsedYear > 2100) {
        setFormError(errorMessages.invalidReleaseYear);
        return;
      }
    }

    if (formValues.en.isAvailable && !formValues.en.title.trim()) {
      setFormError(errorMessages.missingEnglishTitle);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload = formValuesToPayload(formValues);

      if (editingId) {
        await updateMovie(editingId, payload);
      } else {
        await createMovie(payload);
      }
      await reload();
      setIsModalOpen(false);
    } catch (error) {
      setFormError(mapApiError(error, errorMessages));
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (movie: Movie) => {
    if (!window.confirm(texts.table.confirmDelete)) return;
    try {
      await deleteMovie(movie.id);
      await reload();
    } catch (error) {
      window.alert(mapApiError(error, { ...errorMessages, generic: texts.table.deleteError }));
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
                <th>{texts.table.columns.image}</th>
                <th>{texts.table.columns.title}</th>
                <th>{texts.table.columns.year}</th>
                <th>{texts.table.columns.synopsis}</th>
                <th>{texts.table.columns.duration}</th>
                <th>{texts.table.columns.rating}</th>
                <th>{texts.table.columns.trailer}</th>
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
                    <td>
                      {row.image ? (
                        <img
                          src={row.image}
                          alt={row.title}
                          className="admin-table__thumb"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td>{row.title}</td>
                    <td>{row.release_year ?? '—'}</td>
                    <td>{row.sinopsis}</td>
                    <td>
                      {row.duration} {texts.durationSuffix}
                    </td>
                    <td>{row.rating ?? '-'}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={Boolean(row.trailer_url)}
                        disabled
                        aria-label={texts.table.trailerAriaLabel}
                      />
                    </td>
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
          size="xl"
          scrollable
          cancelLabel={texts.modal.buttons.cancel}
          submitLabel={editingId ? texts.modal.buttons.saveChanges : texts.modal.buttons.create}
          savingLabel={texts.modal.buttons.saving}
        >
          <AdminMovieForm
            values={formValues}
            onChange={setFormValues}
            genres={genres}
            isEditing={editingId !== null}
            onTmdbImport={onTmdbImport}
            isLoadingTmdb={isLoadingTmdb}
            tmdbError={tmdbError}
            labels={texts.modal.fields}
          />
        </CrudModal>
      </div>
    </section>
  );
}
