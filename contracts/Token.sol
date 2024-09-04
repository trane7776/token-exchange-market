//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf; // user => balance
    mapping(address => mapping(address => uint256)) public allowance; // owner => spender => amount
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;

    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        // require that the sender has enough tokens
        require(balanceOf[msg.sender] >= _value, "Not enough tokens");
        require(balanceOf[_to] + _value >= balanceOf[_to], "Overflow error");
        
        _transfer(msg.sender, _to, _value);

        return true;
    }
    function _transfer(address _from, address _to, uint256 _value) internal{ 
        require(_to != address(0), "Invalid recipient.");
        balanceOf[_from] = balanceOf[_from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        // emit transfer event
        emit Transfer(_from, _to, _value);
    }
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "Invalid spender.");
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
        //check approval
        require(balanceOf[_from] >= _value, "Not enough balance");
        require(allowance[_from][msg.sender] >= _value, "Not enough allowance");
    // доверенность    
        //update allowance
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;
        //spend tokens
        _transfer(_from, _to, _value);
        return true;
    }
    // mint tokens - only owner can mint - create new tokens for (to) address
    function mint(address to, uint256 value) public onlyOwner returns (bool success) {
        totalSupply += value;
        balanceOf[to] += value;
        emit Mint(to, value);
        emit Transfer(address(0), to, value);
        return true;
    }
}
