import { CaseForm } from "@/components/CaseForm";

export default function NewCasePage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <p className="label-eyebrow mb-1">File a New Case</p>
      <h1 className="font-display text-3xl font-bold text-paper mb-6">
        Create Missing Person Record
      </h1>
      <CaseForm />
    </div>
  );
}
