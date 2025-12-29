export default function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-xl",
        xl: "w-32 h-32 text-4xl"
    };

    return (
        <div className={`relative flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.3)] ${sizeClasses[size]} ${className}`}>
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20"></div>

            {/* Shiny Reflection */}
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-45 animate-pulse"></div>

            {/* Letters */}
            <div className="relative z-10 font-black italic tracking-tighter leading-none flex items-center justify-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-cyan-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    VS
                </span>
            </div>
        </div>
    );
}
