"use client";

import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";

interface ShareButtonProps {
    targetRef: React.RefObject<HTMLElement | null>;
    championName?: string;
    className?: string;
}

export default function ShareButton({ targetRef, championName, className = "" }: ShareButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleShare = useCallback(async () => {
        if (!targetRef.current) return;

        setIsLoading(true);
        try {
            // Create a wrapper with watermark
            const element = targetRef.current;

            const dataUrl = await toPng(element, {
                backgroundColor: "#0f172a",
                pixelRatio: 2,
                style: {
                    transform: "scale(1)",
                    transformOrigin: "top left",
                }
            });

            // Create canvas to add watermark
            const img = new Image();
            img.src = dataUrl;

            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height + 80; // Extra space for watermark

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Fill background
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the captured image
            ctx.drawImage(img, 0, 0);

            // Add watermark bar
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(0, img.height, canvas.width, 80);

            // Add champion text
            ctx.fillStyle = "#fbbf24";
            ctx.font = "bold 24px system-ui, sans-serif";
            ctx.textAlign = "center";

            const text = championName
                ? `🏆 Benim Senaryoma Göre Şampiyon: ${championName}`
                : "🏐 VolleySimulator - Sezon Senaryom";
            ctx.fillText(text, canvas.width / 2, img.height + 50);

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `senaryo-${new Date().toLocaleDateString("tr-TR")}.png`;
                a.click();
                URL.revokeObjectURL(url);
            }, "image/png");

        } catch (err) {
            console.error("Share failed:", err);
        } finally {
            setIsLoading(false);
        }
    }, [targetRef, championName]);

    return (
        <button
            onClick={handleShare}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait ${className}`}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>İndiriliyor...</span>
                </>
            ) : (
                <>
                    <span>Paylaş</span>
                </>
            )}
        </button>
    );
}
