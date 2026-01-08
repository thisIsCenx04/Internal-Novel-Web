import type { ReactNode } from 'react'

type TableProps = {
  header: ReactNode
  body: ReactNode
}

export function Table({ header, body }: TableProps) {
  return (
    <div className="table">
      <table>
        <thead>{header}</thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  )
}
