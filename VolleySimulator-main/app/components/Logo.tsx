export default function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
    const sizeClasses = {
        sm: "w-9 h-8 text-sm",
        md: "w-12 h-10 text-base",
        lg: "w-20 h-16 text-2xl",
        xl: "w-40 h-32 text-5xl"
    };

    return (
        <div className={`relative flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.3)] ${sizeClasses[size]} ${className}`}>
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20"></div>

            {/* Shiny Reflection */}
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-45 animate-pulse"></div>

            {/* Letters */}
            <div className="relative z-10 font-black italic leading-none flex items-center justify-center pl-1 pr-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-cyan-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    VS
                </span>
            </div>
        </div>
    );
}

