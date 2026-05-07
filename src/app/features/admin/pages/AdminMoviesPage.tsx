import { useEffect, useState } from 'react';
import { Movie } from '../../../core/models/cine.model';
import { getMovies } from '../../../core/services/cine.service';

type AdminMovieRow = Movie & {
  trailer_url?: string | null;
};

function getGenreCount(rawGenre: string | null | undefined): number {
  if (!rawGenre) return 0;
  return rawGenre
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean).length;
}

export function AdminMoviesPage() {
  const [rows, setRows] = useState<AdminMovieRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadMovies = async () => {
      try {
        setIsLoading(true);
        const response = await getMovies();
        if (!mounted) return;
        setRows(response as AdminMovieRow[]);
        setHasLoadError(false);
      } catch {
        if (!mounted) return;
        setRows([]);
        setHasLoadError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadMovies();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="d-flex align-items-center justify-content-center px-3" style={{ height: '85vh' }}>
      <div className="container" style={{ height: '70vh' }}>
        <h1 className="h4 mb-3">Peliculas</h1>

        <div className="table-responsive border rounded bg-white" style={{ maxHeight: '60vh' }}>
          <table className="table table-sm table-striped align-middle mb-0">
            <thead className="table-dark sticky-top">
              <tr>
                <th>Titulo</th>
                <th>Sinopsis</th>
                <th>Duracion</th>
                <th>Generos</th>
                <th>Fecha estreno</th>
                <th>Imagen</th>
                <th>Trailer URL</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-3">
                    Cargando...
                  </td>
                </tr>
              )}
              {!isLoading && hasLoadError && (
                <tr>
                  <td colSpan={7} className="text-center py-3 text-danger">
                    No se pudo cargar peliculas desde la base de datos
                  </td>
                </tr>
              )}
              {!isLoading && !hasLoadError && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-3">
                    No hay peliculas en la base de datos
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.titulo}</td>
                  <td className="text-wrap" style={{ minWidth: 260 }}>
                    {row.sinopsis}
                  </td>
                  <td>{row.duracion} min</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-outline-secondary" disabled>
                      {getGenreCount(row.genero)}
                    </button>
                  </td>
                  <td>{row.fecha_estreno}</td>
                  <td className="text-center">
                    <input type="checkbox" checked={!!row.imagen} readOnly />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" checked={!!row.trailer_url} readOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
