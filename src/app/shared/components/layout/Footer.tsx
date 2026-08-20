import { usePageTexts } from '../../../../lang';

export function Footer() {
  const texts = usePageTexts('footer');

  return (
    <footer className="app-footer">
      <p className="app-footer__text">{texts.copyright}</p>
    </footer>
  );
}
