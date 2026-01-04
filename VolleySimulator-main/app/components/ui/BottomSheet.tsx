"use client";

import * as React from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
    className,
}: BottomSheetProps) {
    // Use useEffect to handle body scroll lock
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 z-[120] flex flex-col rounded-t-[32px] bg-surface-primary border-t border-border-main shadow-2xl safe-p-bottom max-h-[90vh]",
                            className
                        )}
                    >
                        {/* Handle / Drag Bar */}
                        <div className="flex w-full items-center justify-center p-4">
                            <div className="h-1.5 w-12 rounded-full bg-surface-secondary" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-6 pb-4">
                                {title && (
                                    <h2 className="text-xl font-black text-text-primary tracking-tight">
                                        {title}
                                    </h2>
                                )}
                                <button
                                    onClick={onClose}
                                    className="rounded-full bg-surface-secondary p-1.5 text-text-muted hover:text-text-primary transition-colors"
                                    aria-label="Kapat"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
