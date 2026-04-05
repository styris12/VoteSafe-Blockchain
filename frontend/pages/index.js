import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useVoting } from '../hooks/useVoting';
import { CONTRACT_ADDRESS } from '../contracts/config';

const maskAddress = (addr) => addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : '';
const COLORS = ['#00d4ff','#00ff88','#ffcc00','#ff7733','#cc44ff'];
const PHASES = ['REGISTRATION','VOTING','ENDED'];
const PHASE_COLORS = ['#ffcc00','#00ff88','#4a7a9b'];

const DEMO_VOTERS = [
  { label:'Voter 1', address:'0x70997970C51812dc3A010C7d01b50e0d17dc79C8', pk:'0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' },
  { label:'Voter 2', address:'0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', pk:'0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a' },
  { label:'Voter 3', address:'0x90F79bf6EB2c4f870365E785982E1f101E93b906', pk:'0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6' },
  { label:'Voter 4', address:'0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', pk:'0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a' },
];

const AVATARS    = ['🧑','👩','👨','🧔','👩‍💼','👨‍💼','🧑‍💻','👩‍🔬','👨‍🎓','🧑‍🎨'];
const CAND_ICONS = ['🏛️','⚡','🌿','🔥','💡','🎯','🌊','🦅'];

export default function Home() {
  const {
    account, isAdmin, loading, error, setError,
    electionTitle, currentPhase, candidates,
    voterStatus, totalVotes, winner,
    connectWallet, castVote, authorizeVoter,
    addCandidate, startVoting, endVoting,
    fetchElectionData, contract,
  } = useVoting();

  const [tab, setTab]         = useState('voter');
  const [sel, setSel]         = useState(null);
  const [txHash, setTxHash]   = useState('');
  const [voteMsg, setVoteMsg] = useState('');
  const [ready, setReady]     = useState(false);

  const [candName, setCandName]   = useState('');
  const [candParty, setCandParty] = useState('');
  const [candIcon, setCandIcon]   = useState(CAND_ICONS[0]);
  const [candMsg, setCandMsg]     = useState('');
  const [vAddr, setVAddr]         = useState('');
  const [vName, setVName]         = useState('');
  const [vAadhar, setVAadhar]     = useState('');
  const [vAvatar, setVAvatar]     = useState(AVATARS[0]);
  const [vMsg, setVMsg]           = useState('');
  const [phaseMsg, setPhaseMsg]   = useState('');

  const [simMode, setSimMode]       = useState(false);
  const [simVoter, setSimVoter]     = useState(null);
  const [simName, setSimName]       = useState('');
  const [simAadhar, setSimAadhar]   = useState('');
  const [simAvatar, setSimAvatar]   = useState(AVATARS[0]);
  const [simStep, setSimStep]       = useState('select');
  const [simVStatus, setSimVStatus] = useState(null);
  const [simSel, setSimSel]         = useState(null);
  const [simTxHash, setSimTxHash]   = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simMsg, setSimMsg]         = useState('');

  useEffect(() => { setReady(true); }, []);
  if (!ready) return null;

  const phaseNum   = currentPhase ?? 0;
  const phaseLabel = PHASES[phaseNum]       || 'REGISTRATION';
  const phaseColor = PHASE_COLORS[phaseNum] || '#ffcc00';

  // ── STYLES ──────────────────────────────────────
  const page    = { height:'100vh', background:'#060d16', color:'#ddeeff', fontFamily:"'Courier New', monospace", fontSize:14, display:'flex', flexDirection:'column' };
  const panel   = { background:'#0a1828', border:'1px solid #1a3a52', borderRadius:8, overflow:'hidden', display:'flex', flexDirection:'column' };
  const ph      = (x={}) => ({ padding:'12px 18px', borderBottom:'1px solid #1a3a52', background:'rgba(0,212,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, ...x });
  const pt      = { fontSize:13, fontWeight:800, color:'#00d4ff', letterSpacing:2, textTransform:'uppercase' };
  const pb      = { padding:14, flex:1, display:'flex', flexDirection:'column', overflow:'auto' };
  const key     = { color:'#7faac7' };
  const val     = { color:'#e6f1ff' };
  const green   = { color:'#00ff88' };
  const red     = { color:'#ff4466' };
  const cyan    = { color:'#00d4ff' };
  const yellow  = { color:'#ffcc00' };
  const muted   = { color:'#8fb3c9' };
  const row     = { lineHeight:2.2, fontSize:14 };
  const divider = { height:1, background:'#1a3a52', margin:'10px 0' };
  const aBase   = { padding:'10px 18px', borderRadius:6, fontSize:13, marginBottom:8, lineHeight:1.6 };
  const aOk     = { ...aBase, background:'rgba(0,255,136,0.07)', border:'1px solid #00994d', color:'#00ff88' };
  const aErr    = { ...aBase, background:'rgba(255,51,85,0.07)', border:'1px solid #cc1133', color:'#ff4466' };
  const aInf    = { ...aBase, background:'rgba(0,212,255,0.07)', border:'1px solid #0077aa', color:'#00d4ff' };
  const aWarn   = { ...aBase, background:'rgba(255,204,0,0.07)', border:'1px solid #aa8800', color:'#ffcc00' };
  const inp     = { width:'93%', background:'#070f1a', border:'1px solid #1a3a52', borderRadius:6, padding:'9px 12px', color:'#ddeeff', fontFamily:"'Courier New', monospace", fontSize:13, outline:'none', marginBottom:8 };
  const lbl     = { display:'block', fontSize:10, color:'#4a7a9b', letterSpacing:1.8, textTransform:'uppercase', marginBottom:4 };

  const mkBtn = (v='primary', full=true, sm=false) => ({
    width: full?'100%':'auto',
    padding: sm?'7px 12px':'12px 18px',
    border:'none', borderRadius:10,
    fontSize: sm?12:14, fontWeight:700, letterSpacing:1.5, cursor:'pointer',
    fontFamily:"'Segoe UI', Tahoma, sans-serif", transition:'all 0.15s',
    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
    ...(v==='green'  ? { background:'linear-gradient(135deg,#006633,#004422)', border:'1px solid #00994d', color:'#e8f4f8' }
      : v==='red'    ? { background:'linear-gradient(135deg,#881122,#550011)', border:'1px solid #aa1133', color:'#e8f4f8' }
      : v==='yellow' ? { background:'linear-gradient(135deg,#886600,#554400)', border:'1px solid #aa8800', color:'#e8f4f8' }
      : v==='ghost'  ? { background:'transparent', border:'1px solid #1a3a52', color:'#6a9ab8' }
      :                { background:'linear-gradient(135deg,#005577,#003344)', border:'1px solid #0088aa', color:'#e8f4f8' }),
  });

  // ── SIMULATION HELPERS ───────────────────────────
  const checkSimVoter = async (voter) => {
    if (!contract) return;
    try {
      const vs = await contract.getVoterStatus(voter.address);
      const s = { authorized:vs[0], voted:vs[1], votedFor:Number(vs[2]) };
      setSimVStatus(s);
      if (s.authorized) setSimStep('vote');
      else setSimStep('register');
    } catch { setSimStep('register'); }
  };

  const handleSimSelect = async (voter) => {
    setSimVoter(voter); setSimStep('register');
    setSimMsg(''); setSimSel(null); setSimTxHash(''); setSimVStatus(null);
    setSimName(''); setSimAadhar(''); setSimAvatar(AVATARS[0]);
    await checkSimVoter(voter);
  };

  const handleSimVote = async () => {
    if (!simSel) { setSimMsg('Select a candidate.'); return; }
    setSimLoading(true); setSimMsg('');
    try {
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
      const wallet = new ethers.Wallet(simVoter.pk, provider);
      const c = contract.connect(wallet);
      const tx = await c.castVote(simSel);
      await tx.wait();
      setSimTxHash(tx.hash);
      setSimStep('done');
      await fetchElectionData();
    } catch(e) {
      const m = e?.reason||e?.message||'';
      setSimMsg(
        m.includes('Already voted')       ? '⚠ Already voted.' :
        m.includes('Not authorized')      ? '⚠ Not authorized — ask admin to whitelist this wallet.' :
        m.includes('Wrong election phase')? '⚠ Not in voting phase.' : m
      );
    } finally { setSimLoading(false); }
  };

  // ── ADMIN HELPERS ────────────────────────────────
  const handleAddCandidate = async () => {
    if (!candName.trim()) { setCandMsg('Enter candidate name.'); return; }
    const ok = await addCandidate(`${candIcon} ${candName}`, candParty||'Independent');
    if (ok) { setCandMsg(`✓ ${candName} registered.`); setCandName(''); setCandParty(''); }
    else setCandMsg('Failed — check phase or connection.');
  };

  const handleAuthorizeVoter = async () => {
    const addr = (vAddr==='custom'||vAddr==='') ? '' : vAddr;
    if (!ethers.isAddress(addr)) { setVMsg('Select or enter a valid address.'); return; }
    if (!vName.trim()) { setVMsg('Enter voter name.'); return; }
    if (vAadhar.length!==4) { setVMsg('Enter last 4 digits of Aadhar.'); return; }
    const ok = await authorizeVoter(addr, vName, vAadhar);
    if (ok) { setVMsg(`✓ ${vName} authorized.`); setVAddr(''); setVName(''); setVAadhar(''); }
    else setVMsg('Failed — voter may already be authorized.');
  };

  const handleStartVoting = async () => {
    const ok = await startVoting();
    setPhaseMsg(ok ? '✓ Voting phase started.' : 'Failed — need 2+ candidates and 1+ voter.');
  };

  const handleEndVoting = async () => {
    const ok = await endVoting();
    setPhaseMsg(ok ? '✓ Election ended. Results finalized.' : 'Failed to end election.');
  };

  const handleVote = async () => {
    if (!sel) { setVoteMsg('Please select a candidate.'); return; }
    setVoteMsg('');
    const hash = await castVote(sel);
    if (hash) { setTxHash(hash); setVoteMsg('✓ Vote confirmed on blockchain!'); }
  };

  // ── CONNECT SCREEN ───────────────────────────────
  if (!account) {
    return (
      <div style={{ ...page, alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:72, height:72, border:'2px solid #00d4ff', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, margin:'0 auto 24px', boxShadow:'0 0 32px rgba(0,212,255,0.3)' }}>⛓</div>
          <h1 style={{ fontSize:52, fontWeight:700, color:'#00d4ff', letterSpacing:8, fontFamily:"'Times New Roman', Times, serif", marginBottom:20, textShadow:'0 0 30px rgba(0,212,255,0.4)' }}>VOTESAFE</h1>
          <p style={{ fontSize:18, color:'#4a7a9b', marginBottom:12, letterSpacing:1, fontFamily:"'Segoe UI', sans-serif" }}>Blockchain-Based Voting System · SFIT · Department of IT</p>
          <p style={{ fontSize:15, color:'#2a5a7a', marginBottom:36, letterSpacing:1, fontFamily:"'Consolas', monospace" }}>Solidity · Hardhat · Ethers.js · Next.js · MetaMask</p>
          <button onClick={connectWallet} style={{ padding:'16px 32px', background:'linear-gradient(135deg,#0077aa,#005577)', border:'1px solid #0077aa', borderRadius:18, color:'#e8f4f8', fontSize:20, fontWeight:600, cursor:'pointer', letterSpacing:1, fontFamily:"'Segoe UI', sans-serif", boxShadow:'0 4px 14px rgba(0,212,255,0.15)' }}>
            🦊 Connect MetaMask
          </button>
          {error && <div style={{ ...aErr, marginTop:20, display:'inline-block' }}>{error}</div>}
          <p style={{ marginTop:20, fontSize:13, color:'#2a5a7a', fontFamily:"'Consolas', monospace" }}>Hardhat Local · Chain 31337 · 127.0.0.1:8545</p>
        </div>
        <div style={{ position:'absolute', bottom:18, fontSize:13, color:'#5a8aa8', letterSpacing:1.4, fontFamily:"'Segoe UI', sans-serif" }}>
          Team: Kruti · Tanmay · Styris · Anish
        </div>
      </div>
    );
  }

  // ── MAIN APP ─────────────────────────────────────
  return (
    <div style={page}>

      {/* HEADER */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 32px', height:60, borderBottom:'1px solid #1a3a52', background:'rgba(0,212,255,0.03)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:36, height:36, border:'2px solid #00d4ff', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:'0 0 14px rgba(0,212,255,0.3)' }}>⛓</div>
          <div>
            <div style={{ fontSize:22, fontWeight:700, color:'#00d4ff', letterSpacing:2, fontFamily:"'Times New Roman', Times, serif", textShadow:'0 0 12px rgba(0,212,255,0.3)' }}>VOTESAFE</div>
            <div style={{ fontSize:11, fontFamily:"'Segoe UI', sans-serif", color:'#4a7a9b', letterSpacing:1.5 }}>Blockchain Voting · SFIT · Department of IT</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ padding:'5px 14px', background:`rgba(${phaseNum===0?'255,204,0':phaseNum===1?'0,255,136':'74,122,155'},0.1)`, border:`1px solid ${phaseColor}55`, borderRadius:20, fontSize:12, color:phaseColor, fontWeight:700, letterSpacing:1 }}>
            {phaseNum===0?'📋':phaseNum===1?'🗳':'🏁'} {phaseLabel}
          </span>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, color:'#2a5a7a', letterSpacing:1 }}>CONNECTED WALLET</div>
            <div style={{ fontSize:14, ...green }}>{maskAddress(account)}</div>
          </div>
          {isAdmin && <span style={{ padding:'5px 14px', background:'rgba(255,204,0,0.1)', border:'1px solid rgba(255,204,0,0.4)', borderRadius:20, fontSize:12, ...yellow, fontWeight:700, letterSpacing:1 }}>ADMIN</span>}
          <span style={{ padding:'5px 14px', background:'rgba(0,255,136,0.07)', border:'1px solid #00994d', borderRadius:20, fontSize:12, ...green, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#00ff88', boxShadow:'0 0 6px #00ff88', display:'inline-block' }}></span>
            CHAIN 31337
          </span>
        </div>
      </div>

      {/* INFO BAR */}
      <div style={{ display:'flex', alignItems:'center', gap:0, fontFamily:"Arial, Helvetica, sans-serif", padding:'0 26px', height:38, background:'#050b14', borderBottom:'2px solid #0d2030', flexShrink:0, fontSize:13, overflow:'hidden' }}>
        {[
          ['CONTRACT', maskAddress(CONTRACT_ADDRESS)],
          ['ELECTION', electionTitle||'—'],
          ['PHASE', phaseLabel, phaseColor],
          ['VOTES', String(totalVotes)],
          ['CANDIDATES', String(candidates.length)],
          ['NETWORK', 'Hardhat Local · 127.0.0.1:8545'],
        ].map(([k,v,vc],i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7, paddingRight:22, borderRight:'1px solid #0d2030', marginRight:22, whiteSpace:'nowrap' }}>
            <span style={{ color:'#2a6a8a' }}>{k}</span>
            <span style={{ color:vc||'#7ab8cc' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display:'flex', alignItems:'stretch', padding:'0 28px', height:46, background:'#050b14', borderBottom:'1px solid #0d2030', flexShrink:0 }}>
        {['voter','results',...(isAdmin?['admin']:[])].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'0 24px', fontSize:13, fontWeight:700, letterSpacing:2, textTransform:'uppercase', border:'none', borderBottom:tab===t?'2px solid #00d4ff':'2px solid transparent', color:tab===t?'#00d4ff':'#4a7a9b', background:tab===t?'rgba(0,212,255,0.04)':'transparent', cursor:'pointer', fontFamily:"Arial, Helvetica, sans-serif", transition:'all 0.15s', display:'flex', alignItems:'center', gap:7 }}>
            {t==='voter'?'🗳 Voter Booth':t==='results'?'📊 Live Results':'⚙ Admin Panel'}
          </button>
        ))}
        <button onClick={fetchElectionData} style={{ marginLeft:'auto', padding:'8px 16px', background:'transparent', border:'1px solid #1a3a52', borderRadius:4, color:'#4a7a9b', fontSize:12, cursor:'pointer', alignSelf:'center' }}>↻ Refresh</button>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, padding:'12px 32px', overflow:'hidden' }}>
        {error && <div style={{ ...aErr, marginBottom:10 }}>{error}</div>}

        {/* ══ VOTER TAB ══ */}
        {tab==='voter' && (
          <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:16, height:'100%' }}>

            {/* LEFT COLUMN — Voting Mode + Election Info only, no wallet status */}
            <div style={{ display:'flex', flexDirection:'column', gap:12, height:'100%' }}>

              {/* Voting Mode */}
              <div style={{ ...panel, flex:'0 0 auto' }}>
                <div style={ph()}><span style={pt}>Voting Mode</span></div>
                <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                  <button onClick={()=>setSimMode(false)} style={{ ...mkBtn(simMode?'ghost':'primary',true,true) }}>🦊 MetaMask Wallet</button>
                  <button onClick={()=>{ setSimMode(true); setSimStep('select'); setSimVoter(null); }} style={{ ...mkBtn(simMode?'primary':'ghost',true,true) }}>👥 Voter Simulation</button>
                  <div style={{ fontSize:11, color:'#4a7a9b', lineHeight:1.7, marginTop:4 }}>
                    Simulation lets you vote as different accounts without changing MetaMask.
                  </div>
                </div>
              </div>

              {/* Sim voter selector — only when sim mode */}
              {simMode && (
                <div style={{ ...panel, flex:1 }}>
                  <div style={ph()}><span style={pt}>Select Voter</span></div>
                  <div style={{ padding:10, display:'flex', flexDirection:'column', gap:6, overflow:'auto' }}>
                    {DEMO_VOTERS.map((v,i)=>(
                      <button key={v.address} onClick={()=>handleSimSelect(v)}
                        style={{ ...mkBtn(simVoter?.address===v.address?'primary':'ghost',true,false), justifyContent:'flex-start', gap:10 }}>
                        <span style={{ fontSize:20 }}>{AVATARS[i]}</span>
                        <div style={{ textAlign:'left' }}>
                          <div style={{ fontSize:13, fontWeight:700 }}>{v.label}</div>
                          <div style={{ fontSize:10, color:'#4a7a9b' }}>{maskAddress(v.address)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Election Info — always visible, fills remaining space */}
              <div style={{ ...panel, flex:1 }}>
                <div style={ph()}><span style={pt}>Election Info</span></div>
                <div style={pb}>
                  <div style={row}>
                    <div><span style={key}>Title ......... </span><span style={{ ...val, fontSize:12 }}>{electionTitle||'—'}</span></div>
                    <div><span style={key}>Phase ......... </span><span style={{ color:phaseColor }}>{phaseLabel}</span></div>
                    <div><span style={key}>Candidates .... </span><span style={val}>{candidates.length}</span></div>
                    <div><span style={key}>Total Votes ... </span><span style={cyan}>{totalVotes}</span></div>
                    <div><span style={key}>Contract ...... </span><span style={{ ...cyan, fontSize:11 }}>{maskAddress(CONTRACT_ADDRESS)}</span></div>
                    <div><span style={key}>Network ....... </span><span style={val}>Hardhat Local</span></div>
                    <div><span style={key}>Chain ID ...... </span><span style={val}>31337</span></div>
                  </div>
                  {!simMode && voterStatus && (
                    <>
                      <div style={divider}></div>
                      <div style={row}>
                        <div><span style={key}>Wallet ........ </span><span style={{ ...green, fontSize:11 }}>{maskAddress(account)}</span></div>
                        <div><span style={key}>Authorized .... </span><span style={voterStatus.authorized?green:red}>{voterStatus.authorized?'✓ YES':'✗ NO'}</span></div>
                        <div><span style={key}>Vote Status ... </span><span style={voterStatus.voted?yellow:green}>{voterStatus.voted?'✓ CAST':'○ PENDING'}</span></div>
                        {voterStatus.voted && <div><span style={key}>Voted For ..... </span><span style={val}>{candidates.find(c=>c.id===voterStatus.votedFor)?.name||'—'}</span></div>}
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT: voting panel */}
            <div style={panel}>

              {/* MetaMask voting */}
              {!simMode && (
                <>
                  <div style={ph()}>
                    <span style={pt}>Cast Your Vote</span>
                    <span style={{ padding:'4px 12px', borderRadius:12, fontSize:11, fontWeight:700, letterSpacing:1, ...(phaseNum===1?{ background:'rgba(0,255,136,0.08)', border:'1px solid #00994d', ...green }:{ background:'rgba(255,51,85,0.08)', border:'1px solid #cc1133', ...red }) }}>{phaseNum===1?'VOTING OPEN':'VOTING CLOSED'}</span>
                  </div>
                  <div style={pb}>
                    {phaseNum!==1 && <div style={aWarn}>Voting is only open during the Voting phase. Current: {phaseLabel}.</div>}
                    {voterStatus && !voterStatus.authorized && <div style={aErr}>⚠ Wallet not authorized. Contact admin or use Voter Simulation panel.</div>}
                    {voterStatus?.voted ? (
                      <div>
                        <div style={aInf}>✓ Vote permanently recorded. Double voting is prevented by the smart contract.</div>
                        {txHash && (
                          <div style={{ padding:16, background:'rgba(0,255,136,0.04)', border:'1px solid #004422', borderRadius:8 }}>
                            <div style={{ fontSize:13, fontWeight:700, ...green, letterSpacing:2, marginBottom:12, fontFamily:"'Segoe UI', sans-serif" }}>✓ TRANSACTION CONFIRMED ON CHAIN</div>
                            <div style={row}>
                              <div><span style={key}>Tx Hash ....... </span><span style={{ ...cyan, fontSize:11 }}>{txHash.slice(0,24)}...</span></div>
                              <div><span style={key}>Candidate ..... </span><span style={val}>{candidates.find(c=>c.id===sel)?.name}</span></div>
                              <div><span style={key}>Network ....... </span><span style={val}>Hardhat Local · Chain 31337</span></div>
                              <div><span style={key}>Status ........ </span><span style={green}>SUCCESS ✓</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize:12, color:'#4a7a9b', fontFamily:"'Segoe UI', sans-serif", letterSpacing:1.5, marginBottom:14, paddingBottom:10, borderBottom:'1px solid #1a3a52' }}>SELECT A CANDIDATE — {electionTitle}</div>
                        <div style={{ flex:1 }}>
                          {candidates.map((c,i)=>(
                            <div key={c.id} onClick={()=>phaseNum===1&&voterStatus?.authorized&&setSel(c.id)}
                              style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 18px', background:sel===c.id?'rgba(0,212,255,0.07)':'#070f1a', border:`2px solid ${sel===c.id?'#00d4ff':'#1a3a52'}`, borderRadius:10, cursor:'pointer', marginBottom:10, transition:'all 0.15s', boxShadow:sel===c.id?'0 0 16px rgba(0,212,255,0.1)':'none' }}>
                              <input type="radio" checked={sel===c.id} onChange={()=>{}} style={{ accentColor:'#00d4ff', width:18, height:18 }}/>
                              <div>
                                <div style={{ fontFamily:"'Segoe UI', Tahoma, sans-serif", fontSize:18, fontWeight:500, color:COLORS[i%COLORS.length] }}>{c.name}</div>
                                <div style={{ fontSize:13, color:'#4a7a9b', marginTop:3 }}>{c.party}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop:'auto', paddingTop:14 }}>
                          <button style={{ ...mkBtn('green'), opacity:(loading||phaseNum!==1||!voterStatus?.authorized)?0.35:1 }}
                            onClick={handleVote} disabled={loading||phaseNum!==1||!voterStatus?.authorized}>
                            {loading?'⏳ Mining Block...':'⛓ Cast Vote on Blockchain'}
                          </button>
                          {voteMsg && <div style={{ marginTop:8, fontSize:13, color:voteMsg.startsWith('✓')?'#00ff88':'#ff4466' }}>{voteMsg}</div>}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Voter simulation */}
              {simMode && (
                <>
                  <div style={ph()}>
                    <span style={pt}>{simVoter?`${simVoter.label} · ${maskAddress(simVoter.address)}`:'Voter Simulation'}</span>
                    {simVoter && <span style={{ fontSize:11, color:'#4a7a9b' }}>{simStep.toUpperCase()}</span>}
                  </div>
                  <div style={pb}>
                    {!simVoter && (
                      <div style={{ textAlign:'center', padding:48, color:'#4a7a9b' }}>
                        <div style={{ fontSize:36, marginBottom:12 }}>👈</div>
                        <div style={{ fontSize:14 }}>Select a voter from the left panel to begin simulation</div>
                      </div>
                    )}

                    {simVoter && simStep==='register' && (
                      <>
                        <div style={aInf}>Complete identity verification to proceed.</div>
                        <label style={lbl}>Your Avatar</label>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                          {AVATARS.map(a=>(
                            <button key={a} onClick={()=>setSimAvatar(a)} style={{ width:34, height:34, borderRadius:6, border:`2px solid ${simAvatar===a?'#00d4ff':'#1a3a52'}`, background:simAvatar===a?'rgba(0,212,255,0.1)':'#070f1a', fontSize:17, cursor:'pointer' }}>{a}</button>
                          ))}
                        </div>
                        <label style={lbl}>Full Name</label>
                        <input style={inp} value={simName} onChange={e=>setSimName(e.target.value)} placeholder="Enter your full name"/>
                        <label style={lbl}>Aadhar Last 4 Digits</label>
                        <input style={inp} value={simAadhar} onChange={e=>setSimAadhar(e.target.value.replace(/\D/,'').slice(0,4))} placeholder="XXXX" maxLength={4}/>
                        {simMsg && <div style={aErr}>{simMsg}</div>}
                        <div style={{ marginTop:'auto' }}>
                          <button style={mkBtn('primary')} onClick={async()=>{
                            if(!simName.trim()||simAadhar.length!==4){ setSimMsg('Fill all fields correctly.'); return; }
                            const vs = await contract?.getVoterStatus(simVoter.address).catch(()=>null);
                            if(vs&&vs[0]){ setSimVStatus({authorized:vs[0],voted:vs[1],votedFor:Number(vs[2])}); setSimStep('vote'); setSimMsg(''); }
                            else setSimMsg('⚠ Not authorized. Ask admin to whitelist this wallet first.');
                          }}>Verify Identity & Continue →</button>
                        </div>
                      </>
                    )}

                    {simVoter && simStep==='vote' && (
                      <>
                        <div style={{ padding:12, background:'rgba(0,255,136,0.04)', border:'1px solid #004422', borderRadius:6, marginBottom:14, display:'flex', alignItems:'center', gap:12 }}>
                          <span style={{ fontSize:30 }}>{simAvatar}</span>
                          <div>
                            <div style={{ fontSize:15, fontWeight:700, ...green, fontFamily:"'Segoe UI', sans-serif" }}>{simName||simVoter.label}</div>
                            <div style={{ fontSize:11, color:'#4a7a9b' }}>{maskAddress(simVoter.address)} · Aadhar ****{simAadhar}</div>
                          </div>
                          <span style={{ marginLeft:'auto', padding:'3px 10px', background:'rgba(0,255,136,0.1)', border:'1px solid #00994d', borderRadius:12, fontSize:10, ...green }}>VERIFIED ✓</span>
                        </div>
                        {simVStatus?.voted ? (
                          <div style={aInf}>✓ Already voted. Double voting prevented by smart contract.</div>
                        ) : (
                          <>
                            <div style={{ fontSize:12, color:'#4a7a9b', fontFamily:"'Segoe UI', sans-serif", letterSpacing:1.5, marginBottom:14, paddingBottom:10, borderBottom:'1px solid #1a3a52' }}>SELECT A CANDIDATE</div>
                            {candidates.map((c,i)=>(
                              <div key={c.id} onClick={()=>phaseNum===1&&setSimSel(c.id)}
                                style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 18px', background:simSel===c.id?'rgba(0,212,255,0.07)':'#070f1a', border:`2px solid ${simSel===c.id?'#00d4ff':'#1a3a52'}`, borderRadius:10, cursor:'pointer', marginBottom:10, transition:'all 0.15s' }}>
                                <input type="radio" checked={simSel===c.id} onChange={()=>{}} style={{ accentColor:'#00d4ff', width:18, height:18 }}/>
                                <div>
                                  <div style={{ fontFamily:"'Segoe UI', Tahoma, sans-serif", fontSize:18, fontWeight:500, color:COLORS[i%COLORS.length] }}>{c.name}</div>
                                  <div style={{ fontSize:13, color:'#4a7a9b', marginTop:3 }}>{c.party}</div>
                                </div>
                              </div>
                            ))}
                            <div style={{ marginTop:'auto', paddingTop:14 }}>
                              <button style={{ ...mkBtn('green'), opacity:(simLoading||phaseNum!==1)?0.35:1 }}
                                onClick={handleSimVote} disabled={simLoading||phaseNum!==1}>
                                {simLoading?'⏳ Mining Block...':'⛓ Cast Vote on Blockchain'}
                              </button>
                              {simMsg && <div style={{ marginTop:8, fontSize:13, color:simMsg.startsWith('✓')?'#00ff88':'#ff4466' }}>{simMsg}</div>}
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {simVoter && simStep==='done' && (
                      <div>
                        <div style={{ textAlign:'center', padding:'20px 0 16px' }}>
                          <div style={{ fontSize:52 }}>✅</div>
                          <div style={{ fontSize:20, fontWeight:700, ...green, fontFamily:"'Segoe UI', sans-serif", marginTop:10 }}>Vote Confirmed!</div>
                        </div>
                        <div style={{ padding:16, background:'rgba(0,255,136,0.04)', border:'1px solid #004422', borderRadius:8, marginBottom:14 }}>
                          <div style={row}>
                            <div><span style={key}>Voter ..... </span><span style={val}>{simName||simVoter.label} {simAvatar}</span></div>
                            <div><span style={key}>Aadhar .... </span><span style={val}>****{simAadhar}</span></div>
                            <div><span style={key}>Tx Hash ... </span><span style={{ ...cyan, fontSize:11 }}>{simTxHash.slice(0,24)}...</span></div>
                            <div><span style={key}>Voted For . </span><span style={val}>{candidates.find(c=>c.id===simSel)?.name}</span></div>
                            <div><span style={key}>Status .... </span><span style={green}>IMMUTABLE ON CHAIN ✓</span></div>
                          </div>
                        </div>
                        <button style={mkBtn('ghost')} onClick={()=>{ setSimVoter(null); setSimStep('select'); setSimSel(null); setSimTxHash(''); setSimMsg(''); }}>← Vote as Different Voter</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══ RESULTS TAB ══ */}
        {tab==='results' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:18, height:'100%' }}>
            <div style={panel}>
              <div style={ph()}>
                <span style={pt}>Live Vote Tally</span>
                <span style={{ fontSize:13, ...muted }}>{totalVotes} votes cast</span>
              </div>
              <div style={pb}>
                {phaseNum===2 && winner && (
                  <div style={{ padding:20, background:'linear-gradient(135deg,rgba(255,204,0,0.1),rgba(255,204,0,0.05))', border:'2px solid #ffcc0055', borderRadius:10, marginBottom:20, textAlign:'center' }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>🏆</div>
                    <div style={{ fontSize:11, color:'#aa8800', letterSpacing:2, marginBottom:4 }}>ELECTION WINNER</div>
                    <div style={{ fontSize:26, fontWeight:700, ...yellow, fontFamily:"'Segoe UI', sans-serif" }}>{winner.name}</div>
                    <div style={{ fontSize:13, color:'#aa8800', marginTop:4 }}>{winner.party} · {winner.voteCount} votes</div>
                  </div>
                )}
                {candidates.length===0 ? (
                  <div style={{ textAlign:'center', padding:40, ...muted }}>No candidates registered.</div>
                ) : [...candidates].sort((a,b)=>b.votes-a.votes).map((c,i)=>{
                  const pct = totalVotes?Math.round(c.votes/totalVotes*100):0;
                  return (
                    <div key={c.id} style={{ marginBottom:22 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:7 }}>
                        <div>
                          <span style={{ fontFamily:"Arial, Helvetica, sans-serif", fontSize:18, fontWeight:600, color:COLORS[i%COLORS.length] }}>{i===0&&totalVotes>0?'👑 ':''}{c.name}</span>
                          <span style={{ marginLeft:12, fontSize:13, ...muted }}>{c.party}</span>
                        </div>
                        <span style={{ fontSize:14, ...cyan }}>{c.votes} votes</span>
                      </div>
                      <div style={{ height:10, background:'#070f1a', borderRadius:5, overflow:'hidden', border:'1px solid #1a3a52' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${COLORS[i%COLORS.length]}66,${COLORS[i%COLORS.length]})`, borderRadius:5, transition:'width 0.6s ease' }}></div>
                      </div>
                      <div style={{ textAlign:'right', fontSize:12, ...muted, marginTop:4 }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={panel}>
              <div style={ph()}><span style={pt}>Summary</span></div>
              <div style={pb}>
                <div style={row}>
                  <div><span style={key}>Election ...... </span><span style={{ ...val, fontSize:13 }}>{electionTitle}</span></div>
                  <div><span style={key}>Phase ......... </span><span style={{ color:phaseColor }}>{phaseLabel}</span></div>
                  <div><span style={key}>Candidates .... </span><span style={val}>{candidates.length}</span></div>
                  <div><span style={key}>Votes Cast .... </span><span style={green}>{totalVotes}</span></div>
                </div>
                <div style={divider}></div>
                <div style={row}>
                  <div><span style={key}>Language ...... </span><span style={val}>Solidity ^0.8.0</span></div>
                  <div><span style={key}>Network ....... </span><span style={val}>Hardhat Local</span></div>
                  <div><span style={key}>Framework ..... </span><span style={val}>Hardhat + Ethers.js</span></div>
                  <div><span style={key}>Anti-dbl-vote . </span><span style={green}>mapping(addr⇒bool)</span></div>
                  <div><span style={key}>Contract ...... </span><span style={{ ...cyan, fontSize:11 }}>{maskAddress(CONTRACT_ADDRESS)}</span></div>
                </div>
                {phaseNum===2 && winner && (
                  <>
                    <div style={divider}></div>
                    <div style={{ padding:14, background:'rgba(255,204,0,0.07)', border:'1px solid #aa880044', borderRadius:6 }}>
                      <div style={{ fontSize:11, color:'#aa8800', letterSpacing:1.5, marginBottom:6 }}>WINNER</div>
                      <div style={{ fontSize:17, fontWeight:700, ...yellow, fontFamily:"'Segoe UI', sans-serif" }}>🏆 {winner.name}</div>
                      <div style={{ fontSize:12, color:'#aa8800', marginTop:4 }}>{winner.party} · {winner.voteCount} votes</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ ADMIN TAB ══ */}
        {tab==='admin' && isAdmin && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, height:'100%' }}>

            {/* Phase control */}
            <div style={panel}>
              <div style={ph()}><span style={pt}>Election Phases</span></div>
              <div style={pb}>
                <div style={{ ...row, marginBottom:12 }}>
                  <div><span style={key}>Current Phase .. </span><span style={{ color:phaseColor, fontWeight:700 }}>{phaseLabel}</span></div>
                  <div><span style={key}>Candidates ..... </span><span style={val}>{candidates.length}</span></div>
                  <div><span style={key}>Total Votes .... </span><span style={green}>{totalVotes}</span></div>
                </div>
                {[
                  { label:'📋 Registration', desc:'Add candidates & authorize voters', i:0, color:'#ffcc00' },
                  { label:'🗳 Voting',        desc:'Voters cast their votes',           i:1, color:'#00ff88' },
                  { label:'🏁 Ended',         desc:'Results finalized on chain',        i:2, color:'#4a7a9b' },
                ].map(p=>(
                  <div key={p.i} style={{ padding:'10px 14px', borderRadius:6, border:`1px solid ${phaseNum===p.i?p.color+'55':'#1a3a52'}`, background:phaseNum===p.i?`rgba(${p.i===0?'255,204,0':p.i===1?'0,255,136':'74,122,155'},0.06)`:'#070f1a', marginBottom:8 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:phaseNum===p.i?p.color:'#4a7a9b', fontFamily:"'Segoe UI', sans-serif" }}>{p.label}{phaseNum===p.i?' ← CURRENT':''}</div>
                    <div style={{ fontSize:11, color:'#4a7a9b', marginTop:2 }}>{p.desc}</div>
                  </div>
                ))}
                <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:8 }}>
                  {phaseNum===0 && <button style={mkBtn('green')} onClick={handleStartVoting} disabled={loading}>▶ Start Voting Phase</button>}
                  {phaseNum===1 && <button style={mkBtn('red')}   onClick={handleEndVoting}   disabled={loading}>■ End Election</button>}
                  {phaseNum===2 && <div style={aInf}>Election ended. Results are final and immutable.</div>}
                  {phaseMsg && <div style={phaseMsg.startsWith('✓')?aOk:aErr}>{phaseMsg}</div>}
                </div>
              </div>
            </div>

            {/* Add candidate */}
            <div style={panel}>
              <div style={ph()}>
                <span style={pt}>Add Candidate</span>
                <span style={{ fontSize:11, color:phaseNum===0?'#00ff88':'#ff4466' }}>{phaseNum===0?'● OPEN':'● LOCKED'}</span>
              </div>
              <div style={pb}>
                {phaseNum!==0 && <div style={aWarn}>Candidates can only be added during Registration phase.</div>}
                <label style={lbl}>Candidate Icon</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                  {CAND_ICONS.map(a=>(
                    <button key={a} onClick={()=>setCandIcon(a)} style={{ width:38, height:38, borderRadius:12, border:`2px solid ${candIcon===a?'#00d4ff':'#1a3a52'}`, background:candIcon===a?'rgba(0,212,255,0.1)':'#070f1a', fontSize:18, cursor:'pointer' }}>{a}</button>
                  ))}
                </div>
                <label style={lbl}>Candidate Name</label>
                <input style={inp} value={candName} onChange={e=>setCandName(e.target.value)} placeholder="e.g. Kruti Bagwe" disabled={phaseNum!==0}/>
                <label style={lbl}>Party / Affiliation</label>
                <input style={inp} value={candParty} onChange={e=>setCandParty(e.target.value)} placeholder="e.g. Progressive Alliance" disabled={phaseNum!==0}/>
                <div style={{ marginTop:'auto' }}>
                  <button style={{ ...mkBtn('primary'), opacity:phaseNum!==0?0.35:1 }} onClick={handleAddCandidate} disabled={loading||phaseNum!==0}>+ Register Candidate</button>
                  {candMsg && <div style={{ ...candMsg.startsWith('✓')?aOk:aErr, marginTop:8 }}>{candMsg}</div>}
                </div>
                {candidates.length>0 && (
                  <>
                    <div style={divider}></div>
                    <div style={{ fontSize:11, color:'#4a7a9b', marginBottom:6, letterSpacing:1 }}>REGISTERED ({candidates.length})</div>
                    {candidates.map((c,i)=>(
                      <div key={c.id} style={{ padding:'6px 10px', background:'#070f1a', border:'1px solid #1a3a52', borderRadius:5, marginBottom:5, fontSize:13, color:COLORS[i%COLORS.length] }}>
                        {c.name} <span style={{ color:'#4a7a9b', fontSize:11 }}>· {c.party}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Authorize voter */}
            <div style={panel}>
              <div style={ph()}>
                <span style={pt}>Authorize Voter</span>
                <span style={{ fontSize:11, ...green }}>● ALWAYS OPEN</span>
              </div>
              <div style={pb}>
                <label style={lbl}>Voter Avatar</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                  {AVATARS.map(a=>(
                    <button key={a} onClick={()=>setVAvatar(a)} style={{ width:36, height:36, borderRadius:14, border:`2px solid ${vAvatar===a?'#00d4ff':'#1a3a52'}`, background:vAvatar===a?'rgba(0,212,255,0.1)':'#070f1a', fontSize:16, cursor:'pointer' }}>{a}</button>
                  ))}
                </div>
                <label style={lbl}>Full Name</label>
                <input style={inp} value={vName} onChange={e=>setVName(e.target.value)} placeholder="e.g. Tanmay Bhatkar"/>
                <label style={lbl}>Aadhar Last 4 Digits</label>
                <input style={inp} value={vAadhar} onChange={e=>setVAadhar(e.target.value.replace(/\D/,'').slice(0,4))} placeholder="XXXX" maxLength={4}/>
                <label style={lbl}>Wallet Address</label>
                <select style={{ ...inp }} value={vAddr} onChange={e=>setVAddr(e.target.value)}>
                  <option value="">-- Select demo voter --</option>
                  {DEMO_VOTERS.map(v=>(
                    <option key={v.address} value={v.address}>{v.label} · {maskAddress(v.address)}</option>
                  ))}
                  <option value="custom">Custom address...</option>
                </select>
                {vAddr==='custom' && <input style={inp} placeholder="0x..." onChange={e=>setVAddr(e.target.value)}/>}
                <div style={{ marginTop:'auto' }}>
                  <button style={mkBtn('primary')} onClick={handleAuthorizeVoter} disabled={loading}>+ Authorize Voter</button>
                  {vMsg && <div style={{ ...vMsg.startsWith('✓')?aOk:aErr, marginTop:8 }}>{vMsg}</div>}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}