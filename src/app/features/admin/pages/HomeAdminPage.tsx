import { Link } from 'react-router-dom';

const cards = [
  { title: 'Salas' },
  { title: 'Peliculas', route: '/admin/movies' },
  { title: 'Sesiones' },
  { title: 'Usuarios' },
  { title: 'Reservas' },
];

export function HomeAdminPage() {
  return (
    <section className="d-flex align-items-center justify-content-center px-3" style={{ height: '85vh' }}>
      <div className="container" style={{ height: '70vh' }}>
        <h1 className="h4 text-center mb-4">Panel de administracion</h1>

        <div className="row g-3 justify-content-center align-items-stretch" style={{ height: '60vh' }}>
          {cards.map((card) => (
            <article className="col-12 col-sm-6 col-lg-4" key={card.title}>
              <div className={`card h-100 shadow-sm ${card.route ? 'border-primary' : ''}`}>
                <div className="card-body d-flex align-items-center justify-content-center">
                  <h2 className="h5 mb-0 text-center">
                    {card.route ? (
                      <Link to={card.route} className="stretched-link text-decoration-none">
                        {card.title}
                      </Link>
                    ) : (
                      card.title
                    )}
                  </h2>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
