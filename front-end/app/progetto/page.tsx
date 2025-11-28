import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Progetto() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            Il Progetto
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 leading-relaxed">
            OwnID nasce per l'Hackathon Avalanche presso l'Università di Tor Vergata con l'obiettivo di 
            rivoluzionare la gestione dell'identità digitale.
          </p>

          {/* Project Story */}
          <div className="space-y-12">
            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  La Visione
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  In un mondo sempre più digitale, la gestione dell'identità è diventata un problema critico. 
                  Gli attuali sistemi centralizzati presentano vulnerabilità significative: data breach, 
                  violazioni della privacy, e monopolio dei dati personali da parte di grandi corporation.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  OwnID propone un approccio radicalmente diverso: un sistema di identità decentralizzato 
                  dove gli utenti hanno il controllo completo dei propri dati. Nessuna azienda può accedere, 
                  vendere o sfruttare le tue informazioni personali senza il tuo esplicito consenso.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Hackathon Avalanche
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Questo progetto è sviluppato per l'Hackathon Avalanche organizzato presso l'Università 
                  di Tor Vergata. L'evento rappresenta un'opportunità unica per esplorare le potenzialità 
                  della blockchain Avalanche e sviluppare soluzioni innovative.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Università</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tor Vergata, Roma</div>
                  </div>
                  <div className="p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Blockchain</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avalanche Network</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Problemi che Risolviamo
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-950/30 rounded-full flex items-center justify-center">
                      <span className="text-violet-600 dark:text-violet-400 font-semibold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Centralizzazione dei Dati
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Le grandi aziende tech controllano i dati di miliardi di utenti, creando monopoli 
                        e punti di vulnerabilità per attacchi su larga scala.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-950/30 rounded-full flex items-center justify-center">
                      <span className="text-violet-600 dark:text-violet-400 font-semibold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Mancanza di Privacy
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gli utenti non hanno controllo su come i loro dati vengono utilizzati, condivisi o venduti.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-950/30 rounded-full flex items-center justify-center">
                      <span className="text-violet-600 dark:text-violet-400 font-semibold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Frammentazione dell'Identità
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gli utenti devono gestire decine di account diversi, ognuno con credenziali separate 
                        e politiche di sicurezza diverse.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-950/30 rounded-full flex items-center justify-center">
                      <span className="text-violet-600 dark:text-violet-400 font-semibold">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Vulnerabilità di Sicurezza
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        I database centralizzati sono obiettivi attraenti per hacker e rappresentano 
                        un single point of failure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Roadmap
                </h2>
                <div className="space-y-6">
                  <div className="relative pl-8 border-l-2 border-violet-600 dark:border-violet-400">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-violet-600 dark:bg-violet-400 rounded-full"></div>
                    <div className="pb-6">
                      <div className="text-xs text-violet-600 dark:text-violet-400 font-semibold mb-1">FASE 1 - IN CORSO</div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Prototipo e Demo</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sviluppo del prototipo per l'hackathon con funzionalità core di autenticazione 
                        e gestione identità on-chain.
                      </p>
                    </div>
                  </div>
                  <div className="relative pl-8 border-l-2 border-gray-300 dark:border-neutral-700">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-300 dark:bg-neutral-700 rounded-full"></div>
                    <div className="pb-6">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">FASE 2 - Q1 2026</div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Beta Testing</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Lancio della versione beta con utenti selezionati per raccogliere feedback 
                        e ottimizzare l'esperienza utente.
                      </p>
                    </div>
                  </div>
                  <div className="relative pl-8 border-l-2 border-gray-300 dark:border-neutral-700">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-300 dark:bg-neutral-700 rounded-full"></div>
                    <div className="pb-6">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">FASE 3 - Q2 2026</div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mainnet Launch</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Rilascio pubblico su Avalanche mainnet con audit di sicurezza completi 
                        e supporto per integrazioni esterne.
                      </p>
                    </div>
                  </div>
                  <div className="relative pl-8 border-l-2 border-gray-300 dark:border-neutral-700">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-300 dark:bg-neutral-700 rounded-full"></div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">FASE 4 - Q3-Q4 2026</div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Espansione</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Supporto multi-chain, SDK per più linguaggi, e partnership con applicazioni 
                        per adozione su larga scala.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="p-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Perché Avalanche?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Abbiamo scelto Avalanche per diverse ragioni tecniche e strategiche:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-violet-600 dark:text-violet-400 font-bold">•</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Alte Prestazioni</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Finalità sub-secondo e throughput elevato per un'esperienza utente fluida
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-violet-600 dark:text-violet-400 font-bold">•</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Costi Ridotti</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Fee di transazione minime per rendere il servizio accessibile a tutti
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-violet-600 dark:text-violet-400 font-bold">•</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Compatibilità EVM</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Facilita lo sviluppo con Solidity e l'integrazione con tool esistenti
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-violet-600 dark:text-violet-400 font-bold">•</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Sostenibilità</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Proof of Stake efficiente dal punto di vista energetico
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/50 rounded-lg text-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Vuoi saperne di più?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Esplora le nostre funzionalità e la tecnologia che alimenta OwnID.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/funzionalita" className="inline-block px-6 py-3 bg-violet-600 dark:bg-violet-700 text-white text-sm font-medium rounded-lg hover:bg-violet-700 dark:hover:bg-violet-600 transition-all hover:scale-105">
                Funzionalità
              </a>
              <a href="/tecnologia" className="inline-block px-6 py-3 bg-violet-600 dark:bg-violet-700 text-white text-sm font-medium rounded-lg hover:bg-violet-700 dark:hover:bg-violet-600 transition-all hover:scale-105">
                Tecnologia
              </a>
              <a href="/" className="inline-block px-6 py-3 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all hover:scale-105">
                Home
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
