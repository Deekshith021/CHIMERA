import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Login({ onLogin, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      onLogin();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden px-4">
      
      {/* --- BACKGROUND BLOBS --- */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" 
        />
      </div>

      {/* --- LOGIN CARD --- */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } 
          }
        }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-900/50 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          
          {/* Header Section */}
          <motion.div variants={fadeInUp} className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-indigo-500/20"
            >
              <span className="text-white text-3xl font-bold italic">C</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-400 mt-2">Sign in to your Chimera account</p>
          </motion.div>

          {/* Form Section */}
          <div className="space-y-5 flex flex-col items-center">
            <motion.div variants={fadeInUp} className="w-full">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 rounded-xl focus:border-indigo-500 outline-none transition-all"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="w-full">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 rounded-xl focus:border-indigo-500 outline-none transition-all"
              />
            </motion.div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto", x: [-4, 4, -4, 4, 0] }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full bg-red-500/10 border border-red-500/20 py-2 px-4 rounded-lg overflow-hidden"
                >
                  <p className="text-xs text-red-400 text-center font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CENTERED BUTTON SECTION */}
            <motion.div 
              variants={fadeInUp} 
              className="w-full flex justify-center pt-2"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button 
                  onClick={handleLogin} 
                  disabled={loading}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex justify-center items-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Footer Section */}
          <motion.div variants={fadeInUp} className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-slate-400">
              New to Chimera?{" "}
              <button
                onClick={goToRegister}
                className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
              >
                Create an account
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}