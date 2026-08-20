export type UserFormValues = {
  username: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'USER';
};

type AdminUserFormProps = {
  values: UserFormValues;
  onChange: (values: UserFormValues) => void;
  isEditing: boolean;
  labels: {
    username: string;
    email: string;
    password: string;
    passwordHint: string;
    role: string;
    roleAdmin: string;
    roleUser: string;
  };
};

export function AdminUserForm({ values, onChange, isEditing, labels }: AdminUserFormProps) {
  return (
    <div className="crud-form">
      <div className="crud-field">
        <label className="crud-field__label" htmlFor="user-username">
          {labels.username}
        </label>
        <input
          id="user-username"
          value={values.username}
          onChange={(event) => onChange({ ...values, username: event.target.value })}
          required
        />
      </div>
      <div className="crud-field">
        <label className="crud-field__label" htmlFor="user-email">
          {labels.email}
        </label>
        <input
          id="user-email"
          type="email"
          value={values.email}
          onChange={(event) => onChange({ ...values, email: event.target.value })}
          required
        />
      </div>
      <div className="crud-field">
        <label className="crud-field__label" htmlFor="user-password">
          {labels.password}
        </label>
        <input
          id="user-password"
          type="password"
          value={values.password}
          onChange={(event) => onChange({ ...values, password: event.target.value })}
          required={!isEditing}
          placeholder={isEditing ? labels.passwordHint : undefined}
        />
      </div>
      <div className="crud-field">
        <label className="crud-field__label" htmlFor="user-role">
          {labels.role}
        </label>
        <select
          id="user-role"
          value={values.rol}
          onChange={(event) => onChange({ ...values, rol: event.target.value as 'ADMIN' | 'USER' })}
          required
        >
          <option value="USER">{labels.roleUser}</option>
          <option value="ADMIN">{labels.roleAdmin}</option>
        </select>
      </div>
    </div>
  );
}

export const emptyUserForm: UserFormValues = {
  username: '',
  email: '',
  password: '',
  rol: 'USER',
};
