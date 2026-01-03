'use client';

import { usePushNotifications } from '@/app/hooks/usePushNotifications';

interface NotificationToggleProps {
  className?: string;
}

export function NotificationToggle({ className = '' }: NotificationToggleProps) {
  const { isSupported, isSubscribed, isLoading, error, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className={`text-slate-500 text-sm ${className}`}>
        Tarayıcınız bildirimleri desteklemiyor
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">Maç Bildirimleri</h3>
          <p className="text-sm text-slate-400">
            Maçlar başlamadan önce hatırlatma al
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            isSubscribed ? 'bg-emerald-600' : 'bg-slate-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
              isSubscribed ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      
      {isSubscribed && (
        <p className="text-sm text-emerald-400">
          ✓ Bildirimler aktif
        </p>
      )}
    </div>
  );
}
