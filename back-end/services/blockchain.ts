import { Contract, JsonRpcProvider, Wallet } from "npm:ethers@6.13.0";

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

const RPC_URL = Deno.env.get("BLOCKCHAIN_RPC_URL") || "http://localhost:8545";
const CONTRACT_ADDRESS = Deno.env.get("CONTRACT_ADDRESS") || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PRIVATE_KEY = Deno.env.get("BLOCKCHAIN_PRIVATE_KEY");

let provider: JsonRpcProvider | null = null;
let wallet: Wallet | null = null;
let contract: Contract | null = null;
let contractReadOnly: Contract | null = null;

/**
 * Get provider instance (lazy initialization)
 */
export function getProvider(): JsonRpcProvider {
  if (!provider) {
    provider = new JsonRpcProvider(RPC_URL);
  }
  return provider;
}

/**
 * Get read-only contract instance (lazy initialization)
 */
export function getContractReadOnly(): Contract {
  if (!contractReadOnly) {
    contractReadOnly = new Contract(CONTRACT_ADDRESS, ABI, getProvider());
  }
  return contractReadOnly;
}

/**
 * Get contract instance with wallet (lazy initialization)
 */
export function getContract(): Contract {
  if (!contract) {
    if (!PRIVATE_KEY) {
      throw new Error("Private key not configured");
    }
    wallet = new Wallet(PRIVATE_KEY, getProvider());
    contract = new Contract(CONTRACT_ADDRESS, ABI, wallet);
  }
  return contract;
}

/**
 * Register entity on-chain
 */
export async function registerEntity(name: string, entityWallet: Wallet) {
  const entityContract = new Contract(CONTRACT_ADDRESS, ABI, entityWallet);
  const tx = await entityContract.registerAsEntity(name);
  const receipt = await tx.wait();

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
 * Issue badge on-chain
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
    : getContract();

  const tx = await activeContract.issueBadge(
    studentAddress,
    title,
    specialization,
    daysValid,
    privateData
  );
  const receipt = await tx.wait();

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
 * Get badge information
 */
export async function getBadgeInfo(badgeId: number) {
  const contract = getContractReadOnly();
  const [issuerName, title, specialization, status, date] =
    await contract.getBadgeInfo(badgeId);

  return {
    badgeId,
    issuerName,
    title,
    specialization,
    status,
    issueDate: new Date(Number(date) * 1000).toISOString(),
  };
}

export async function verifyPrivateData(badgeId: number, dataToCheck: string): Promise<boolean> {
  const contract = getContractReadOnly();
  return await contract.verifyPrivateData(badgeId, dataToCheck);
}

export async function getEntityId(walletAddress: string): Promise<number> {
  const contract = getContractReadOnly();
  const entityId = await contract.walletToEntityId(walletAddress);
  return Number(entityId);
}

export async function getEntityInfo(entityId: number) {
  const contract = getContractReadOnly();
  const [name, wallet] = await contract.entities(entityId);
  return { entityId, name, wallet };
}

export async function getBadgeOwner(badgeId: number): Promise<string> {
  const contract = getContractReadOnly();
  return await contract.ownerOf(badgeId);
}

export async function getUserBadgeCount(address: string): Promise<number> {
  const contract = getContractReadOnly();
  const balance = await contract.balanceOf(address);
  return Number(balance);
}

export function createWallet(privateKey: string): Wallet {
  return new Wallet(privateKey, getProvider());
}

/**
 * Test blockchain connection
 */
export async function testConnection() {
  try {
    const provider = getProvider();
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
