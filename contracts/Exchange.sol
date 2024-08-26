// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import './Token.sol';

contract Exchange {
  address public feeAccount;
  uint256 public feePercent;
  mapping (address => mapping(address => uint256)) public tokens; // token => user => balance
  mapping (uint256 => _Order) public orders;
  uint256 public orderCount;
  mapping (uint256 => bool) public orderCancelled;

  
  event Deposit(address token, address user, uint256 amount, uint256 balance);
  event Withdraw(address token, address user, uint256 amount, uint256 balance);
  
  event OrderCreated(
    uint256 id,
    address user,
    address tokenGet,
    uint256 amountGet,
    address tokenGive,
    uint256 amountGive,
    uint256 timestamp
  );

  event OrderCancelled(
    uint256 id,
    address user,
    address tokenGet,
    uint256 amountGet,
    address tokenGive,
    uint256 amountGive,
    uint256 timestamp
  );

  struct _Order{
    uint256 id;
    address user;
    address tokenGet;
    uint256 amountGet;
    address tokenGive;
    uint256 amountGive;
    uint256 timestamp; // when the order was created
  }
  
  
  
  constructor(address _feeAccount, uint256 _feePercent) {
    feeAccount = _feeAccount;
    feePercent = _feePercent;

  }
  // -----------------------------------------
  // Deposit tokens
  // -----------------------------------------
  function depositToken(address _token, uint256 _amount) public {
    // Transfer tokens to exchange
    require(Token(_token).transferFrom(msg.sender, address(this), _amount));
    // Update balance
    tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
    // Emit an event
    emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
  }
  // -----------------------------------------
  // Withdraw tokens
  // -----------------------------------------
  function withdrawToken(address _token, uint256 _amount) public {
    // Ensure user has enough tokens to withdraw
    require(tokens[_token][msg.sender] >= _amount, "Not enough tokens");
    // Transfer tokens to user
    Token(_token).transfer(msg.sender, _amount);
    // Update user balance
    tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
    // Emit an event
    emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
  }

  // Check balances
  function balanceOf(address _token, address _user) public view returns (uint256){
    return tokens[_token][_user];
  }
  
  // -----------------------------------------
  // Make and Cancel orders
  // Token Give (token that user want to spend) - which token, how much
  // Token Get (token that user want to receive) - which token, how much
  function makeOrder(
    address _tokenGet,
    uint256 _amountGet,
    address _tokenGive,
    uint256 _amountGive
  ) public {
    require(balanceOf(_tokenGive, msg.sender) >= _amountGive, "Not enough tokens");
    // create order 
    orderCount++;
    orders[orderCount] = _Order(
      orderCount, // id 
      msg.sender, // user
      _tokenGet, // tokenGet
      _amountGet, // amountGet
      _tokenGive, // tokenGive
      _amountGive, // amountGive
      block.timestamp // timestamp
    );
    // emit an event
    emit OrderCreated(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);

  }
  // Cancel order
  function cancelOrder(uint256 _id) public {
    // fetch the order
    _Order storage _order = orders[_id];
    
    // Order must be created by the user
    require(msg.sender == address(_order.user), "Not the order creator");
    
    // Order must exist
    require(_order.id == _id, "Order does not exist");  
    
    
    // cancel the order
    orderCancelled[_id] = true;


    // emit an event
    emit OrderCancelled(
      _order.id,
      _order.user,
      _order.tokenGet,
      _order.amountGet,
      _order.tokenGive,
      _order.amountGive,
      block.timestamp
    );

  }
}