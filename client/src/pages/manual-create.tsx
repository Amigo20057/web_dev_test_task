import FormCreateOrder from "../components/forms/form-create-order";

export default function ManualCreatePage() {
  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex justify-center">
        <FormCreateOrder />
      </div>
    </div>
  );
}
