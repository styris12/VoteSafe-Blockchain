import { ethers } from 'ethers';

// ── Keccak256 hash of two concatenated hex strings (mimics Solidity merkle) ──
async function keccak256(data) {
  const encoded = ethers.toUtf8Bytes(data);
  return ethers.keccak256(encoded);
}

// Hash a single leaf: keccak256(voter + candidateId + timestamp)
export async function hashLeaf(voter, candidateId, timestamp) {
  const packed = `${voter.toLowerCase()}:${candidateId}:${timestamp}`;
  return ethers.keccak256(ethers.toUtf8Bytes(packed));
}

// Hash two child hashes together to form a parent
export async function hashPair(left, right) {
  // Sort so tree is deterministic regardless of order
  const [a, b] = left < right ? [left, right] : [right, left];
  return ethers.keccak256(ethers.toUtf8Bytes(`${a}${b}`));
}

// ── Fetch all VoteCast events from the contract ──────────────────────────────
export async function fetchVoteEvents(contract) {
  try {
    const filter = contract.filters.VoteCast();
    const events = await contract.queryFilter(filter, 0, 'latest');
    return events.map(e => ({
      voter:       e.args.voter,
      candidateId: Number(e.args.candidateId),
      timestamp:   Number(e.args.timestamp),
      txHash:      e.transactionHash,
      blockNumber: e.blockNumber,
    }));
  } catch (err) {
    console.error('Error fetching VoteCast events:', err);
    return [];
  }
}

// ── Build the full Merkle tree from a list of vote events ────────────────────
// Returns a tree object with all levels for visualization
export async function buildMerkleTree(voteEvents, candidates) {
  if (voteEvents.length === 0) return null;

  // Build leaf nodes
  const leaves = await Promise.all(
    voteEvents.map(async (ev, i) => {
      const hash = await hashLeaf(ev.voter, ev.candidateId, ev.timestamp);
      const candidate = candidates.find(c => c.id === ev.candidateId);
      return {
        hash,
        type:        'leaf',
        index:       i,
        voter:       ev.voter,
        candidateId: ev.candidateId,
        candidateName: candidate?.name || `Candidate ${ev.candidateId}`,
        timestamp:   ev.timestamp,
        txHash:      ev.txHash,
        blockNumber: ev.blockNumber,
      };
    })
  );

  // Build tree level by level bottom-up
  // levels[0] = leaves, levels[last] = [root]
  const levels = [leaves];
  let currentLevel = leaves;

  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left  = currentLevel[i];
      const right = currentLevel[i + 1] || currentLevel[i]; // duplicate last if odd
      const parentHash = await hashPair(left.hash, right.hash);
      nextLevel.push({
        hash:     parentHash,
        type:     nextLevel.length === 0 && currentLevel.length <= 2 ? 'root' : 'internal',
        left:     left,
        right:    right,
        index:    nextLevel.length,
        children: [left, right],
      });
    }
    levels.push(nextLevel);
    currentLevel = nextLevel;
  }

  // Mark the actual root
  const root = levels[levels.length - 1][0];
  root.type = 'root';

  return {
    root,
    levels,
    totalLeaves: leaves.length,
    merkleRoot:  root.hash,
  };
}

// ── Generate a Merkle proof for a specific leaf ──────────────────────────────
export function getMerkleProof(tree, leafIndex) {
  if (!tree) return [];
  const proof = [];
  let idx = leafIndex;

  for (let lvl = 0; lvl < tree.levels.length - 1; lvl++) {
    const level = tree.levels[lvl];
    const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    const sibling = level[siblingIdx] || level[idx]; // handle odd
    proof.push({ hash: sibling.hash, position: idx % 2 === 0 ? 'right' : 'left' });
    idx = Math.floor(idx / 2);
  }
  return proof;
}