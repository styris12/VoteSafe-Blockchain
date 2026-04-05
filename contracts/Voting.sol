// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {

    // ── Enums ─────────────────────────────────────
    enum Phase { Registration, Voting, Ended }

    // ── Data Structures ───────────────────────────
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    struct Voter {
        bool authorized;
        bool voted;
        uint256 votedFor;
        string voterName;
        string aadharLast4;
    }

    // ── State Variables ───────────────────────────
    address public admin;
    string public electionTitle;
    Phase public currentPhase;
    uint256 public candidateCount;
    uint256 public totalVotes;
    uint256 public authorizedVoterCount;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;

    // ── Events ────────────────────────────────────
    event PhaseChanged(Phase newPhase, uint256 timestamp);
    event CandidateRegistered(uint256 id, string name, string party);
    event VoterAuthorized(address voter, string name);
    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 timestamp);

    // ── Modifiers ─────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this.");
        _;
    }

    modifier inPhase(Phase _phase) {
        require(currentPhase == _phase, "Wrong election phase.");
        _;
    }

    // ── Constructor ───────────────────────────────
    constructor(string memory _title) {
        admin = msg.sender;
        electionTitle = _title;
        currentPhase = Phase.Registration;
        candidateCount = 0;
        totalVotes = 0;
        authorizedVoterCount = 0;
    }

    // ── Phase Control ─────────────────────────────
    function startVoting() public onlyAdmin inPhase(Phase.Registration) {
        require(candidateCount >= 2, "Need at least 2 candidates.");
        require(authorizedVoterCount >= 1, "Need at least 1 authorized voter.");
        currentPhase = Phase.Voting;
        emit PhaseChanged(Phase.Voting, block.timestamp);
    }

    function endVoting() public onlyAdmin inPhase(Phase.Voting) {
        currentPhase = Phase.Ended;
        emit PhaseChanged(Phase.Ended, block.timestamp);
    }

    // ── Admin Functions ───────────────────────────
    function addCandidate(string memory _name, string memory _party)
        public onlyAdmin inPhase(Phase.Registration) {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, _party, 0);
        emit CandidateRegistered(candidateCount, _name, _party);
    }

    function authorizeVoter(address _voter, string memory _name, string memory _aadharLast4)
        public onlyAdmin {
        require(!voters[_voter].authorized, "Already authorized.");
        voters[_voter] = Voter(true, false, 0, _name, _aadharLast4);
        authorizedVoterCount++;
        emit VoterAuthorized(_voter, _name);
    }

    // ── Voter Functions ───────────────────────────
    function castVote(uint256 _candidateId) public inPhase(Phase.Voting) {
        require(voters[msg.sender].authorized, "Not authorized to vote.");
        require(!voters[msg.sender].voted, "Already voted.");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate.");

        voters[msg.sender].voted = true;
        voters[msg.sender].votedFor = _candidateId;
        candidates[_candidateId].voteCount++;
        totalVotes++;

        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }

    // ── View Functions ────────────────────────────
    function getCandidate(uint256 _id) public view returns (
        uint256 id, string memory name, string memory party, uint256 voteCount
    ) {
        require(_id > 0 && _id <= candidateCount, "Invalid candidate ID.");
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.party, c.voteCount);
    }

    function getVoterStatus(address _voter) public view returns (
        bool authorized, bool voted, uint256 candidateIdVotedFor,
        string memory voterName, string memory aadharLast4
    ) {
        Voter memory v = voters[_voter];
        return (v.authorized, v.voted, v.votedFor, v.voterName, v.aadharLast4);
    }

    function getResults() public view returns (
        uint256[] memory ids,
        string[] memory names,
        uint256[] memory voteCounts
    ) {
        ids = new uint256[](candidateCount);
        names = new string[](candidateCount);
        voteCounts = new uint256[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            ids[i-1] = candidates[i].id;
            names[i-1] = candidates[i].name;
            voteCounts[i-1] = candidates[i].voteCount;
        }
        return (ids, names, voteCounts);
    }

    function getPhase() public view returns (uint8) {
        return uint8(currentPhase);
    }

    function getWinner() public view inPhase(Phase.Ended) returns (
        string memory name, string memory party, uint256 voteCount
    ) {
        require(totalVotes > 0, "No votes cast.");
        uint256 winnerId = 1;
        for (uint256 i = 2; i <= candidateCount; i++) {
            if (candidates[i].voteCount > candidates[winnerId].voteCount) {
                winnerId = i;
            }
        }
        return (candidates[winnerId].name, candidates[winnerId].party, candidates[winnerId].voteCount);
    }
}