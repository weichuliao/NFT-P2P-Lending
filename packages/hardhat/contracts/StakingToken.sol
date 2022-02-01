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
}