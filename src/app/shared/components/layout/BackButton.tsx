import { Link, useNavigate } from 'react-router-dom';
import { usePageTexts } from '../../../../lang';

type BackButtonProps = {
  to?: string;
};

export function BackButton({ to }: BackButtonProps) {
  const texts = usePageTexts('header');
  const navigate = useNavigate();

  if (to) {
    return (
      <Link to={to} className="back-button">
        ← {texts.navigation.back}
      </Link>
    );
  }

  return (
    <button type="button" className="back-button" onClick={() => navigate(-1)}>
      ← {texts.navigation.back}
    </button>
  );
}
