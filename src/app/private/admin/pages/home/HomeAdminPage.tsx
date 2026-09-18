import { Link } from 'react-router-dom';
import { AdminHomeCardIcon } from '../../../../shared/components/icons/AdminHomeCardIcon';
import { CardCornerIcon } from '../../../../shared/components/icons/CardCornerIcon';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { usePageTexts } from '../../../../../lang';

const CARD_CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

export function HomeAdminPage() {
  const texts = usePageTexts('admin-home');

  const cards = [
    { icon: 'rooms' as const, title: texts.cards.rooms, route: '/admin/rooms' },
    { icon: 'movies' as const, title: texts.cards.movies, route: '/admin/movies' },
    { icon: 'sessions' as const, title: texts.cards.sessions, route: '/admin/sessions' },
    { icon: 'users' as const, title: texts.cards.users, route: '/admin/users' },
    { icon: 'reservations' as const, title: texts.cards.reservations, route: '/admin/bookings' },
    { icon: 'prices' as const, title: texts.cards.prices, route: '/admin/prices' },
  ];

  return (
    <section className="admin-page">
      <div className="admin-page__inner">
        <AdminPageHeader backTo="/home" title={texts.title} />

        <div className="admin-home-grid">
          {cards.map((card) => (
            <Link key={card.route} to={card.route} className="admin-home-card">
              <div className="admin-home-card__inner">
                {CARD_CORNERS.map((corner) => (
                  <span
                    key={corner}
                    className={`admin-home-card__corner admin-home-card__corner--${corner}`}
                    aria-hidden="true"
                  >
                    <CardCornerIcon />
                  </span>
                ))}
                <span className="admin-home-card__icon">
                  <AdminHomeCardIcon name={card.icon} />
                </span>
                <h2 className="admin-home-card__title">{card.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
