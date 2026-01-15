import type { ReactNode } from "react";

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
}

function Table<T extends { id?: number | string }>({ data, columns }: TableProps<T>) {
  const getCellValue = (row: T, column: TableColumn<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor] as ReactNode;
  };

  return (
    <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100/50 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className={`px-6 py-3 ${column.className || ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${column.className || ""}`}>
                  {getCellValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
