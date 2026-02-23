import ManualCreateForm from "../components/form";

export default function ManualCreatePage() {
  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex justify-center">
        <ManualCreateForm />
      </div>
    </div>
  );
}
