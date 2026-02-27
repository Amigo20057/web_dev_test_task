import { Eye } from "lucide-react";

interface Column<T> {
  title: string;
  width: string;
  key: keyof T;
}

interface IProps<T extends { id: number }> {
  data: T[];
  isLoading?: boolean;
  options: Column<T>[];
  onView?: (row: T) => void;
}

export default function Table<T extends { id: number }>({
  data,
  isLoading = false,
  options,
  onView,
}: IProps<T>) {
  const formatValue = (value: any, key: keyof T) => {
    if (key === "id") return String(value);

    if (typeof value === "number") return value.toFixed(2);

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

              {onView && (
                <th className="px-6 py-4 border-b border-[var(--main-border)] w-[80px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={options.length + (onView ? 1 : 0)}
                  className="text-center py-10 text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={options.length + (onView ? 1 : 0)}
                  className="text-center py-10 text-gray-500"
                >
                  No data
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={`${row.id}-${index}`} className="hover:bg-gray-50">
                  {options.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-6 py-4 border-b border-[var(--main-border)]"
                    >
                      {formatValue(row[col.key], col.key)}
                    </td>
                  ))}

                  {onView && (
                    <td className="px-6 py-4 border-b border-[var(--main-border)]">
                      <button
                        onClick={() => onView(row)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
