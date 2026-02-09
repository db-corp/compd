export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-neutral-400">{message}</p>
    </div>
  );
}
