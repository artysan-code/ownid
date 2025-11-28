import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20">
        <div className="text-center max-w-3xl mx-auto pt-32 pb-20 animate-fade-in">
          <div className="inline-block mb-6 px-3 py-1 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 rounded-full text-xs text-violet-700 dark:text-violet-400 animate-slide-down">
            Costruito su Avalanche
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight animate-slide-up">
            La Tua Identità,
            <br />
            <span className="text-violet-600 dark:text-violet-400">Il Tuo Controllo</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto animate-slide-up-delay">
            Un identity provider sicuro e orientato alla privacy, costruito su tecnologia blockchain. 
            Controllo completo sulla tua identità digitale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-2">
            <a href="/login" className="px-6 py-3 bg-violet-600 dark:bg-violet-700 text-white text-sm font-medium rounded-lg hover:bg-violet-700 dark:hover:bg-violet-600 transition-all hover:scale-105 hover:shadow-lg text-center">
              Inizia Ora
            </a>
            <a href="/funzionalita" className="px-6 py-3 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all hover:scale-105 text-center">
              Scopri di Più
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid md:grid-cols-3 gap-6 mb-32">
          <div className="group p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Sicuro per Progettazione</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Sfrutta la tecnologia blockchain per una verifica dell'identità immutabile e autenticazione sicura.
            </p>
          </div>

          <div className="group p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Privacy al Primo Posto</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              I tuoi dati appartengono a te. Non memorizziamo né vendiamo le tue informazioni personali.
            </p>
          </div>

          <div className="group p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Velocità Fulminea</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Alimentato da Avalanche per una verifica dell'identità istantanea e un'esperienza utente fluida.
            </p>
          </div>
        </div>

        {/* Technology Section */}
        <div id="technology" className="text-center max-w-3xl mx-auto mb-32">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            Costruito su Tecnologie All'Avanguardia
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
            Sfrutta l'ecosistema blockchain di Avalanche per una soluzione di gestione dell'identità 
            decentralizzata, sicura e scalabile.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-800 transition-all hover:scale-105 cursor-default">
              Blockchain Avalanche
            </span>
            <span className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-800 transition-all hover:scale-105 cursor-default">
              Smart Contracts
            </span>
            <span className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-800 transition-all hover:scale-105 cursor-default">
              Zero-Knowledge Proofs
            </span>
            <span className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-800 transition-all hover:scale-105 cursor-default">
              Storage Decentralizzato
            </span>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="mb-32 pb-32 border-b border-gray-200 dark:border-neutral-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Progetto per Hackathon Avalanche
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Sviluppato per l'Hackathon Avalanche presso l'Università di Tor Vergata. 
              La nostra missione è rivoluzionare la gestione dell'identità digitale.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
