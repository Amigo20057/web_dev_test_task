import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  return (
    <div className="flex items-center px-4 py-2 rounded-[var(--main-radius)] border-2 border-[var(--main-border)] text-[var(--second-txt-color)] ">
      <SearchIcon size={18} className="mr-2" />
      <input
        type="text"
        placeholder="Search..."
        className="focus:outline-none"
      />
    </div>
  );
}
