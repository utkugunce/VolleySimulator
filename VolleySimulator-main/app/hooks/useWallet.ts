"use client";

import { useState, useEffect, useCallback } from 'react';
import { UserWallet, CoinTransaction, ShopItem } from '../types';

const WALLET_STORAGE_KEY = 'volleySim_wallet';
const INVENTORY_STORAGE_KEY = 'volleySim_inventory';

interface WalletState {
    wallet: UserWallet;
    inventory: string[]; // Item IDs owned by user
}

const getInitialWallet = (): UserWallet => ({
    userId: 'local-user',
    coins: 500, // Starting coins
    totalEarned: 500,
    totalSpent: 0,
    transactions: [{
        id: 'welcome-bonus',
        type: 'earn',
        amount: 500,
        reason: 'Hoş geldin bonusu',
        createdAt: new Date().toISOString()
    }]
});

export function useWallet() {
    const [wallet, setWallet] = useState<UserWallet>(getInitialWallet);
    const [inventory, setInventory] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage
    useEffect(() => {
        try {
            const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
            const savedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
            
            if (savedWallet) {
                setWallet(JSON.parse(savedWallet));
            }
            if (savedInventory) {
                setInventory(JSON.parse(savedInventory));
            }
        } catch (e) {
            console.error('Failed to load wallet:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
            localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
        }
    }, [wallet, inventory, isLoaded]);

    // Add coins
    const addCoins = useCallback((amount: number, reason: string, metadata?: Record<string, unknown>) => {
        const transaction: CoinTransaction = {
            id: `txn-${Date.now()}`,
            type: 'earn',
            amount,
            reason,
            metadata,
            createdAt: new Date().toISOString()
        };

        setWallet(prev => ({
            ...prev,
            coins: prev.coins + amount,
            totalEarned: prev.totalEarned + amount,
            transactions: [transaction, ...prev.transactions].slice(0, 100) // Keep last 100
        }));
    }, []);

    // Spend coins
    const spendCoins = useCallback((amount: number, reason: string, metadata?: Record<string, unknown>): boolean => {
        if (wallet.coins < amount) return false;

        const transaction: CoinTransaction = {
            id: `txn-${Date.now()}`,
            type: 'spend',
            amount,
            reason,
            metadata,
            createdAt: new Date().toISOString()
        };

        setWallet(prev => ({
            ...prev,
            coins: prev.coins - amount,
            totalSpent: prev.totalSpent + amount,
            transactions: [transaction, ...prev.transactions].slice(0, 100)
        }));

        return true;
    }, [wallet.coins]);

    // Purchase item
    const purchaseItem = useCallback((item: ShopItem): { success: boolean; message: string } => {
        if (inventory.includes(item.id)) {
            return { success: false, message: 'Bu ürün zaten envaterinizde!' };
        }

        if (wallet.coins < item.price) {
            return { success: false, message: 'Yetersiz coin!' };
        }

        const success = spendCoins(item.price, `${item.name} satın alındı`, { itemId: item.id });
        
        if (success) {
            setInventory(prev => [...prev, item.id]);
            return { success: true, message: `${item.name} satın alındı!` };
        }

        return { success: false, message: 'İşlem başarısız!' };
    }, [wallet.coins, inventory, spendCoins]);

    // Check if item is owned
    const ownsItem = useCallback((itemId: string): boolean => {
        return inventory.includes(itemId);
    }, [inventory]);

    // Get active boosters
    const getActiveBoosters = useCallback((): string[] => {
        return inventory.filter(id => 
            id.startsWith('boost-') || id.startsWith('freeze-')
        );
    }, [inventory]);

    // Use a consumable item (remove from inventory)
    const useItem = useCallback((itemId: string): boolean => {
        if (!inventory.includes(itemId)) return false;
        
        setInventory(prev => prev.filter(id => id !== itemId));
        return true;
    }, [inventory]);

    return {
        wallet,
        inventory,
        isLoaded,
        addCoins,
        spendCoins,
        purchaseItem,
        ownsItem,
        getActiveBoosters,
        useItem
    };
}
