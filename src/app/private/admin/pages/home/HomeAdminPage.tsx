import { Link } from 'react-router-dom';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { usePageTexts } from '../../../../../lang';

export function HomeAdminPage() {
  const texts = usePageTexts('admin-home');

  const cards = [
    { title: texts.cards.rooms, route: '/admin/rooms' },
    { title: texts.cards.movies, route: '/admin/movies' },
    { title: texts.cards.sessions, route: '/admin/sessions' },
    { title: texts.cards.users, route: '/admin/users' },
    { title: texts.cards.reservations, route: '/admin/bookings' },
  ];

  return (
    <section className="admin-page">
      <div className="admin-page__inner">
        <AdminPageHeader backTo="/home" title={texts.title} />

        <div className="admin-home-grid">
          {cards.map((card) => (
            <Link key={card.route} to={card.route} className="admin-home-card">
              <div className="admin-home-card__inner">
                <h2 className="admin-home-card__title">{card.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
