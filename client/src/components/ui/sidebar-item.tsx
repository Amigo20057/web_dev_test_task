export default function SidebarItem({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`px-4 py-2 rounded-[var(--main-radius)] text-sm cursor-pointer transition-all
        ${
          active
            ? "bg-blue-50 text-[var(--accent)] font-medium"
            : "text-[var(--second-txt-color)] hover:bg-gray-100"
        }`}
    >
      {children}
    </div>
  );
}
