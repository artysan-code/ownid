// Importa Pool dalla libreria postgres
import { Pool } from "postgres";

// Leggi la stringa di connessione dal file .env
// Se non esiste, usa un valore di default
const DATABASE_URL = Deno.env.get("DATABASE_URL") || 
  "postgresql://ownid_user:ownid_password_dev@localhost:5432/ownid";

// Crea il pool con massimo 10 connessioni simultanee
// Questo pool verrà riutilizzato in tutta l'applicazione
export const pool = new Pool(DATABASE_URL, 10);

// Funzione per testare la connessione al database
// Utile per verificare che tutto funzioni all'avvio del server
export async function testConnection() {
  // Prendi una connessione dal pool
  const client = await pool.connect();
  
  try {
    // Esegui una query semplice per testare
    const result = await client.queryObject("SELECT NOW()");
    console.log("✅ Database connesso:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Errore connessione database:", error);
    return false;
  } finally {
    // SEMPRE rilasciare la connessione, anche in caso di errore
    client.release();
  }
}

// Funzione helper per eseguire query in modo sicuro
// Gestisce automaticamente la connessione e il rilascio
export async function query<T>(sql: string, params?: any[]) {
  const client = await pool.connect();
  
  try {
    // queryObject ritorna gli array come oggetti JavaScript
    // es: [{id: "1", nome: "Mario"}] invece di [["1", "Mario"]]
    const result = await client.queryObject<T>(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}
