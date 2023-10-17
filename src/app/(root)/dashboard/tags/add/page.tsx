import { AddTagForm } from "~/components/forms/tags/AddTagForm";

export default function AddMediaPage() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-4xl font-semibold">Adicionar tag</p>
      <AddTagForm />
    </div>
  );
}
