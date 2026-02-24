interface Column<T> {
  title: string;
  width: string;
  key: keyof T;
}

interface IProps<T extends { id: number }> {
  data: T[];
  isLoading?: boolean;
  options: Column<T>[];
}

export default function Table<T extends { id: number }>({
  data,
  isLoading = false,
  options,
}: IProps<T>) {
  const formatValue = (value: any, key: keyof T) => {
    if (key === "id") {
      return String(value);
    }

    if (typeof value === "number") {
      return value.toFixed(2);
    }

    if (typeof value === "string" && value.includes("T")) {
      return new Date(value).toLocaleString();
    }

    return String(value ?? "-");
  };

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
            {isLoading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={options.length}
                  className="text-center py-10 text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={options.length}
                  className="text-center py-10 text-gray-500"
                >
                  No data
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {options.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-6 py-4 border-b border-[var(--main-border)]"
                    >
                      {formatValue(row[col.key], col.key)}
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
