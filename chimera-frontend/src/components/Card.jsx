export default function Card({ children }) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm transition hover:shadow-md">
      {children}
    </div>
  );
}
