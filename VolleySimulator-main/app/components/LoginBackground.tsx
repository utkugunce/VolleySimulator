import { memo } from 'react';

const LoginBackground = memo(function LoginBackground() {
    return (
        <>
            {/* Background with Modern Gradient & Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black -z-20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10"></div>

            {/* Ambient Light Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] -z-10"></div>
        </>
    );
});

export default LoginBackground;
