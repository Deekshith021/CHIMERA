import { useState } from "react";
import Button from "../components/Button";

export default function AppLayout({ children, onLogout }) {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
        <div className="w-full max-w-5xl bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl shadow-lg p-6">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Chimera</h1>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setDark(!dark)}
              >
                {dark ? "Light Mode" : "Dark Mode"}
              </Button>

              <Button
                variant="secondary"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
