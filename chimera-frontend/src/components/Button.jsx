export default function Button({ children, variant = "primary", ...props }) {
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-black",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg transition ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
