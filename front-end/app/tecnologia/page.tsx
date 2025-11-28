import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Tecnologia() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            Tecnologia
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 leading-relaxed">
            OwnID è costruito su tecnologie blockchain all'avanguardia per garantire sicurezza, scalabilità e privacy.
          </p>

          {/* Technology Stack */}
          <div className="space-y-12">
            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Blockchain Avalanche
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Avalanche è una piattaforma blockchain ad alte prestazioni che supporta migliaia di transazioni al secondo 
                  con finalità sub-secondo. La sua architettura unica a più catene permette di creare applicazioni decentralizzate 
                  scalabili e sicure.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-gray-50 dark:bg-neutral-950 rounded-lg">
                    <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">
                      &lt;2s
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Finalità transazioni</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-950 rounded-lg">
                    <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">
                      4,500+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">TPS supportate</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-950 rounded-lg">
                    <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">
                      EVM
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Compatibile</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Smart Contracts
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Gli smart contract sono il cuore di OwnID. Scriviamo contratti sicuri e verificati che gestiscono 
                  l'autenticazione, la verifica dell'identità e il controllo degli accessi in modo completamente decentralizzato.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Scritti in Solidity per compatibilità EVM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Audit di sicurezza completi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Pattern upgradeable per miglioramenti futuri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Gas optimization per ridurre i costi</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Zero-Knowledge Proofs
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Le Zero-Knowledge Proofs permettono di verificare informazioni senza rivelare i dati sottostanti. 
                  Questa tecnologia crittografica avanzata è fondamentale per garantire la privacy degli utenti.
                </p>
                <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Esempio:</strong> Puoi dimostrare di avere più di 18 anni senza rivelare la tua data di nascita esatta.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Storage Decentralizzato
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  I dati personali sono crittografati e archiviati in modo decentralizzato utilizzando tecnologie 
                  come IPFS. Nessun server centrale ha accesso alle tue informazioni.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Storage distribuito su rete IPFS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Crittografia end-to-end</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-1">✓</span>
                    <span>Solo tu hai le chiavi di decrittazione</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  API & SDK
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Fornisce API RESTful e SDK per JavaScript, Python e Go per facilitare l'integrazione con 
                  applicazioni esistenti.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-950 text-xs text-gray-700 dark:text-gray-300 rounded-md">JavaScript/TypeScript</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-950 text-xs text-gray-700 dark:text-gray-300 rounded-md">Python</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-950 text-xs text-gray-700 dark:text-gray-300 rounded-md">Go</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-950 text-xs text-gray-700 dark:text-gray-300 rounded-md">REST API</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-950 text-xs text-gray-700 dark:text-gray-300 rounded-md">GraphQL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div className="mt-16 p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Architettura del Sistema
            </h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="w-32 font-medium text-gray-900 dark:text-gray-100">Frontend</div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800"></div>
                <div>Next.js + TailwindCSS</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 font-medium text-gray-900 dark:text-gray-100">API Layer</div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800"></div>
                <div>RESTful API + GraphQL</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 font-medium text-gray-900 dark:text-gray-100">Blockchain</div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800"></div>
                <div>Avalanche C-Chain</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 font-medium text-gray-900 dark:text-gray-100">Smart Contracts</div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800"></div>
                <div>Solidity</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 font-medium text-gray-900 dark:text-gray-100">Storage</div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800"></div>
                <div>IPFS + Encrypted</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/50 rounded-lg text-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Interessato alla tecnologia?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Scopri di più sul progetto e sulla nostra visione.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/progetto" className="inline-block px-6 py-3 bg-violet-600 dark:bg-violet-700 text-white text-sm font-medium rounded-lg hover:bg-violet-700 dark:hover:bg-violet-600 transition-all hover:scale-105">
                Il Progetto
              </a>
              <a href="/" className="inline-block px-6 py-3 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all hover:scale-105">
                Torna alla Home
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
