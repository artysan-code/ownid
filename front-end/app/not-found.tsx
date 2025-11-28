import Header from './components/Header';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200 dark:text-neutral-800 mb-4">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Pagina Non Trovata
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              La pagina che stai cercando non esiste o è stata spostata.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/" 
              className="px-6 py-3 bg-violet-600 dark:bg-violet-700 text-white text-sm font-medium rounded-lg hover:bg-violet-700 dark:hover:bg-violet-600 transition-all hover:scale-105 hover:shadow-lg"
            >
              Torna alla Home
            </a>
            <a 
              href="/funzionalita" 
              className="px-6 py-3 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all hover:scale-105"
            >
              Esplora Funzionalità
            </a>
          </div>
          
          <div className="mt-12 pt-12 border-t border-gray-200 dark:border-neutral-800">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Hai bisogno di aiuto? Controlla le nostre pagine:
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <a href="/tecnologia" className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                Tecnologia
              </a>
              <span className="text-gray-300 dark:text-neutral-700">•</span>
              <a href="/progetto" className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                Il Progetto
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
