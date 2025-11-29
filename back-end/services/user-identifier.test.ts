/**
 * Test per UserIdentifierService
 * Esegui con: deno test services/user-identifier.test.ts
 */

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { UserIdentifierService } from "./user-identifier.ts";

Deno.test("UserIdentifierService: genera identifier da wallet address", () => {
  const user = {
    id: "user-123",
    email: "mario.rossi@example.com",
    wallet_address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  };

  const identifier = UserIdentifierService.generateIdentifier(user);

  console.log("User with wallet:");
  console.log("  Wallet:", user.wallet_address);
  console.log("  Identifier:", identifier);

  assertEquals(identifier, user.wallet_address!.toLowerCase());
  assert(UserIdentifierService.isWalletAddress(identifier));
});

Deno.test("UserIdentifierService: genera identifier da email hash", () => {
  const user = {
    id: "user-456",
    email: "luigi.verdi@example.com",
    wallet_address: null,
  };

  const identifier = UserIdentifierService.generateIdentifier(user);

  console.log("\nUser without wallet:");
  console.log("  Email:", user.email);
  console.log("  Identifier (hash):", identifier);

  assert(identifier.startsWith("0x"));
  assertEquals(identifier.length, 66); // 0x + 64 hex chars
  assert(!UserIdentifierService.isWalletAddress(identifier));
});

Deno.test("UserIdentifierService: stesso email genera stesso hash", () => {
  const user1 = {
    id: "user-1",
    email: "test@example.com",
    wallet_address: null,
  };

  const user2 = {
    id: "user-2",
    email: "test@example.com", // Stessa email
    wallet_address: null,
  };

  const id1 = UserIdentifierService.generateIdentifier(user1);
  const id2 = UserIdentifierService.generateIdentifier(user2);

  console.log("\nSame email test:");
  console.log("  User 1 identifier:", id1);
  console.log("  User 2 identifier:", id2);

  assertEquals(id1, id2);
});

Deno.test("UserIdentifierService: email normalizzata (case-insensitive)", () => {
  const hash1 = UserIdentifierService.hashEmail("Test@Example.COM");
  const hash2 = UserIdentifierService.hashEmail("test@example.com");

  console.log("\nCase insensitive test:");
  console.log("  test@example.com:", hash2);
  console.log("  Test@Example.COM:", hash1);

  assertEquals(hash1, hash2);
});

Deno.test("UserIdentifierService: genera claim ID", () => {
  const userIdentifier = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const credentialType = "signedUniversity";
  const issuerId = 1;

  const claimId = UserIdentifierService.generateClaimId(
    userIdentifier,
    credentialType,
    issuerId
  );

  console.log("\nClaim ID generation:");
  console.log("  User:", userIdentifier);
  console.log("  Type:", credentialType);
  console.log("  Issuer ID:", issuerId);
  console.log("  Claim ID:", claimId);

  assert(claimId.startsWith("0x"));
  assertEquals(claimId.length, 66);
});
