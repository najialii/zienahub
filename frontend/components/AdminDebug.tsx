'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/userStore';

export default function AdminDebug() {
  const [mounted, setMounted] = useState(false);
  const { profile, isLoggedIn } = useUserStore();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-black text-white px-4 py-2 text-xs font-mono hover:bg-neutral-800 transition-colors"
      >
        {showDebug ? 'Hide' : 'Show'} Debug
      </button>

      {showDebug && (
        <div className="mt-2 bg-black text-white p-4 max-w-sm text-xs font-mono space-y-2 max-h-96 overflow-auto">
          <div>
            <strong className="text-green-400">Auth Status:</strong>
            <div className="ml-2">
              <div>Logged In: {isLoggedIn ? '✅ Yes' : '❌ No'}</div>
              <div>Is Tenant Admin: {profile?.role === 'tenant_admin' || profile?.role === 'admin' ? '✅ Yes' : '❌ No'}</div>
            </div>
          </div>

          <div>
            <strong className="text-blue-400">User Profile:</strong>
            <pre className="ml-2 text-xs overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          <div>
            <strong className="text-yellow-400">LocalStorage:</strong>
            <pre className="ml-2 text-xs overflow-auto">
              {typeof window !== 'undefined' 
                ? localStorage.getItem('zeina-user')?.substring(0, 200) + '...'
                : 'N/A'}
            </pre>
          </div>

          <div>
            <strong className="text-purple-400">Actions:</strong>
            <div className="ml-2 space-y-1 mt-1">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="block w-full text-left px-2 py-1 bg-red-600 hover:bg-red-700 transition-colors"
              >
                Clear & Reload
              </button>
              <button
                onClick={() => {
                  console.log('User Store:', useUserStore.getState());
                  console.log('LocalStorage:', localStorage.getItem('zeina-user'));
                }}
                className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Log to Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
