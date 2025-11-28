import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Funzionalita() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            Funzionalità
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 leading-relaxed">
            OwnID offre un set completo di funzionalità per gestire la tua identità digitale in modo sicuro e privato.
          </p>

          {/* Feature Cards */}
          <div className="space-y-12">
            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Autenticazione Blockchain
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Utilizza la potenza della blockchain Avalanche per un'autenticazione sicura e decentralizzata. 
                  Ogni verifica è immutabile e tracciabile sulla blockchain.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Verifica dell'identità on-chain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Autenticazione multi-fattore decentralizzata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Recovery sicuro tramite smart contract</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Privacy Avanzata
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  I tuoi dati personali sono protetti con tecnologie crittografiche all'avanguardia. 
                  Solo tu hai accesso alle tue informazioni.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Zero-Knowledge Proofs per la verifica dell'identità</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Crittografia end-to-end dei dati personali</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Controllo granulare sulla condivisione dei dati</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Prestazioni Elevate
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Sfrutta la velocità di Avalanche per transazioni istantanee e un'esperienza utente fluida.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Finalità delle transazioni in meno di 2 secondi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Scalabilità per migliaia di transazioni al secondo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Costi di transazione minimi</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Interoperabilità
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Integrazione semplice con applicazioni esistenti e supporto per standard aperti.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>API RESTful e SDK per sviluppatori</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Supporto per standard OAuth 2.0 e OpenID Connect</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Compatibilità cross-chain</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/50 rounded-lg text-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pronto a iniziare?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Scopri come OwnID può proteggere la tua identità digitale.
            </p>
            <a href="/" className="inline-block px-6 py-3 bg-violet-600 dark:bg-violet-700 text-white text-sm font-medium rounded-lg hover:bg-violet-700 dark:hover:bg-violet-600 transition-all hover:scale-105">
              Torna alla Home
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
