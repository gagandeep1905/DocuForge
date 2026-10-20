import UploadForm from '@/components/UploadForm';

export default function NewProjectPage() {
  return (
    <main className="px-4 py-12">
      <h1 className="mb-8 text-center text-2xl font-semibold">New project</h1>
      <UploadForm />
    </main>
  );
}
