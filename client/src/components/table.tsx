interface Column<T> {
  title: string;
  width: string;
  key: keyof T;
}

interface IProps<T> {
  data: T[];
  isLoading?: boolean;
  options: Column<T>[];
}

export default function Table<T>({
  data,
  isLoading = false,
  options,
}: IProps<T>) {
  return (
    <div className="w-full bg-[var(--card)] rounded-[var(--main-radius)] shadow-[var(--main-shadows)] border border-[var(--main-border)] overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[var(--white-bg)]">
            <tr>
              {options.map((col) => (
                <th
                  key={String(col.key)}
                  style={{ width: col.width }}
                  className="text-left px-6 py-4 text-[var(--second-txt-color)] text-sm font-medium border-b border-[var(--main-border)]"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={options.length}
                  className="text-center py-10 text-[var(--second-txt-color)]"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={options.length}
                  className="text-center py-10 text-[var(--second-txt-color)]"
                >
                  No data
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {options.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-6 py-4 border-b border-[var(--main-border)]"
                    >
                      {String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
