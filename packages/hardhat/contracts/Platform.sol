pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
// import "@openzeppelin/contracts/access/Ownable.sol"; 
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "./Lender.sol";
import "./Borrower.sol";

contract Platform {
    struct Stakes {
        Lender lender;
        Borrower borrower;
        uint signTime;
        uint payoffTime;
        uint duration;
        uint amount;
        uint interest;
    }

    Stakes[] stakingContracts;

    mapping(uint => address) contractToBorrower;
    mapping(uint => address) contractToLender;

    function _staking(Lender _lender, Borrower _borrower) private returns (bool) {

    }

    function createStaking(Borrower borrower) public returns (bool) {

    }

    function cancelStaking(Borrower borrower) public returns (bool) {

    }

    function payoff() public returns (bool) {

    }

}
