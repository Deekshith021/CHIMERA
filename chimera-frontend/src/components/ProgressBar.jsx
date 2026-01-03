export default function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="bg-green-500 h-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
