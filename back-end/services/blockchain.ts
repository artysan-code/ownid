// Servizio per interagire con il contratto PublicBadgeNetwork
import { Contract, JsonRpcProvider, Wallet } from "npm:ethers@6.13.0";

// Importa l'ABI del contratto
const ABI = [
  "function registerAsEntity(string memory _name) external",
  "function issueBadge(address _student, string memory _title, string memory _spec, uint256 _daysValid, string memory _privateData) external",
  "function getBadgeInfo(uint256 certId) external view returns (string memory issuerName, string memory title, string memory specialization, string memory status, uint256 date)",
  "function verifyPrivateData(uint256 certId, string memory _dataToCheck) external view returns (bool)",
  "function walletToEntityId(address) external view returns (uint256)",
  "function entities(uint256) external view returns (string memory name, address wallet)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event EntityRegistered(uint256 indexed entityId, string name)",
  "event BadgeIssued(uint256 indexed badgeId, uint256 indexed entityId, address recipient)",
];

// Configurazione blockchain
const RPC_URL = Deno.env.get("BLOCKCHAIN_RPC_URL") || "http://localhost:8545";
const CONTRACT_ADDRESS = Deno.env.get("CONTRACT_ADDRESS") || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PRIVATE_KEY = Deno.env.get("BLOCKCHAIN_PRIVATE_KEY");

// Provider e wallet
const provider = new JsonRpcProvider(RPC_URL);
let wallet: Wallet | null = null;
let contract: Contract | null = null;
let contractReadOnly: Contract | null = null;

// Inizializza il wallet solo se abbiamo una chiave privata
if (PRIVATE_KEY) {
  wallet = new Wallet(PRIVATE_KEY, provider);
  contract = new Contract(CONTRACT_ADDRESS, ABI, wallet);
}

// Contratto read-only (senza wallet)
contractReadOnly = new Contract(CONTRACT_ADDRESS, ABI, provider);

/**
 * Registra un ente che può emettere badge
 */
export async function registerEntity(name: string, entityWallet: Wallet) {
  if (!contract && !entityWallet) {
    throw new Error("Wallet non configurato per le transazioni");
  }

  const entityContract = new Contract(CONTRACT_ADDRESS, ABI, entityWallet);
  const tx = await entityContract.registerAsEntity(name);
  const receipt = await tx.wait();

  // Estrai l'entityId dall'evento
  const event = receipt?.logs
    .map((log: any) => {
      try {
        return entityContract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e: any) => e?.name === "EntityRegistered");

  return {
    txHash: receipt?.hash,
    entityId: event?.args?.entityId?.toString(),
    name: event?.args?.name,
  };
}

/**
 * Emetti un badge per uno studente
 */
export async function issueBadge(
  studentAddress: string,
  title: string,
  specialization: string,
  daysValid: number,
  privateData: string,
  entityWallet?: Wallet
) {
  const activeContract = entityWallet
    ? new Contract(CONTRACT_ADDRESS, ABI, entityWallet)
    : contract;

  if (!activeContract) {
    throw new Error("Wallet non configurato");
  }

  const tx = await activeContract.issueBadge(
    studentAddress,
    title,
    specialization,
    daysValid,
    privateData
  );
  const receipt = await tx.wait();

  // Estrai il badgeId dall'evento
  const event = receipt?.logs
    .map((log: any) => {
      try {
        return activeContract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e: any) => e?.name === "BadgeIssued");

  return {
    txHash: receipt?.hash,
    badgeId: event?.args?.badgeId?.toString(),
    entityId: event?.args?.entityId?.toString(),
    recipient: event?.args?.recipient,
  };
}

/**
 * Ottieni informazioni su un badge
 */
export async function getBadgeInfo(badgeId: number) {
  if (!contractReadOnly) {
    throw new Error("Contratto non inizializzato");
  }

  const [issuerName, title, specialization, status, date] =
    await contractReadOnly.getBadgeInfo(badgeId);

  return {
    badgeId,
    issuerName,
    title,
    specialization,
    status,
    issueDate: new Date(Number(date) * 1000).toISOString(),
  };
}

/**
 * Verifica i dati privati di un badge
 */
export async function verifyPrivateData(badgeId: number, dataToCheck: string): Promise<boolean> {
  if (!contractReadOnly) {
    throw new Error("Contratto non inizializzato");
  }

  return await contractReadOnly.verifyPrivateData(badgeId, dataToCheck);
}

/**
 * Ottieni l'entityId di un wallet
 */
export async function getEntityId(walletAddress: string): Promise<number> {
  if (!contractReadOnly) {
    throw new Error("Contratto non inizializzato");
  }

  const entityId = await contractReadOnly.walletToEntityId(walletAddress);
  return Number(entityId);
}

/**
 * Ottieni informazioni su un ente
 */
export async function getEntityInfo(entityId: number) {
  if (!contractReadOnly) {
    throw new Error("Contratto non inizializzato");
  }

  const [name, wallet] = await contractReadOnly.entities(entityId);
  return { entityId, name, wallet };
}

/**
 * Ottieni il proprietario di un badge
 */
export async function getBadgeOwner(badgeId: number): Promise<string> {
  if (!contractReadOnly) {
    throw new Error("Contratto non inizializzato");
  }

  return await contractReadOnly.ownerOf(badgeId);
}

/**
 * Ottieni il numero di badge posseduti da un indirizzo
 */
export async function getUserBadgeCount(address: string): Promise<number> {
  if (!contractReadOnly) {
    throw new Error("Contratto non inizializzato");
  }

  const balance = await contractReadOnly.balanceOf(address);
  return Number(balance);
}

/**
 * Crea un wallet da una chiave privata
 */
export function createWallet(privateKey: string): Wallet {
  return new Wallet(privateKey, provider);
}

/**
 * Test di connessione
 */
export async function testConnection() {
  try {
    const blockNumber = await provider.getBlockNumber();
    return {
      connected: true,
      blockNumber,
      contractAddress: CONTRACT_ADDRESS,
      rpcUrl: RPC_URL,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
