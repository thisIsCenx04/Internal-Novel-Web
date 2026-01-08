type Column<T> = {
  key: keyof T
  label: string
}

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
}

export function Table<T extends Record<string, unknown>>({ columns, rows }: Props<T>) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(column.key)}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={String(column.key)}>{String(row[column.key] ?? '')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}