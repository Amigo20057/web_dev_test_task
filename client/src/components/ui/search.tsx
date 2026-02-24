import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  onChange: (value: string) => void;
}

export default function Search({ onChange }: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, 400);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="flex items-center px-4 py-2 rounded-[var(--main-radius)] border-2 border-[var(--main-border)] text-[var(--second-txt-color)] ">
      <SearchIcon size={18} className="mr-2" />
      <input
        type="text"
        placeholder="Search..."
        className="focus:outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
