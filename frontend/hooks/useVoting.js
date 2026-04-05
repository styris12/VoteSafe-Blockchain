import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import VotingABI from '../contracts/Voting.json';
import { CONTRACT_ADDRESS } from '../contracts/config';

export function useVoting() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [electionTitle, setElectionTitle] = useState('');
  const [currentPhase, setCurrentPhase] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [voterStatus, setVoterStatus] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [winner, setWinner] = useState(null);

  const connectWallet = useCallback(async () => {
    try {
      setError('');
      if (!window.ethereum) { setError('MetaMask not found.'); return; }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, _signer);
      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);
      setAccount(accounts[0]);
      const admin = await _contract.admin();
      setIsAdmin(accounts[0].toLowerCase() === admin.toLowerCase());
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    }
  }, []);

  const fetchElectionData = useCallback(async () => {
    if (!contract) return;
    try {
      const title = await contract.electionTitle();
      const phase = await contract.getPhase();
      const total = await contract.totalVotes();
      const count = await contract.candidateCount();
      const phaseNum = Number(phase);

      setElectionTitle(title);
      setCurrentPhase(phaseNum);
      setTotalVotes(Number(total));

      const cands = [];
      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.getCandidate(i);
        cands.push({ id: Number(c[0]), name: c[1], party: c[2], votes: Number(c[3]) });
      }
      setCandidates(cands);

      if (account) {
        const vs = await contract.getVoterStatus(account);
        setVoterStatus({ authorized: vs[0], voted: vs[1], votedFor: Number(vs[2]), name: vs[3], aadhar: vs[4] });
      }

      // fetch winner if ended
      if (phaseNum === 2 && Number(total) > 0) {
        try {
          const w = await contract.getWinner();
          setWinner({ name: w[0], party: w[1], voteCount: Number(w[2]) });
        } catch(e) { setWinner(null); }
      } else {
        setWinner(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract) fetchElectionData();
  }, [contract, fetchElectionData]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const castVote = async (candidateId) => {
    if (!contract) return null;
    try {
      setLoading(true); setError('');
      const tx = await contract.castVote(candidateId);
      await tx.wait();
      await fetchElectionData();
      return tx.hash;
    } catch (err) {
      setError(err?.reason || err?.message || 'Transaction failed');
      return null;
    } finally { setLoading(false); }
  };

  const authorizeVoter = async (address, name, aadhar) => {
    if (!contract) return false;
    try {
      setLoading(true); setError('');
      const tx = await contract.authorizeVoter(address, name, aadhar);
      await tx.wait();
      await fetchElectionData();
      return true;
    } catch (err) {
      setError(err?.reason || err?.message || 'Failed to authorize voter');
      return false;
    } finally { setLoading(false); }
  };

  const addCandidate = async (name, party) => {
    if (!contract) return false;
    try {
      setLoading(true); setError('');
      const tx = await contract.addCandidate(name, party);
      await tx.wait();
      await fetchElectionData();
      return true;
    } catch (err) {
      setError(err?.reason || err?.message || 'Failed to add candidate');
      return false;
    } finally { setLoading(false); }
  };

  const startVoting = async () => {
    if (!contract) return false;
    try {
      setLoading(true); setError('');
      const tx = await contract.startVoting();
      await tx.wait();
      await fetchElectionData();
      return true;
    } catch (err) {
      setError(err?.reason || err?.message || 'Failed to start voting');
      return false;
    } finally { setLoading(false); }
  };

  const endVoting = async () => {
    if (!contract) return false;
    try {
      setLoading(true); setError('');
      const tx = await contract.endVoting();
      await tx.wait();
      await fetchElectionData();
      return true;
    } catch (err) {
      setError(err?.reason || err?.message || 'Failed to end election');
      return false;
    } finally { setLoading(false); }
  };

  return {
    account, isAdmin, loading, error, setError,
    electionTitle, currentPhase, candidates,
    voterStatus, totalVotes, winner, contract,
    connectWallet, castVote, authorizeVoter,
    addCandidate, startVoting, endVoting,
    fetchElectionData
  };
}