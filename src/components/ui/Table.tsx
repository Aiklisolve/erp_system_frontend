import { ReactNode } from 'react';

export type TableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string | number;
  emptyMessage?: string;
};

export function Table<T>({ columns, data, getRowKey, emptyMessage }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-slate-500 py-4 text-center">
        {emptyMessage ?? 'No records found.'}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-xs text-left">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-3 py-2 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, index) => (
            <tr
              key={getRowKey(row, index)}
              className="hover:bg-slate-50 transition-colors"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-3 py-2 text-slate-800">
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


