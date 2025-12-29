"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { signIn, signInWithGoogle, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  if (user) {
    router.push('/profile');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "E-posta veya şifre hatalı"
        : error.message
      );
      setIsLoading(false);
    } else {
      router.push('/profile');
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background with Modern Gradient & Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black -z-20"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10"></div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-emerald-400/30 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-[20%] right-[20%] w-3 h-3 bg-teal-400/20 rounded-full animate-float-slow" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-[60%] left-[10%] w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] right-[10%] w-2 h-2 bg-emerald-500/20 rounded-full animate-float-slow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-[30%] left-[25%] w-2.5 h-2.5 bg-amber-400/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[20%] right-[30%] w-1.5 h-1.5 bg-orange-400/30 rounded-full animate-float-slow" style={{ animationDelay: '2.5s' }}></div>
      </div>

      {/* Ambient Light Effects - Enhanced */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] -z-10 animate-pulse-glow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[200px] -z-10"></div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Left Side: Brand & Features (Desktop) */}
        <div className="hidden lg:block space-y-8 animate-fade-in-left">
          <div className="space-y-2">
            <div className="inline-block">
              <span className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                VolleySimulator
              </span>
            </div>
            <h2 className="text-2xl font-light text-slate-300">
              Voleybol Tutkunları İçin <br />
              <span className="font-semibold text-white">Yeni Nesil Simülasyon</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="stagger-item bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl card-shine hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02]">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-bold text-white mb-1">Tahmin Oyunu</h3>
              <p className="text-sm text-slate-400">Maç skorlarını tahmin et, puanları topla ve liderliğe yüksel.</p>
            </div>
            <div className="stagger-item bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl card-shine hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02]">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-white mb-1">Detaylı Analiz</h3>
              <p className="text-sm text-slate-400">Takım form durumları ve yapay zeka destekli maç analizleri.</p>
            </div>
            <div className="stagger-item bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl card-shine hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02]">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-white mb-1">Canlı Skor</h3>
              <p className="text-sm text-slate-400">Maç sonuçlarını anlık takip et, ligdeki gelişmeleri kaçırma.</p>
            </div>
            <div className="stagger-item bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl card-shine hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02]">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="font-bold text-white mb-1">Topluluk</h3>
              <p className="text-sm text-slate-400">Diğer voleybol severlerle yarış ve sıralamada yerini al.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md mx-auto lg:ml-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl p-8 animate-fade-in-up card-shine">

            {/* Mobile Header (Visible only on mobile) */}
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-block mb-2">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                  VolleySimulator
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">Hoş Geldiniz</h1>
            </div>

            <div className="text-center mb-6 hidden lg:block">
              <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
              <p className="text-slate-400 text-sm">Hesabınıza erişmek için bilgilerinizi girin</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-posta</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-focus-within:opacity-30 transition-opacity duration-300"></div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 relative z-10"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Şifre</label>
                  <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors hover-underline">
                    Unuttum?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-focus-within:opacity-30 transition-opacity duration-300"></div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 relative z-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 btn-press relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-[#0a0f1e] text-slate-500 rounded-full">veya</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 btn-press group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google ile devam et
            </button>

            <div className="mt-8 text-center text-sm">
              <span className="text-slate-400">Hesabın yok mu? </span>
              <Link href="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                Hemen Kayıt Ol
              </Link>
            </div>
          </div>

          {/* Skip Link (Subtle) */}
          <div className="text-center mt-6">
            <Link href="/1lig/tahminoyunu" className="text-slate-500 text-xs hover:text-slate-300 transition-colors flex items-center justify-center gap-1 group">
              Giriş yapmadan siteye göz at
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-left {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
                .animate-fade-in-left {
                    animation: fade-in-left 0.6s ease-out forwards;
                    animation-delay: 0.2s;
                    opacity: 0;
                }
            `}</style>
    </main>
  );
}
