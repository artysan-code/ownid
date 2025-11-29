import { ethers } from "ethers";

/**
 * Merkle Tree Generator per Verifiable Credentials
 * Genera Merkle tree dai claims e crea proof per selective disclosure
 */

export interface MerkleTree {
  root: string;
  leaves: string[];
  layers: string[][];
}

export interface MerkleProof {
  leafValue: string;
  proof: string[];
  leafIndex: number;
}

export class MerkleTreeGenerator {
  /**
   * Hasha una singola coppia key-value di un claim
   * @param key Nome del claim (es. "isStudent")
   * @param value Valore del claim (es. true)
   * @returns Hash del leaf
   */
  static hashLeaf(key: string, value: any): string {
    const data = `${key}:${JSON.stringify(value)}`;
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }

  /**
   * Hasha una coppia di nodi
   * @param a Primo hash
   * @param b Secondo hash
   * @returns Hash della coppia, ordinato
   */
  static hashPair(a: string, b: string): string {
    // Ordina gli hash per garantire consistenza
    const sorted = [a, b].sort();
    const combined = sorted[0] + sorted[1].slice(2); // Rimuovi 0x dal secondo
    return ethers.keccak256(combined);
  }

  /**
   * Genera un Merkle tree completo da un oggetto claims
   * @param claims Oggetto con le coppie key-value dei claims
   * @returns MerkleTree con root, leaves e tutti i layers
   */
  static generate(claims: Record<string, any>): MerkleTree {
    // Genera leaves dagli claims
    const leaves = Object.entries(claims).map(([key, value]) =>
      this.hashLeaf(key, value)
    );

    if (leaves.length === 0) {
      throw new Error("Cannot generate Merkle tree from empty claims");
    }

    // Inizializza layers con le foglie
    const layers: string[][] = [leaves];
    let currentLayer = leaves;

    // Costruisci l'albero fino alla root
    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          // Coppia normale
          nextLayer.push(this.hashPair(currentLayer[i], currentLayer[i + 1]));
        } else {
          // Nodo dispari: duplica per bilanciare
          nextLayer.push(this.hashPair(currentLayer[i], currentLayer[i]));
        }
      }

      layers.push(nextLayer);
      currentLayer = nextLayer;
    }

    return {
      root: currentLayer[0],
      leaves,
      layers,
    };
  }

  /**
   * Genera un Merkle proof per un claim specifico
   * @param tree Merkle tree completo
   * @param leafIndex Indice del leaf (claim) da provare
   * @returns Merkle proof con siblings path
   */
  static getProof(tree: MerkleTree, leafIndex: number): MerkleProof {
    if (leafIndex < 0 || leafIndex >= tree.leaves.length) {
      throw new Error(`Leaf index ${leafIndex} out of bounds`);
    }

    const proof: string[] = [];
    let index = leafIndex;

    // Itera attraverso i layers (escluso l'ultimo che è la root)
    for (let i = 0; i < tree.layers.length - 1; i++) {
      const layer = tree.layers[i];
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;

      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }

      // Prossimo livello
      index = Math.floor(index / 2);
    }

    return {
      leafValue: tree.leaves[leafIndex],
      proof,
      leafIndex,
    };
  }

  /**
   * Verifica un Merkle proof (per testing - on-chain è fatto dal contratto)
   * @param leafValue Valore del leaf
   * @param proof Array di siblings
   * @param root Root atteso
   * @param leafIndex Indice originale del leaf
   * @returns true se il proof è valido
   */
  static verify(
    leafValue: string,
    proof: string[],
    root: string,
    leafIndex: number
  ): boolean {
    let computedHash = leafValue;
    let index = leafIndex;

    for (const sibling of proof) {
      const isRightNode = index % 2 === 1;

      if (isRightNode) {
        computedHash = this.hashPair(sibling, computedHash);
      } else {
        computedHash = this.hashPair(computedHash, sibling);
      }

      index = Math.floor(index / 2);
    }

    return computedHash.toLowerCase() === root.toLowerCase();
  }

  /**
   * Genera proof per un claim specifico data la key
   * @param claims Oggetto claims originale
   * @param claimKey Key del claim per cui generare il proof
   * @returns MerkleProof completo
   */
  static generateProofForClaim(
    claims: Record<string, any>,
    claimKey: string
  ): { tree: MerkleTree; proof: MerkleProof } {
    const keys = Object.keys(claims);
    const leafIndex = keys.indexOf(claimKey);

    if (leafIndex === -1) {
      throw new Error(`Claim key "${claimKey}" not found in claims`);
    }

    const tree = this.generate(claims);
    const proof = this.getProof(tree, leafIndex);

    return { tree, proof };
  }
}
