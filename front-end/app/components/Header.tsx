'use client';

import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="OwnID Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">OwnID</span>
        </a>
        
        <nav className="hidden md:flex gap-8 text-sm text-gray-600 dark:text-gray-400 absolute left-1/2 -translate-x-1/2">
          <a
            href="/funzionalita"
            className={`relative group transition-colors ${
              isActive('/funzionalita')
                ? 'text-gray-900 dark:text-gray-200'
                : 'hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Funzionalità
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-violet-600 dark:bg-violet-400 transition-all ${
                isActive('/funzionalita') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            ></span>
          </a>
          <a
            href="/tecnologia"
            className={`relative group transition-colors ${
              isActive('/tecnologia')
                ? 'text-gray-900 dark:text-gray-200'
                : 'hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Tecnologia
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-violet-600 dark:bg-violet-400 transition-all ${
                isActive('/tecnologia') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            ></span>
          </a>
          <a
            href="/progetto"
            className={`relative group transition-colors ${
              isActive('/progetto')
                ? 'text-gray-900 dark:text-gray-200'
                : 'hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Il Progetto
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-violet-600 dark:bg-violet-400 transition-all ${
                isActive('/progetto') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            ></span>
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Accedi
          </a>
          <a
            href="/registrati"
            className="px-4 py-2 bg-violet-600 dark:bg-violet-700 text-white text-sm font-medium rounded-lg hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors"
          >
            Registrati
          </a>
        </div>
      </div>
    </header>
  );
}
