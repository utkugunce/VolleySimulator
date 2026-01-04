"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Coins, 
    Zap, 
    Shield, 
    Sparkles, 
    Palette, 
    Crown,
    Star,
    Check,
    Lock,
    ShoppingCart,
    Package
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { ShopItem, BadgeRarity, BADGE_RARITY_COLORS } from '../types';
import { useToast } from '../components';

// ============================================
// SHOP ITEMS DATA
// ============================================
const SHOP_ITEMS: ShopItem[] = [
    // BOOSTERS
    {
        id: 'boost-double-xp',
        name: 'Çift XP',
        description: 'Sonraki 5 tahmin için kazanılan XP 2 katına çıkar',
        icon: '⚡',
        category: 'boost',
        price: 150,
        rarity: 'uncommon',
        isLimited: false
    },
    {
        id: 'boost-triple-coins',
        name: 'Üç Kat Coin',
        description: 'Sonraki 3 doğru tahmin için 3x coin kazan',
        icon: '💰',
        category: 'boost',
        price: 200,
        rarity: 'rare',
        isLimited: false
    },
    {
        id: 'freeze-streak',
        name: 'Seri Dondurma',
        description: 'Bir yanlış tahminde serin sıfırlanmasın',
        icon: '🧊',
        category: 'freeze',
        price: 100,
        rarity: 'common',
        isLimited: false
    },
    {
        id: 'boost-prediction-hint',
        name: 'Tahmin İpucu',
        description: 'AI destekli maç analizi ve kazanma olasılıkları',
        icon: '🔮',
        category: 'boost',
        price: 75,
        rarity: 'common',
        isLimited: false
    },
    {
        id: 'boost-lucky-charm',
        name: 'Şans Tılsımı',
        description: 'Beraberlik durumunda ekstra puan kazandırır',
        icon: '🍀',
        category: 'boost',
        price: 125,
        rarity: 'uncommon',
        isLimited: false
    },

    // COSMETICS - Avatar Frames
    {
        id: 'avatar-gold-frame',
        name: 'Altın Çerçeve',
        description: 'Profiline altın çerçeve ekle',
        icon: '🖼️',
        category: 'avatar',
        price: 300,
        rarity: 'rare',
        isLimited: false
    },
    {
        id: 'avatar-diamond-frame',
        name: 'Elmas Çerçeve',
        description: 'Işıldayan elmas çerçeve',
        icon: '💎',
        category: 'avatar',
        price: 500,
        rarity: 'epic',
        isLimited: false
    },
    {
        id: 'avatar-fire-frame',
        name: 'Ateş Çerçevesi',
        description: 'Animasyonlu ateş efektli çerçeve',
        icon: '🔥',
        category: 'avatar',
        price: 750,
        rarity: 'legendary',
        isLimited: true,
        availableUntil: '2026-02-01'
    },
    {
        id: 'badge-vip',
        name: 'VIP Rozeti',
        description: 'Özel VIP rozeti',
        icon: '👑',
        category: 'badge',
        price: 400,
        rarity: 'epic',
        isLimited: false
    },
    {
        id: 'badge-pro',
        name: 'Pro Analist Rozeti',
        description: 'Profesyonel analist rozeti',
        icon: '📊',
        category: 'badge',
        price: 250,
        rarity: 'rare',
        isLimited: false
    },

    // THEMES
    {
        id: 'theme-fenerbahce',
        name: 'Fenerbahçe Teması',
        description: 'Sarı-lacivert tema renkleri',
        icon: '💛',
        category: 'theme',
        price: 200,
        rarity: 'uncommon',
        isLimited: false
    },
    {
        id: 'theme-eczacibasi',
        name: 'Eczacıbaşı Teması',
        description: 'Mavi tema renkleri',
        icon: '💙',
        category: 'theme',
        price: 200,
        rarity: 'uncommon',
        isLimited: false
    },
    {
        id: 'theme-vakifbank',
        name: 'VakıfBank Teması',
        description: 'Sarı-turuncu tema renkleri',
        icon: '🧡',
        category: 'theme',
        price: 200,
        rarity: 'uncommon',
        isLimited: false
    },
    {
        id: 'theme-galatasaray',
        name: 'Galatasaray Teması',
        description: 'Sarı-kırmızı tema renkleri',
        icon: '❤️',
        category: 'theme',
        price: 200,
        rarity: 'uncommon',
        isLimited: false
    },
    {
        id: 'theme-neon',
        name: 'Neon Cyberpunk',
        description: 'Futuristik neon tema',
        icon: '🌈',
        category: 'theme',
        price: 350,
        rarity: 'rare',
        isLimited: false
    },
    {
        id: 'theme-gold-premium',
        name: 'Altın Premium',
        description: 'Lüks altın tema',
        icon: '✨',
        category: 'theme',
        price: 600,
        rarity: 'legendary',
        isLimited: true,
        availableUntil: '2026-03-01'
    }
];

type Category = 'all' | 'boost' | 'freeze' | 'avatar' | 'badge' | 'theme';

const CATEGORIES: { id: Category; name: string; icon: React.ReactNode }[] = [
    { id: 'all', name: 'Tümü', icon: <Package className="w-4 h-4" /> },
    { id: 'boost', name: 'Boost\'lar', icon: <Zap className="w-4 h-4" /> },
    { id: 'freeze', name: 'Korumalar', icon: <Shield className="w-4 h-4" /> },
    { id: 'avatar', name: 'Çerçeveler', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'badge', name: 'Rozetler', icon: <Crown className="w-4 h-4" /> },
    { id: 'theme', name: 'Temalar', icon: <Palette className="w-4 h-4" /> },
];

function getRarityGradient(rarity: BadgeRarity): string {
    return BADGE_RARITY_COLORS[rarity] || BADGE_RARITY_COLORS.common;
}

function ShopItemCard({ 
    item, 
    isOwned, 
    canAfford, 
    onPurchase 
}: { 
    item: ShopItem; 
    isOwned: boolean;
    canAfford: boolean;
    onPurchase: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            className={`relative bg-surface-primary border rounded-2xl p-4 transition-all ${
                isOwned 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border-subtle hover:border-primary/30'
            }`}
        >
            {/* Rarity indicator */}
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${getRarityGradient(item.rarity)}`} />
            
            {/* Limited badge */}
            {item.isLimited && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-bold text-amber-400">
                    SINIRLI
                </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-3 mt-2">{item.icon}</div>

            {/* Name & Description */}
            <h3 className="font-bold text-text-primary mb-1">{item.name}</h3>
            <p className="text-xs text-text-muted mb-4 line-clamp-2">{item.description}</p>

            {/* Price & Action */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className={`font-bold ${canAfford ? 'text-text-primary' : 'text-red-400'}`}>
                        {item.price}
                    </span>
                </div>

                {isOwned ? (
                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Sahipsin
                    </div>
                ) : (
                    <button
                        onClick={onPurchase}
                        disabled={!canAfford}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                            canAfford
                                ? 'bg-primary text-white hover:bg-primary-dark'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {canAfford ? (
                            <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Satın Al
                            </>
                        ) : (
                            <>
                                <Lock className="w-3.5 h-3.5" />
                                Yetersiz
                            </>
                        )}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export default function ShopPage() {
    const { wallet, inventory, purchaseItem, ownsItem, isLoaded } = useWallet();
    const { showToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);

    const filteredItems = SHOP_ITEMS.filter(item => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'boost') return item.category === 'boost';
        if (selectedCategory === 'freeze') return item.category === 'freeze';
        return item.category === selectedCategory;
    });

    const handlePurchase = (item: ShopItem) => {
        const result = purchaseItem(item);
        
        if (result.success) {
            setPurchaseAnimation(item.id);
            showToast(result.message, 'success');
            setTimeout(() => setPurchaseAnimation(null), 1000);
        } else {
            showToast(result.message, 'error');
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Mağaza</h1>
                            <p className="text-white/70 text-sm mt-1">
                                Coinlerini harca, güçlen!
                            </p>
                        </div>
                        
                        {/* Wallet Display */}
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2">
                            <Coins className="w-5 h-5 text-amber-300" />
                            <span className="text-xl font-bold text-white">{wallet.coins}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                selectedCategory === cat.id
                                    ? 'bg-primary text-white'
                                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {cat.icon}
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-surface-primary border border-border-subtle rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{wallet.totalEarned}</div>
                        <div className="text-xs text-text-muted">Toplam Kazanılan</div>
                    </div>
                    <div className="bg-surface-primary border border-border-subtle rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-accent">{wallet.totalSpent}</div>
                        <div className="text-xs text-text-muted">Toplam Harcanan</div>
                    </div>
                    <div className="bg-surface-primary border border-border-subtle rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-text-primary">{inventory.length}</div>
                        <div className="text-xs text-text-muted">Envanter</div>
                    </div>
                </div>

                {/* Items Grid */}
                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <ShopItemCard
                                key={item.id}
                                item={item}
                                isOwned={ownsItem(item.id)}
                                canAfford={wallet.coins >= item.price}
                                onPurchase={() => handlePurchase(item)}
                            />
                        ))}
                    </div>
                </AnimatePresence>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-text-muted">
                        Bu kategoride ürün bulunmuyor.
                    </div>
                )}

                {/* Inventory Section */}
                {inventory.length > 0 && (
                    <div className="mt-8">
                        <h2 className="font-bold text-text-primary mb-4">Envanterin</h2>
                        <div className="flex flex-wrap gap-2">
                            {inventory.map(itemId => {
                                const item = SHOP_ITEMS.find(i => i.id === itemId);
                                if (!item) return null;
                                return (
                                    <div
                                        key={itemId}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-surface-secondary rounded-full text-sm"
                                    >
                                        <span>{item.icon}</span>
                                        <span className="text-text-primary">{item.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* How to Earn Coins */}
                <div className="mt-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        Coin Nasıl Kazanılır?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                ✓
                            </div>
                            <span className="text-text-secondary">Günlük görevleri tamamla</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                🎯
                            </div>
                            <span className="text-text-secondary">Doğru tahminler yap</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                🔥
                            </div>
                            <span className="text-text-secondary">Seri yakala (3+)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                🏆
                            </div>
                            <span className="text-text-secondary">Başarımları aç</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
