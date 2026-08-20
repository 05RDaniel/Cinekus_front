export type RoomFormValues = {
  name: string;
};

type AdminRoomFormProps = {
  values: RoomFormValues;
  onChange: (values: RoomFormValues) => void;
  label: string;
};

export function AdminRoomForm({ values, onChange, label }: AdminRoomFormProps) {
  return (
    <div className="crud-form">
      <div className="crud-field">
        <label className="crud-field__label" htmlFor="room-name">
          {label}
        </label>
        <input
          id="room-name"
          value={values.name}
          onChange={(event) => onChange({ name: event.target.value })}
          required
        />
      </div>
    </div>
  );
}

export const emptyRoomForm: RoomFormValues = { name: '' };
