"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const { signUp, signInWithGoogle, user } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        favoriteTeam: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);

    // Redirect if already logged in
    if (user) {
        router.push('/profile');
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            if (!formData.name || !formData.email) {
                setError("Ad ve e-posta gerekli");
                return;
            }
            setError("");
            setStep(2);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Şifreler eşleşmiyor");
            return;
        }

        if (formData.password.length < 6) {
            setError("Şifre en az 6 karakter olmalı");
            return;
        }

        setIsLoading(true);
        setError("");

        const { error } = await signUp(formData.email, formData.password, {
            name: formData.name
        });

        if (error) {
            setError(error.message === "User already registered"
                ? "Bu e-posta zaten kayıtlı"
                : error.message
            );
            setIsLoading(false);
        } else {
            // Save favorite team to localStorage for now
            if (formData.favoriteTeam) {
                localStorage.setItem('favoriteTeam', formData.favoriteTeam);
            }
            router.push('/profile');
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                            VolleySimulator
                        </span>
                    </Link>
                    <h1 className="text-3xl font-black text-white">Kayıt Ol</h1>
                    <p className="text-slate-400 text-sm mt-2">Tahmin oyununa katıl ve XP kazan!</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}>
                            1
                        </div>
                        <span className="text-sm font-medium hidden sm:inline">Bilgiler</span>
                    </div>
                    <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-700'}`} />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}>
                            2
                        </div>
                        <span className="text-sm font-medium hidden sm:inline">Şifre</span>
                    </div>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="bg-slate-900/80 rounded-2xl border border-slate-700 p-6 space-y-4">
                    {error && (
                        <div className="bg-rose-900/30 border border-rose-600/50 rounded-lg p-3 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="Takma adın"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">E-posta</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="ornek@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Favori Takım (Opsiyonel)</label>
                                <select
                                    name="favoriteTeam"
                                    value={formData.favoriteTeam}
                                    onChange={handleChange}
                                    title="Favori Takım Seçin"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                >
                                    <option value="">Takım seç...</option>
                                    <option value="Fenerbahçe Medicana">Fenerbahçe Medicana</option>
                                    <option value="VakıfBank">VakıfBank</option>
                                    <option value="Eczacıbaşı Dynavit">Eczacıbaşı Dynavit</option>
                                    <option value="THY">THY</option>
                                    <option value="Galatasaray">Galatasaray</option>
                                </select>
                                <p className="text-xs text-amber-500 mt-1">+20% XP bonus favori takımın maçlarında!</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Şifre</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="En az 6 karakter"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Şifre Tekrar</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="Şifreyi tekrar gir"
                                    required
                                />
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                <div className="text-xs text-slate-400 mb-2">Kayıt olduğunda kazanacakların:</div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-bold">+50 XP</span>
                                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold">🎯 İlk Adım Rozeti</span>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex gap-3">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all"
                            >
                                ← Geri
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Kayıt yapılıyor...
                                </>
                            ) : step === 1 ? (
                                <>
                                    Devam Et →
                                </>
                            ) : (
                                <>
                                    <span>🎮</span> Kayıt Ol
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-slate-950 text-slate-500">veya</span>
                    </div>
                </div>

                {/* Google Sign Up */}
                <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google ile Kayıt Ol
                </button>

                {/* Login Link */}
                <p className="text-center mt-6 text-slate-400">
                    Zaten hesabın var mı?{" "}
                    <Link href="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </main>
    );
}
