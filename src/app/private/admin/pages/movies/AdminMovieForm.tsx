import { useEffect, useRef, useState } from 'react';
import { CastDepartment, CastMember, TmdbSearchResult } from '../../../../features/movies/models/movie.model';
import { searchTmdbMovies } from '../../../../features/movies/services/movies.service';

export type MovieLanguageTab = 'es' | 'en';

export type MovieFormValues = {
  title: string;
  sinopsis: string;
  duration: string;
  releaseYear: string;
  image: string;
  trailerUrl: string;
  rating: string;
  genreIds: number[];
  cast: CastMember[];
  en: {
    title: string;
    sinopsis: string;
    isAvailable: boolean;
  };
};

const CAST_DEPARTMENTS: CastDepartment[] = ['acting', 'directing', 'production'];

type AdminMovieFormProps = {
  values: MovieFormValues;
  onChange: (values: MovieFormValues) => void;
  genres: { id: number; name: string }[];
  isEditing: boolean;
  onTmdbImport: (tmdbId: number) => Promise<void>;
  isLoadingTmdb: boolean;
  tmdbError: string | null;
  labels: {
    tabSpanish: string;
    tabEnglish: string;
    title: string;
    titleSearchHelp: string;
    titleSearching: string;
    titleNoResults: string;
    confirmOverwrite: string;
    durationMinutes: string;
    releaseYear: string;
    trailerUrl: string;
    imageUrl: string;
    rating: string;
    synopsis: string;
    genres: string;
    genresPlaceholder: string;
    cast: string;
    castActing: string;
    castDirecting: string;
    castProduction: string;
    addPerson: string;
    removePerson: string;
    englishAvailable: string;
    englishAvailableHelp: string;
  };
};

function departmentLabel(department: CastDepartment, labels: AdminMovieFormProps['labels']) {
  if (department === 'acting') return labels.castActing;
  if (department === 'directing') return labels.castDirecting;
  return labels.castProduction;
}

function namesForDepartment(cast: CastMember[], department: CastDepartment): string[] {
  const names = cast.filter((member) => member.department === department).map((member) => member.name);
  return names.length > 0 ? names : [''];
}

function updateDepartmentNames(
  cast: CastMember[],
  department: CastDepartment,
  names: string[]
): CastMember[] {
  const others = cast.filter((member) => member.department !== department);
  const entries = names
    .map((name) => name.trim())
    .filter((name) => name !== '')
    .map((name) => ({ name, department }));

  return [...others, ...entries];
}

function hasImportedContent(values: MovieFormValues): boolean {
  return (
    values.sinopsis.trim() !== '' ||
    values.duration.trim() !== '' ||
    values.releaseYear.trim() !== '' ||
    values.trailerUrl.trim() !== '' ||
    values.image.trim() !== '' ||
    values.rating.trim() !== '' ||
    values.genreIds.length > 0 ||
    values.cast.length > 0 ||
    values.en.title.trim() !== '' ||
    values.en.sinopsis.trim() !== ''
  );
}

type CastDepartmentFieldsProps = {
  department: CastDepartment;
  values: MovieFormValues;
  onChange: (values: MovieFormValues) => void;
  labels: AdminMovieFormProps['labels'];
};

function CastDepartmentFields({ department, values, onChange, labels }: CastDepartmentFieldsProps) {
  const names = namesForDepartment(values.cast, department);

  const setNames = (nextNames: string[]) => {
    onChange({ ...values, cast: updateDepartmentNames(values.cast, department, nextNames) });
  };

  const onNameChange = (index: number, name: string) => {
    const nextNames = [...names];
    nextNames[index] = name;
    setNames(nextNames);
  };

  const onAdd = () => setNames([...names, '']);

  const onRemove = (index: number) => {
    const nextNames = names.filter((_, currentIndex) => currentIndex !== index);
    setNames(nextNames.length > 0 ? nextNames : ['']);
  };

  return (
    <div className="crud-cast__department">
      <div className="crud-cast__department-title">{departmentLabel(department, labels)}</div>
      <div className="crud-cast__rows">
        {names.map((name, index) => (
          <div key={`${department}-${index}`} className="crud-cast__row">
            <input
              value={name}
              onChange={(event) => onNameChange(index, event.target.value)}
              placeholder={departmentLabel(department, labels)}
            />
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => onRemove(index)}
              disabled={names.length === 1 && name.trim() === ''}
            >
              {labels.removePerson}
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onAdd}>
        {labels.addPerson}
      </button>
    </div>
  );
}

export function AdminMovieForm({
  values,
  onChange,
  genres,
  isEditing,
  onTmdbImport,
  isLoadingTmdb,
  tmdbError,
  labels,
}: AdminMovieFormProps) {
  const [activeTab, setActiveTab] = useState<MovieLanguageTab>('es');
  const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const skipSearchRef = useRef(false);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!titleContainerRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    const query = values.title.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const timeoutId = window.setTimeout(() => {
      void searchTmdbMovies(query)
        .then((results) => {
          setSearchResults(results);
          setShowSuggestions(true);
        })
        .catch(() => {
          setSearchResults([]);
          setSearchError(labels.titleNoResults);
        })
        .finally(() => setIsSearching(false));
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [isEditing, labels.titleNoResults, values.title]);

  const onGenreToggle = (genreId: number) => {
    const nextIds = values.genreIds.includes(genreId)
      ? values.genreIds.filter((id) => id !== genreId)
      : [...values.genreIds, genreId];
    onChange({ ...values, genreIds: nextIds });
  };

  const onTitleChange = (title: string) => {
    onChange({ ...values, title });
    if (!isEditing) {
      setShowSuggestions(true);
    }
  };

  const onSelectTmdbResult = async (result: TmdbSearchResult) => {
    if (hasImportedContent(values) && !window.confirm(labels.confirmOverwrite)) {
      return;
    }

    setShowSuggestions(false);
    skipSearchRef.current = true;
    onChange({ ...values, title: result.title });
    await onTmdbImport(result.id);
  };

  return (
    <div className="crud-form">
      <div>
        <ul className="crud-tabs">
          <li className="crud-tabs__item">
            <button
              type="button"
              className={`crud-tabs__button${activeTab === 'es' ? ' crud-tabs__button--active' : ''}`}
              onClick={() => setActiveTab('es')}
            >
              {labels.tabSpanish}
            </button>
          </li>
          <li className="crud-tabs__item">
            <button
              type="button"
              className={`crud-tabs__button${activeTab === 'en' ? ' crud-tabs__button--active' : ''}`}
              onClick={() => setActiveTab('en')}
            >
              {labels.tabEnglish}
            </button>
          </li>
        </ul>

        {activeTab === 'es' ? (
          <div className="crud-form">
            <div className="crud-field">
              <label className="crud-field__label" htmlFor="movie-title-es">
                {labels.title}
              </label>
              <div className="crud-suggest" ref={titleContainerRef}>
                <input
                  id="movie-title-es"
                  value={values.title}
                  onChange={(event) => onTitleChange(event.target.value)}
                  onFocus={() => {
                    if (!isEditing && searchResults.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  autoComplete="off"
                  required
                />
                {!isEditing && (
                  <div className="crud-field__hint">
                    {isLoadingTmdb || isSearching ? labels.titleSearching : labels.titleSearchHelp}
                  </div>
                )}
                {!isEditing && showSuggestions && values.title.trim().length >= 2 && (
                  <div className="crud-suggest__list" role="listbox">
                    {isSearching ? (
                      <div className="crud-suggest__empty">{labels.titleSearching}</div>
                    ) : searchResults.length === 0 ? (
                      <div className="crud-suggest__empty">{searchError ?? labels.titleNoResults}</div>
                    ) : (
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          className="crud-suggest__option"
                          onClick={() => void onSelectTmdbResult(result)}
                          disabled={isLoadingTmdb}
                        >
                          {result.image ? (
                            <img
                              src={result.image}
                              alt=""
                              className="crud-suggest__thumb"
                              width={36}
                              height={54}
                            />
                          ) : (
                            <div className="crud-suggest__thumb crud-suggest__thumb--empty" aria-hidden="true" />
                          )}
                          <span className="crud-suggest__meta">
                            <span className="crud-suggest__title">{result.title}</span>
                            {result.year && <span className="crud-suggest__year">{result.year}</span>}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {tmdbError && <div className="crud-modal__error">{tmdbError}</div>}
            </div>
            <div className="crud-field">
              <label className="crud-field__label" htmlFor="movie-synopsis-es">
                {labels.synopsis}
              </label>
              <textarea
                id="movie-synopsis-es"
                rows={4}
                value={values.sinopsis}
                onChange={(event) => onChange({ ...values, sinopsis: event.target.value })}
                required
              />
            </div>
          </div>
        ) : (
          <div className="crud-form">
            <div className="crud-field crud-field--checkbox">
              <input
                type="checkbox"
                id="englishAvailable"
                checked={values.en.isAvailable}
                onChange={(event) =>
                  onChange({
                    ...values,
                    en: { ...values.en, isAvailable: event.target.checked },
                  })
                }
              />
              <div>
                <label htmlFor="englishAvailable">{labels.englishAvailable}</label>
                <div className="crud-field__hint">{labels.englishAvailableHelp}</div>
              </div>
            </div>
            <div className="crud-field">
              <label className="crud-field__label" htmlFor="movie-title-en">
                {labels.title}
              </label>
              <input
                id="movie-title-en"
                value={values.en.title}
                onChange={(event) =>
                  onChange({
                    ...values,
                    en: { ...values.en, title: event.target.value },
                  })
                }
              />
            </div>
            <div className="crud-field">
              <label className="crud-field__label" htmlFor="movie-synopsis-en">
                {labels.synopsis}
              </label>
              <textarea
                id="movie-synopsis-en"
                rows={4}
                value={values.en.sinopsis}
                onChange={(event) =>
                  onChange({
                    ...values,
                    en: { ...values.en, sinopsis: event.target.value },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="crud-form__row">
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="movie-duration">
            {labels.durationMinutes}
          </label>
          <input
            id="movie-duration"
            type="number"
            min={1}
            value={values.duration}
            onChange={(event) => onChange({ ...values, duration: event.target.value })}
            required
          />
        </div>
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="movie-year">
            {labels.releaseYear}
          </label>
          <input
            id="movie-year"
            type="number"
            min={1800}
            max={2100}
            value={values.releaseYear}
            onChange={(event) => onChange({ ...values, releaseYear: event.target.value })}
          />
        </div>
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="movie-rating">
            {labels.rating}
          </label>
          <input
            id="movie-rating"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={values.rating}
            onChange={(event) => onChange({ ...values, rating: event.target.value })}
          />
        </div>
      </div>

      <div className="crud-field">
        <label className="crud-field__label" htmlFor="movie-image">
          {labels.imageUrl}
        </label>
        <input
          id="movie-image"
          value={values.image}
          onChange={(event) => onChange({ ...values, image: event.target.value })}
          required
        />
      </div>

      <div className="crud-field">
        <label className="crud-field__label" htmlFor="movie-trailer">
          {labels.trailerUrl}
        </label>
        <input
          id="movie-trailer"
          type="url"
          value={values.trailerUrl}
          onChange={(event) => onChange({ ...values, trailerUrl: event.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      <div className="crud-field">
        <span className="crud-field__label">{labels.genres}</span>
        <div className="crud-checkboxes">
          {genres.length === 0 ? (
            <span className="crud-field__hint">{labels.genresPlaceholder}</span>
          ) : (
            genres.map((genre) => (
              <label key={genre.id} className="crud-checkboxes__item">
                <input
                  type="checkbox"
                  checked={values.genreIds.includes(genre.id)}
                  onChange={() => onGenreToggle(genre.id)}
                />
                <span>{genre.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="crud-field">
        <span className="crud-field__label">{labels.cast}</span>
        <div className="crud-cast">
          {CAST_DEPARTMENTS.map((department) => (
            <CastDepartmentFields
              key={department}
              department={department}
              values={values}
              onChange={onChange}
              labels={labels}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const emptyMovieForm: MovieFormValues = {
  title: '',
  sinopsis: '',
  duration: '',
  releaseYear: '',
  image: '',
  trailerUrl: '',
  rating: '',
  genreIds: [],
  cast: [],
  en: {
    title: '',
    sinopsis: '',
    isAvailable: false,
  },
};

export function movieToFormValues(movie: {
  title?: string;
  sinopsis?: string;
  duration?: number;
  release_year?: number | null;
  trailer_url?: string | null;
  image?: string | null;
  rating?: number | null;
  genre_ids?: number[];
  cast?: CastMember[];
  translation_en?: {
    title: string;
    sinopsis: string;
    is_available: boolean;
  } | null;
}): MovieFormValues {
  return {
    title: movie.title ?? '',
    sinopsis: movie.sinopsis ?? '',
    duration: movie.duration ? String(movie.duration) : '',
    releaseYear: movie.release_year != null ? String(movie.release_year) : '',
    image: movie.image ?? '',
    trailerUrl: movie.trailer_url ?? '',
    rating: movie.rating != null ? String(movie.rating) : '',
    genreIds: movie.genre_ids ?? [],
    cast: movie.cast ?? [],
    en: {
      title: movie.translation_en?.title ?? '',
      sinopsis: movie.translation_en?.sinopsis ?? '',
      isAvailable: movie.translation_en?.is_available ?? false,
    },
  };
}

export function formValuesToPayload(values: MovieFormValues) {
  const parsedDuration = Number(values.duration);
  const parsedRating = values.rating.trim() === '' ? null : Number(values.rating);
  const parsedReleaseYear = values.releaseYear.trim() === '' ? null : Number(values.releaseYear);
  const hasEnglishContent =
    values.en.isAvailable || values.en.title.trim() !== '' || values.en.sinopsis.trim() !== '';

  return {
    title: values.title.trim(),
    sinopsis: values.sinopsis.trim(),
    duration: parsedDuration,
    release_year: parsedReleaseYear,
    image: values.image.trim(),
    trailer_url: values.trailerUrl.trim() || null,
    rating: parsedRating,
    genre_ids: values.genreIds,
    cast: values.cast
      .map((member) => ({
        name: member.name.trim(),
        department: member.department,
      }))
      .filter((member) => member.name !== ''),
    translation_en: hasEnglishContent
      ? {
          title: values.en.title.trim(),
          sinopsis: values.en.sinopsis.trim(),
          is_available: values.en.isAvailable,
        }
      : null,
  };
}
