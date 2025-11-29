/**
 * Test manuale per MerkleTreeGenerator
 * Esegui con: deno test services/merkle.test.ts
 */

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { MerkleTreeGenerator } from "./merkle.ts";

Deno.test("MerkleTreeGenerator: genera tree da claims", () => {
  const claims = {
    isStudent: true,
    university: "Tor Vergata",
    faculty: "Ingegneria",
    enrollmentYear: 2023,
  };

  const tree = MerkleTreeGenerator.generate(claims);

  console.log("Merkle Root:", tree.root);
  console.log("Leaves:", tree.leaves);
  console.log("Layers:", tree.layers.length);

  assert(tree.root.startsWith("0x"));
  assertEquals(tree.leaves.length, 4);
  assert(tree.layers.length > 1);
});

Deno.test("MerkleTreeGenerator: genera proof per claim", () => {
  const claims = {
    isStudent: true,
    university: "Tor Vergata",
    faculty: "Ingegneria",
  };

  const { tree, proof } = MerkleTreeGenerator.generateProofForClaim(
    claims,
    "isStudent"
  );

  console.log("\nProof for 'isStudent':");
  console.log("Leaf Value:", proof.leafValue);
  console.log("Proof siblings:", proof.proof);
  console.log("Leaf Index:", proof.leafIndex);

  assertEquals(proof.leafIndex, 0);
  assert(proof.proof.length > 0);
});

Deno.test("MerkleTreeGenerator: verifica proof", () => {
  const claims = {
    isStudent: true,
    university: "Tor Vergata",
  };

  const { tree, proof } = MerkleTreeGenerator.generateProofForClaim(
    claims,
    "isStudent"
  );

  const isValid = MerkleTreeGenerator.verify(
    proof.leafValue,
    proof.proof,
    tree.root,
    proof.leafIndex
  );

  console.log("\nProof verification:", isValid);
  assert(isValid);
});

Deno.test("MerkleTreeGenerator: proof non valido fallisce", () => {
  const claims = {
    isStudent: true,
    university: "Tor Vergata",
  };

  const { tree, proof } = MerkleTreeGenerator.generateProofForClaim(
    claims,
    "isStudent"
  );

  // Modifica il proof (invalido)
  const fakeProof = [...proof.proof];
  if (fakeProof.length > 0) {
    fakeProof[0] = "0x0000000000000000000000000000000000000000000000000000000000000000";
  }

  const isValid = MerkleTreeGenerator.verify(
    proof.leafValue,
    fakeProof,
    tree.root,
    proof.leafIndex
  );

  console.log("\nFake proof verification:", isValid);
  assertEquals(isValid, false);
});
