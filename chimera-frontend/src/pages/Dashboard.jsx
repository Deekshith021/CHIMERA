import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { apiRequest } from "../api/client";

export default function Dashboard({ openProject }) {
    const [projects, setProjects] = useState([]);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadProjects() {
        try {
            setError("");
            const data = await apiRequest("/projects/");
            setProjects(data);
        } catch (err) {
            setError(err.message || "Failed to load projects");
        }
    }

    async function createProject() {
        if (!prompt.trim()) return;
        try {
            setLoading(true);
            setError("");
            await apiRequest("/projects/", "POST", { prompt });
            setPrompt("");
            loadProjects();
        } catch (err) {
            setError(err.message || "Failed to create project");
        } finally {
            setLoading(false);
        }
    }

    async function deleteProject(id) {
        if (!confirm("Delete this project?")) return;
        try {
            await apiRequest(`/projects/${id}`, "DELETE");
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            setError("Failed to delete project");
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] -z-10 rounded-full" />

            <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                
                {/* Header & Create Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Studio
                        </h2>
                        <p className="text-slate-400 mt-1">Manage and create your video projects.</p>
                    </div>

                    <div className="relative group max-w-2xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                        <div className="relative flex flex-col sm:flex-row gap-3 bg-slate-900/50 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                            <Input
                                placeholder="What's your next big idea?"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-lg h-12 flex-grow"
                            />
                            <Button 
                                onClick={createProject} 
                                disabled={loading || !prompt.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-xl shadow-lg shadow-indigo-900/20"
                            >
                                {loading ? "Creating..." : "Generate"}
                            </Button>
                        </div>
                        {error && <p className="text-red-400 text-xs mt-3 ml-2 italic">{error}</p>}
                    </div>
                </motion.div>

                {/* Projects Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                variants={itemVariants}
                                layout
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -5 }}
                            >
                                <Card className="bg-slate-900/40 backdrop-blur-md border-white/5 hover:border-indigo-500/50 transition-colors duration-300 p-0 overflow-hidden group">
                                    <div className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                                project.status === 'completed' 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                            }`}>
                                                {project.status}
                                            </span>
                                        </div>

                                        <p className="text-slate-200 font-semibold line-clamp-2 h-12 leading-relaxed">
                                            {project.prompt}
                                        </p>

                                        <div className="pt-4 flex items-center gap-3">
                                            <Button
                                                className="flex-grow bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                                                onClick={() => openProject(project.id)}
                                            >
                                                Open Studio
                                            </Button>
                                            <button
                                                onClick={() => deleteProject(project.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"></div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {projects.length === 0 && !loading && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl"
                        >
                            <p className="text-slate-500">No projects found. Use the prompt above to create your first one.</p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}