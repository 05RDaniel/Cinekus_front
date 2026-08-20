import { ReactNode } from 'react';
import { BackButton } from './BackButton';

type AdminPageHeaderProps = {
  backTo: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function AdminPageHeader({ backTo, title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header__start">
        <BackButton to={backTo} />
      </div>
      <div className="admin-page-header__center">
        <h1 className="admin-page-header__title">{title}</h1>
        {subtitle ? <p className="admin-page-header__subtitle">{subtitle}</p> : null}
      </div>
      <div className="admin-page-header__end">{action ?? null}</div>
    </header>
  );
}
