import { ethers } from "ethers";

/**
 * Hybrid user identifier service
 * Generates on-chain identifiers: wallet address OR email hash
 */

export interface User {
  id: string;
  email: string;
  wallet_address?: string | null;
}

export class UserIdentifierService {
  static generateIdentifier(user: User): string {
    if (user.wallet_address && ethers.isAddress(user.wallet_address)) {
      return user.wallet_address.toLowerCase();
    }
    return this.hashEmail(user.email);
  }

  static hashEmail(email: string): string {
    const normalized = email.toLowerCase().trim();
    return ethers.keccak256(ethers.toUtf8Bytes(normalized));
  }

  static isWalletAddress(identifier: string): boolean {
    return ethers.isAddress(identifier);
  }
  static generateClaimId(
    userIdentifier: string,
    credentialType: string,
    issuerId: number
  ): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "string", "uint256"],
        [userIdentifier, credentialType, issuerId]
      )
    );
  }
}
