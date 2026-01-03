import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../components/Input";
import Button from "../components/Button";
import { apiRequest } from "../api/client";

export default function Register({ goToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      
      await apiRequest("/auth/register", "POST", {
        email,
        password,
      });

      setMessage("Account created successfully!");
      // Optional: auto-redirect to login after 2 seconds
      setTimeout(() => goToLogin(), 2000);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden font-sans">
      
      {/* --- BACKGROUND ANIMATIONS (Consistent with Login) --- */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" 
        />
      </div>

      {/* --- REGISTER CARD --- */}
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
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-slate-900/50 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-slate-400 mt-2">Join the Chimera community today</p>
          </motion.div>

          <div className="space-y-4">
            <motion.div variants={fadeInUp}>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 rounded-xl focus:border-indigo-500 outline-none transition-all"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Input
                type="password"
                placeholder="Create Password"
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
                  className="bg-red-500/10 border border-red-500/20 py-2 px-4 rounded-lg overflow-hidden"
                >
                  <p className="text-xs text-red-400 text-center font-medium">{error}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 py-2 px-4 rounded-lg overflow-hidden"
                >
                  <p className="text-xs text-emerald-400 text-center font-medium">{message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeInUp} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={handleRegister} 
                disabled={loading || message}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : message ? "Success!" : "Sign Up"}
              </Button>
            </motion.div>
          </div>

          <motion.div variants={fadeInUp} className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <button
                onClick={goToLogin}
                className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
              >
                Log in here
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}