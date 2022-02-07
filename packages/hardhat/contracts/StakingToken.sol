pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Lender.sol";
import "./Borrower.sol";

contract StakingToken is ERC20, Ownable {
   using SafeMath for uint256;

   /**
    * @notice The constructor for the Staking Token.
    * @param _owner The address to receive all tokens on construction.
    * @param _supply The amount of tokens to mint on construction.
    */
   constructor(address _owner, uint256 _supply)
       public
   {
       _mint(_owner, _supply);
   }

    /**
    * @notice We usually require to know who are all the stakeholders.
    */
    address[] internal stakeholders;
    
    /**
    * @notice A method to check if an address is a stakeholder.
    * @param _address The address to verify.
    * @return bool, uint256 Whether the address is a stakeholder,
    * and if so its position in the stakeholders array.
    */
    function isStakeholder(address _address) 
        public
        view
        returns (bool, uint)
    {
        for (uint i = 0; i < stakeholders.length; i++) {
            if (_address == stakeholders[i]) return (true, i);
        }
        return (false, 0);
    }

    /**
    * @notice A method to add a stakeholder.
    * @param _stakeholder The stakeholder to add.
    */
    function addStakeholder(address _stakeholder) 
        public
    {
        (bool _isStakeholder, ) = isStakeholder(_stakeholder);
        if (!_isStakeholder) stakeholders.push(_stakeholder);
    }

    /**
    * @notice A method to remove a stakeholder.
    * @param _stakeholder The stakeholder to remove.
    */
    function removeStakeholder(address _stakeholder)
        public
    {
        (bool _isStakeholder, uint i) = isStakeholder(_stakeholder);
        if (_isStakeholder) {
            stakeholders[i] = stakeholders[stakeholders.length - 1];
            stakeholders.pop();
        }
    }

    /**
    * @notice The stakes for each stakeholder.
    */
    mapping(address => uint256) internal stakes;

    enum LoanState {
        DUMMY_DO_NOT_USE,
        Created,
        Active,
        Repaid,
        Defaulted
    }

    struct LoanData {
        LoanState loanState;
        // The number of seconds representing relative due date of the loan
        uint256 durationSecs;
        // The amount of principal in terms of the payableCurrency
        uint256 principal;
        // The amount of repayment in terms of the payableCurrency
        uint256 repayment;
        // The tokenID of the NFT
        string nftTokenId;
        // The payable currency for the loan principal and interest
        address payableCurrency;
    }
    LoanData[] loadData;

    /**
    * @notice A method to retrieve the stake for a stakeholder.
    * @param _stakeholder The stakeholder to retrieve the stake for.
    * @return uint256 The amount of wei staked.
    */
    function stakeOf(address _stakeholder)
        public
        view
        returns (uint)
    {
        return stakes[_stakeholder];
    }

    /**
    * @notice A method to the aggregated stakes from all stakeholders.
    * @return uint256 The aggregated stakes from all stakeholders.
    */
    function totalStakes()
        public
        view
        returns (uint)
    {
        uint _totalStakes = 0;
        for (uint i = 0; i < stakeholders.length; i++) {
            _totalStakes = _totalStakes.add(stakes[stakeholders[i]]);
        }
        return _totalStakes;
    }

    /**
    * @notice A method for a stakeholder to create a stake.
    *         Please note that _burn will revert if the user tries to stake more tokens than he owns.
    * @param _stake The size of the stake to be created.
    */
    function createStake(uint _stake)
        public
    {
        _burn(msg.sender, _stake);
        if (stakes[msg.sender] == 0) addStakeholder(msg.sender);
        stakes[msg.sender] = stakes[msg.sender].add(_stake);
    }

    /**
    * @notice A method for a stakeholder to remove a stake.
    *         The update of the stakes mapping will revert if there is an attempt to remove more tokens that were staked.
    * @param _stake The size of the stake to be removed.
    */
    function removeStake(uint _stake)
        public
    {
        stakes[msg.sender] = stakes[msg.sender].sub(_stake);
        if (stakes[msg.sender] == 0) removeStakeholder(msg.sender);
        _mint(msg.sender, _stake);
    }
    
    function executeSetIfSignatureMatch(
        uint8 v,
        bytes32 r,
        bytes32 s,
        address sender,
        uint256 deadline,
        uint x
    ) external {
        require(block.timestamp < deadline, "Signed transaction expired");

        uint chainId;
        assembly {
            chainId := chainid
        }
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("SetTest")),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );  

        bytes32 hashStruct = keccak256(
        abi.encode(
            keccak256("set(address sender,uint x,uint deadline)"),
            sender,
            x,
            deadline
            )
        );

        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct));
        address signer = ecrecover(hash, v, r, s);
        require(signer == sender, "MyFunction: invalid signature");
        require(signer != address(0), "ECDSA: invalid signature");

        set(x);
    }
}




const domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
    // { name: "salt", type: "bytes32" },
];
// const bid = [
//     { name: "amount", type: "uint256" },
//     { name: "bidder", type: "Identity" },
// ];
// const identity = [
//     { name: "userId", type: "uint256" },
//     { name: "wallet", type: "address" },
// ];
const set = [
    { name: "borrower", type: "address" },
    { name: "principal", type: "uint" },
    { name: "repayment", type: "uint" },
    { name: "currency", type: "address" },
    { name: "deadline", type: "uint" },
    { name: "nft", type: "address" },
];
const domainData = {
    name: "CuterDAO",
    version: "1",
    chainId: "1",    // ethers 可以拿到再放進來
    verifyingContract: "0x3333333333333333333333333333333333333333",
    // salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
};
const setData = {
    borrower: "0x3333333333333333333333333333333333333333",    // 借款的錢包地址
    principal: 100,    // 借多少
    repayment: 105,  // 還多少
    currency: "0x3333333333333333333333333333333333333333",    // 借款 token address
    deadline: 12345678,    // 還款時間
    nft: "0x3333333333333333333333333333333333333333",    // NFT token ID
}
var message = {
    amount: 100,    // 借多少
    wallet: "0x3333333333333333333333333333333333333333",    // 借款的錢包地址
    nft: "0x3333333333333333333333333333333333333333",    // NFT token ID
};
const data = JSON.stringify({
    types: {
        EIP712Domain: domain,
        // Bid: bid,
        // Identity: identity,
        set: set
    },
    domain: domainData,
    primaryType: "set",
    message: message
});