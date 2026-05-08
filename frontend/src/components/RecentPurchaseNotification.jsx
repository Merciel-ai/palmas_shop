import React, { useState, useEffect } from 'react';

const RecentPurchaseNotification = () => {
  const [notifications, setNotifications] = useState([]);

  // Sample recent purchases (in real app, fetch from backend)
  const recentPurchases = [
    { name: 'Someone in Douala', product: 'PALMAS CHROME HOODIE', time: '2 minutes ago' },
    { name: 'Someone in Yaoundé', product: 'PALMAS CROSS TEE', time: '5 minutes ago' },
    { name: 'Someone in Paris', product: 'PALMAS LEGACY CAP', time: '12 minutes ago' },
    { name: 'Someone in New York', product: 'PALMAS OVERSIZED TEE', time: '25 minutes ago' },
  ];

  useEffect(() => {
    // Show random notifications
    const interval = setInterval(() => {
      const random = recentPurchases[Math.floor(Math.random() * recentPurchases.length)];
      const id = Date.now();
      setNotifications(prev => [...prev, { ...random, id }]);
      
      // Remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-24 left-4 z-40 space-y-2">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className="bg-gray-900 border-l-4 border-afro-orange rounded-lg p-3 shadow-xl animate-slide-up max-w-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-afro-orange/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🛒</span>
            </div>
            <div>
              <p className="text-sm text-white">
                <span className="font-bold text-afro-orange">{notif.name}</span> bought
              </p>
              <p className="text-xs text-gray-400">{notif.product} • {notif.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentPurchaseNotification;