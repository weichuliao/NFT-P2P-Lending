pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StakingToken is Ownable {
   using SafeMath for uint256;
    

    //event NewLoan(uint ID, address nftToken);
    event NewLoan(uint ID, address nftTokenAddress, uint256 nftTokenID);

    event LoanDealed(uint _loanID);
    
    enum LoanStatus {
        DUMMY_DO_NOT_USE,
        CREATED,
        REMOVED,
        ACTIVE,
        REPAID,
        DEFAULTED
    }

    struct LoanData {
        LoanStatus loanState;
        address borrower;
        address lender;
        uint256 deadline; 
        // address payableCurrency; 要把 ERC20 wrap 過後才會變成 ETH，應該沒有 ETH address 這種東西
        uint256 principal;
        uint256 repayment;
        address nftTokenAddress;
        uint256 nftTokenID;
    }

    mapping (uint => address) loanToBorrower;
    mapping (uint => address) loanToLender;
    mapping (address => uint) countOfBorrowerLoan;
    mapping (address => uint) countOfLenderLoan;

    LoanData[] loans;
    function getLoansOf(address _borrower)
        external
        view
        returns (uint[] memory)
    {
        uint[] memory result = new uint[](countOfBorrowerLoan[_borrower]);
        uint counter = 0;
        for (uint i = 0; i < loans.length; i++) {
            if (loans[i].borrower == _borrower && //這個好像缺.borrower
                (loans[i].loanState == LoanStatus.CREATED || loans[i].loanState == LoanStatus.ACTIVE)) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function getDetailedLoan(uint _loanID) external view returns (LoanData memory){
        require(loans[_loanID].loanState != LoanStatus.REMOVED, "The loan was removed.");
        return loans[_loanID]; //是不是放錯位置？
        }

    function creatLoan(address _borrower, uint _deadline, uint _principal, uint _repayment, address _nftTokenAddress, uint256 _nftTokenID) public returns(uint){
        //IERC721(_nftTokenAddress).approve(address(this), _nftTokenID);
        IERC721(_nftTokenAddress).transferFrom(_borrower, address(this), _nftTokenID);

        //下面的Loan哪裡來的
        loans.push(
            LoanData({
                loanState: LoanStatus.CREATED,
                borrower: _borrower,
                lender: address(0),
                deadline:  _deadline,
                // payableCurrency: _payableCurrency,
                principal:  _principal, 
                repayment:  _repayment, 
                nftTokenAddress:  _nftTokenAddress, 
                nftTokenID:  _nftTokenID
            })


        );
        uint loanID = loans.length;
        // uint _loanID = loans.push(Loan(LoanStatus.CREATED, _borrower, address(0), _deadline, _payableCurrency, _principal, _repayment, _nftTokenAddress, _nftTokenID));

        loanToBorrower[loanID] = msg.sender;
        countOfBorrowerLoan[msg.sender]++;

        emit NewLoan(loanID, _nftTokenAddress, _nftTokenID);
        return loanID;
    }

    function dealLoan(uint _loanID) public {
        require(loanToBorrower[_loanID] != msg.sender, "You cannot make a deal with your own loan.");
        (bool sent, ) = payable(loans[_loanID].borrower).call{ value: (loans[_loanID].principal) }("");
        require(sent, "Failed to make a deal of the loan.");
        loans[_loanID].lender = msg.sender;
        loanToLender[_loanID] = msg.sender;
        countOfLenderLoan[msg.sender]++;
        loans[_loanID].loanState = LoanStatus.ACTIVE;
        
        emit LoanDealed(_loanID);
    }

    event LoanRepaid(uint _loanID);

    function repayLoan(uint _loanID) public {
        require(loanToBorrower[_loanID] == msg.sender, "You cannot repay other's loan.");
        LoanData memory loan = loans[_loanID];
        (bool sent, ) = payable(loan.lender).call{ value: (loan.principal) }("");
        require(sent, "Failed to repay the loan.");
        IERC721(loan.nftTokenAddress).transferFrom(address(this), loan.borrower, loan.nftTokenID);
        loans[_loanID].loanState = LoanStatus.REPAID;

        emit LoanRepaid(_loanID);
    }

    function claimCollateral(uint _loanID) public{
        LoanData memory loan = loans[_loanID];
        IERC721(loan.nftTokenAddress).transferFrom(loan.borrower, loan.lender, loan.nftTokenID);
        //emit collateralClaimed(_loanID);
    }
}