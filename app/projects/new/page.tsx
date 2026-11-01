import UploadForm from '@/components/UploadForm';

export default function NewProjectPage() {
  return (
    <main className="px-4 py-12">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <h1 className="text-2xl font-semibold">New project</h1>
        <p className="mt-2 text-sm text-gray-600">Continue instantly in guest mode. No sign-in or sign-up is needed.</p>
        <p className="mt-1 text-xs text-gray-500">Your projects are linked to this browser. Keep its site data if you need to return to them.</p>
      </div>
      <UploadForm />
    </main>
  );
}
