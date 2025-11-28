'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Dashboard() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [token, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Caricamento...</div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col">
      <Header />
      
      <main className="flex-1 px-6 pt-24 pb-20 max-w-4xl mx-auto w-full animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Benvenuto nel tuo spazio personale
          </p>
        </div>

        <div className="grid gap-6">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Profilo Utente
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Nome
                </label>
                <div className="text-gray-900 dark:text-gray-100 text-lg">
                  {user?.nome}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Cognome
                </label>
                <div className="text-gray-900 dark:text-gray-100 text-lg">
                  {user?.cognome}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Email
                </label>
                <div className="text-gray-900 dark:text-gray-100 text-lg">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  ID Utente
                </label>
                <div className="text-gray-900 dark:text-gray-100 text-sm font-mono">
                  {user?.id}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Blockchain Identity
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                La tua identità blockchain sarà disponibile dopo l'integrazione con Avalanche.
              </p>
              
              <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-900/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-400 mb-2">
                  Funzionalità in arrivo:
                </h3>
                <ul className="space-y-2 text-sm text-violet-800 dark:text-violet-300">
                  <li>Wallet Avalanche integrato</li>
                  <li>Gestione identità decentralizzata</li>
                  <li>Verifica credenziali on-chain</li>
                  <li>Single Sign-On cross-platform</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Azioni Account
            </h2>
            
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-700 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
