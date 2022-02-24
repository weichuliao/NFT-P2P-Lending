pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StakingToken {
   using SafeMath for uint256;

	/**
	 * Contract owner
	 */
	address private _owner;

   /**
    * @notice The constructor for the Staking Token.
    */
    constructor()
    {
        _owner = msg.sender;
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
        LoanStatus status;
		// An unique id to identify loan
		uint256 loanID;
        // The wallet address of the borrower
        address borrower;
        // The wallet address of the lender
        address lender;
        // The number of seconds representing relative due date of the loan
        uint256 deadline;
        // The payable currency for the loan principal and interest
        // address payableCurrency;
        // The amount of principal in terms of the payableCurrency
        uint256 principal;
        // The amount of repayment in terms of the payableCurrency
        uint256 repayment;
        // The token address of the NFT
        address nftTokenAddress;
        // NFT token ID
        uint256 nftTokenID;
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
        returns (LoanData[] memory)
    {
        LoanData[] memory result = new LoanData[](countOfBorrowerLoan[_borrower]);
        uint counter = 0;
        for (uint i = 0; i < loans.length; i++) {
            if (loans[i].borrower == _borrower &&
                (loans[i].status == LoanStatus.CREATED || loans[i].status == LoanStatus.ACTIVE))
			{
                result[counter] = loans[i];
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
        returns (LoanData memory)
    {
        require(loans[_loanID].status != LoanStatus.REMOVED, "The loan was removed.");
        return loans[_loanID];
    }


    /**
     * @dev Retrives the biddable loans by status.
     */
    function getAllLoanRequests()
        public
        view
        returns (LoanData[] memory)
    {
        LoanData[] memory loanRequests = new LoanData[](loans.length);
        uint256 loanIndex = 0;
        for(uint i = 0; i < loans.length; i++)
        {
            if(loans[i].status == LoanStatus.CREATED || loans[i].status == LoanStatus.ACTIVE)
            {
                loanRequests[loanIndex] = loans[i];
                loanIndex++;
            }
        }
        return (loanRequests);
    }

    /**
    * @notice An event of creating a new loan.
    */
    event NewLoan(uint ID, address nftTokenAddress, uint256 nftTokenID);

    // @notice A method for a borrower to create a loan.
    // @param _parameter Please refer to the struct of Loan.
    // @return The ID of the loan created.
    function createLoan(
        // address _borrower,
        uint256 _deadline,
        // address _payableCurrency,
        uint256 _principal,
        uint256 _repayment, 
        address _nftTokenAddress,
        uint256 _nftTokenID
    ) external returns(uint256) {
        // transfer NFT to contract
        IERC721(_nftTokenAddress).transferFrom(msg.sender, address(this), _nftTokenID);

		uint256 _nextID = loans.length + 1;
        loans.push(
			LoanData(
				LoanStatus.CREATED,
				_nextID,
				msg.sender,
				address(0),
				_deadline,
				// _payableCurrency,
				_principal,
				_repayment,
				_nftTokenAddress,
				_nftTokenID
			)
		);

        loanToBorrower[_nextID] = msg.sender;
        countOfBorrowerLoan[msg.sender]++;

        emit NewLoan(_nextID, _nftTokenAddress, _nftTokenID);
        return _nextID;
    }

    /**
    * @notice An event of removing an existing loan.
    */
    event LoanRemoved(uint256 _loanID);

    /**
    * @notice A method for a stakeholder to remove a created loan.
    * @param _loanID The loan chosen to be removed.
    */
    function removeLoan(uint256 _loanID)
        public
    {
        // require(loanToBorrower[_loanID] == msg.sender, "The loan does NOT exist.");
        LoanData storage loan = loans[_loanID];
        IERC721(loan.nftTokenAddress).transferFrom(address(this), loan.borrower, loan.nftTokenID);
        loan.status = LoanStatus.REMOVED;
        countOfBorrowerLoan[msg.sender]--;
        emit LoanRemoved(_loanID);
    }

    /**
    * @notice An event of dealing an existing loan.
    */
    event LoanDealed(uint256 _loanID);

    /**
    * @notice
    * @param _loanID The loan chosen to be dealed.
    */
    function dealLoan(uint256 _loanID)
        external
        payable
    {
        // require(loanToBorrower[_loanID] != msg.sender, "You cannot make a deal with your own loan.");

        // The lender sends the principal to the borrower.
        // TODO: how to send USDT?
        (bool sent, ) = payable(loans[_loanID].borrower).call{ value: (loans[_loanID].principal) }("");
        require(sent, "Failed to make a deal of the loan.");

        loans[_loanID].lender = msg.sender;
        loanToLender[_loanID] = msg.sender;
        countOfLenderLoan[msg.sender]++;

        // Set the loan status to ACTIVE.
        loans[_loanID].status = LoanStatus.ACTIVE;

        emit LoanDealed(_loanID);
    }

    /**
    * @notice An event of repaying an existing loan.
    */
    event LoanRepaid(uint256 _loanID);

    /**
    * @notice A method for a borrower to repay his/her loan.
    * @param _loanID The loan chosen to be repaid.
    */
    function repayLoan(uint256 _loanID)
        external
        payable
    {
        // No one but the borrower can repay his/her loan.
        // require(loanToBorrower[_loanID] == msg.sender, "You cannot repay other's loan.");

        // TODO: how to send USDT?
        LoanData storage loan = loans[_loanID];
        (bool sent, ) = payable(loan.lender).call{ value: (loan.principal) }("");
        require(sent, "Failed to repay the loan.");

        // transfer NFT (from contract) back to the borrower.
        IERC721(loan.nftTokenAddress).transferFrom(address(this), loan.borrower, loan.nftTokenID);

        // change the loan status to REPAID (a terminal state).
        loan.status = LoanStatus.REPAID;

        emit LoanRepaid(_loanID);
    }

    /**
    * @notice An event of claiming borrower's collateral.
    */
    event collateralClaimed(uint256 _loanID);

    // @notice A method for a lender to claim the collateral.
    // @param _loanID
    function claimCollateral(uint256 _loanID)
        public
    {
        // TODO: check the deadline is expired.
        LoanData storage loan = loans[_loanID];
        IERC721(loan.nftTokenAddress).transferFrom(address(this), loan.lender, loan.nftTokenID);
        emit collateralClaimed(_loanID);
    }
    
    /**
    * @notice This method is pending. DO NOT USE.
    */
    // function executeSetIfSignatureMatch(
    //     uint8 v,
    //     bytes32 r,
    //     bytes32 s,
    //     address borrower,
    //     uint256 principal,
    //     uint256 repayment,
    //     address currency,
    //     uint256 deadline,
    //     address nft
    // ) external {
    //     require(block.timestamp < deadline, "Signed transaction expired");

    //     uint256 chainId;
    //     assembly {
    //         chainId := chainid
    //     }
    //     bytes32 eip712DomainHash = keccak256(
    //         abi.encode(
    //             keccak256(
    //                 "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    //             ),
    //             keccak256(bytes("CuterDAO")),
    //             keccak256(bytes("1")),
    //             chainId,
    //             address(this)
    //         )
    //     );  

    //     bytes32 hashStruct = keccak256(
    //         abi.encode(
    //             keccak256("set(address borrower,uint256 principal,uint256 repayment,address currency,uint256 deadline,address nft)"),
    //             borrower,
    //             principal,
    //             repayment,
    //             currency,
    //             deadline,
    //             nft
    //         )
    //     );

    //     bytes32 hash = keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct));
    //     address signer = ecrecover(hash, v, r, s);
    //     require(signer == borrower, "MyFunction: invalid signature");
    //     require(signer != address(0), "ECDSA: invalid signature");
    // }
}