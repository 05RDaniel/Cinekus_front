import { ReactNode } from 'react';

type AdminTableStatesProps = {
  colSpan: number;
  isLoading: boolean;
  hasLoadError: boolean;
  isEmpty: boolean;
  loadingText: string;
  errorText: string;
  emptyText: string;
  children: ReactNode;
};

export function AdminTableStates({
  colSpan,
  isLoading,
  hasLoadError,
  isEmpty,
  loadingText,
  errorText,
  emptyText,
  children,
}: AdminTableStatesProps) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={colSpan} className="admin-table__empty">
          {loadingText}
        </td>
      </tr>
    );
  }
  if (hasLoadError) {
    return (
      <tr>
        <td colSpan={colSpan} className="admin-table__error">
          {errorText}
        </td>
      </tr>
    );
  }
  if (isEmpty) {
    return (
      <tr>
        <td colSpan={colSpan} className="admin-table__empty">
          {emptyText}
        </td>
      </tr>
    );
  }
  return <>{children}</>;
}
