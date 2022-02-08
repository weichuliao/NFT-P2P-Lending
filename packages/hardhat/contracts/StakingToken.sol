pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StakingToken is ERC20, Ownable {
   using SafeMath for uint256;

   /**
    * @notice The constructor for the Staking Token.
    */
    constructor()
       public
    {
        
    }

    /**
    * @notice Enum describing the current state of a loan
    * DUMMY_DO_NOT_USE: We need a default that is not 'Created' - this is the zero value
    * CREATED: The loan data is stored, but not initiated yet.
    * REMOVED: The created loan was removed.
    * ACTIVE: The loan has been initialized, funds have been delivered to the borrower and the collateral is held.
    * REPAID: The loan has been repaid, and the collateral has been returned to the borrower. This is a terminal state.
    * DEFAULTED: The loan was delinquent and collateral claimed by the lender. This is a terminal state.
    */
    enum LoanStatus {
        DUMMY_DO_NOT_USE,
        CREATED,
        REMOVED,
        ACTIVE,
        REPAID,
        DEFAULTED
    }

    /**
    * @notice Struct describing the content of a loan
    */
    struct LoanData {
        // The current state of a loan
        LoanStatus loanState;
        // The wallet address of the borrower
        address borrower;
        // The wallet address of the lender
        address lender;
        // The number of seconds representing relative due date of the loan
        uint256 deadline;
        // The payable currency for the loan principal and interest
        address payableCurrency;
        // The amount of principal in terms of the payableCurrency
        uint256 principal;
        // The amount of repayment in terms of the payableCurrency
        uint256 repayment;
        // The token of the NFT
        address nftToken;
    }

    /**
    * @notice An array storing all the loans on the contract
    */
    LoanData[] loans;

    /**
    * @notice recording the borrower of a loan
    */
    mapping (uint => address) loanToBorrower;

    /**
    * @notice recording the lender of a loan
    */
    mapping (uint => address) loanToLender;

    /**
    * @notice collecting the total number of a borrower's loans
    */
    mapping (address => uint) countOfBorrowerLoan;
    /**
    * @notice collecting the total number of a borrower's loans
    */
    mapping (address => uint) countOfLenderLoan;

    /**
    * @notice A method to retrieve the CREATED and ACTIVE loans of a borrower.
    * @param _borrower The borrower to retrieve the loan for.
    * @return An array of the IDs of a borrower's loans.
    */
    function getLoansOf(address _borrower)
        external
        view
        returns (uint[] memory)
    {
        uint[] memory result = new uint[](countOfBorrowerLoan[_borrower]);
        uint counter = 0;
        for (uint i = 0; i < loans.length; i++) {
            if (loans[i] == _borrower &&
                (loans[i].LoanStatus == LoanStatus.CREATED || loans[i].LoanStatus == LoanStatus.ACTIVE)) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    /**
    * @notice A method to retrieve the details of a loan.
    * @dev The loan ID can be retrieved from the function getLoansOf().
    * @param _loanID The ID of a loan.
    * @return The detailed data of a loan.
    */
    function getDetailedLoan(uint _loanID)
        external
        view
        returns (LoanData)
    {
        require(loans[_loanID].LoanStatus != LoanStatus.REMOVED, "The loan was removed.");
        return loans[_loanID];
    }

    /**
    * @notice An event of creating a new loan.
    */
    event NewLoan(uint ID, address nftToken);

    /**
    * @notice A method for a borrower to create a loan.
    * @param _parameter Please refer to the struct of Loan.
    * @return A boolean to indicate the success or failure of loan creation.
    */
    function createLoan(address _borrower, uint256 _deadline, address _payableCurrency, uint256 _principal, uint256 _repayment, address nftToken)
        public
    {
        uint ID = loans.push(Loan(_borrower, address(0), _deadline, _payableCurrency, _principal, _repayment, nftToken));
        loanToBorrower[id] = msg.sender;
        countOfBorrowerLoan[msg.sender]++;
        emit NewLoan(ID, nftToken);
    }

    /**
    * @notice A method for a stakeholder to remove a created loan.
    * @param _loanID The loan chosen to be removed.
    */
    function removeLoan(uint _loanID)
        public
    {
        require(loanToBorrowe[_loanID] == msg.sender, "The loan does NOT exist.");
        loans[_loanID].LoanStatus = LoanStatus.REMOVED;
        countOfBorrowerLoan[msg.sender]--;
    }

    /**
    * @notice
    * @param _loanID The loan chosen to be dealed.
    */
    function dealLoan(uint _loanID)
        public
    {
        require(loanToBorrower[_loanID] != msg.sender, "You cannot make a deal with your own loan.");
        loans[_loanID].LoanStatus = LoanStatus.ACTIVE;
        loans[_loanID].lender = msg.sender;
        loanToLender[_loanID] = msg.sender;
        countOfLenderLoan[msg.sender]++;
        address borrower = loans[_loanID].borrower;
        // TODO: transfer principal (ETH or USDT) from lender to borrower
    }

    /**
    * @notice A method for a borrower to repay his/her loan.
    * @param _loanID The loan chosen to be repaid.
    */
    function repayLoan(uint _loanID)
        public
    {
        require(loanToBorrower[_loanID] == msg.sender, "You cannot repay other's loan.");
        loans[_loanID].LoanStatus = LoanStatus.REPAID;
        address lender = loans[_loanID].lender;
        // TODO: transfer repayment (ETH or USDT) from borrower to lender
    }

    /**
    * @notice A method for a lender to claim the collateral.
    * @param 
    */
    function claimCollateral()
        public
    {
        // TODO: lender claims borrower's NFT collateral when deadline met
    }
    
    function executeSetIfSignatureMatch(
        uint8 v,
        bytes32 r,
        bytes32 s,
        address borrower,
        uint256 principal,
        uint256 repayment,
        address currency,
        uint256 deadline,
        address nft
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
                keccak256(bytes("CuterDAO")),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );  

        bytes32 hashStruct = keccak256(
            abi.encode(
                keccak256("set(address borrower,uint principal,uint repayment,address currency,uint deadline,address nft)"),
                borrower,
                principal,
                repayment,
                currency,
                deadline,
                nft
            )
        );

        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct));
        address signer = ecrecover(hash, v, r, s);
        require(signer == borrower, "MyFunction: invalid signature");
        require(signer != address(0), "ECDSA: invalid signature");
    }
}