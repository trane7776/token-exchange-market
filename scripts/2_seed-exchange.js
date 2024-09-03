// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');
const { ethers } = hre;

const config = require('../src/config.json');

const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');

const wait = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

async function main() {
  // Fetch accounts from ethers
  const accounts = await ethers.getSigners(); // This is required to get the signers - signers are the accounts that will deploy the contracts

  const { chainId } = await ethers.provider.getNetwork();
  console.log(`Chain ID: ${chainId}`);

  // Fetch the deployed tokens and exchange
  const Trane = await ethers.getContractAt(
    'Token',
    config[chainId].Trane.address
  );

  console.log(`Trane Token fetched: ${Trane.address}`);

  const mETH = await ethers.getContractAt(
    'Token',
    config[chainId].mETH.address
  );
  console.log(`mETH Token fetched: ${mETH.address}`);

  const mDAI = await ethers.getContractAt(
    'Token',
    config[chainId].mDAI.address
  );
  console.log(`mDAI Token fetched: ${mDAI.address}`);

  const exchange = await ethers.getContractAt(
    'Exchange',
    config[chainId].exchange.address
  );

  console.log(`Exchange fetched: ${exchange.address}`);

  // Give tokens to account[1]
  const sender = accounts[0];
  const receiver = accounts[1];
  let amount = tokens(10000);
  // user1 transfers 10000 mETH to user2
  let transaction, result;
  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  result = await transaction.wait();
  console.log(
    `Transferred ${amount} mETH from ${sender.address} to ${receiver.address}`
  );

  // Set up exchange users

  const user1 = accounts[0];
  const user2 = accounts[1];
  amount = tokens(10000);

  // user1 approves the exchange to spend 10000 Trane tokens
  transaction = await Trane.connect(user1).approve(exchange.address, amount);
  result = await transaction.wait();
  console.log(`Approved ${amount} Trane tokens to exchange by user1`);

  // user1 deposits 10000 Trane tokens to the exchange
  transaction = await exchange
    .connect(user1)
    .depositToken(Trane.address, amount);
  result = await transaction.wait();
  console.log(`Deposited ${amount} Trane tokens to exchange by user1`);

  // user2 approves the exchange to spend 10000 mETH
  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  result = await transaction.wait();
  console.log(`Approved ${amount} mETH to exchange by user2`);

  // user2 deposits 10000 mETH to the exchange
  transaction = await exchange
    .connect(user2)
    .depositToken(mETH.address, amount);
  result = await transaction.wait();
  console.log(`Deposited ${amount} mETH to exchange by user2`);

  /////////////////////////////
  // Seed a Cancelled Order
  //

  // User 1 makes an order to get tokens
  let orderId;
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), Trane.address, tokens(5));
  result = await transaction.wait();

  // User 1 cancels the order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log(`Cancelled order: ${orderId} by ${user1.address}`);

  /////////////////////////////
  // Seed Filled Orders
  //

  // User 1 makes an order to get tokens
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), Trane.address, tokens(10));
  result = await transaction.wait();
  console.log(`Made order to get tokens by ${user1.address}`);

  // User 2 fills the order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order: ${orderId} by ${user2.address}`);

  // User 1 makes another order
  transaction = await exchange.makeOrder(
    mETH.address,
    tokens(50),
    Trane.address,
    tokens(2)
  );
  result = await transaction.wait();
  console.log(`Made another order to get tokens by ${user1.address}`);

  // User 2 fills another order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order: ${orderId} by ${user2.address}`);

  // User 1 makes final order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(200), Trane.address, tokens(20));
  result = await transaction.wait();
  console.log(`Made final order to get tokens by ${user1.address}`);

  // User 2 fills final order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order: ${orderId} by ${user2.address}`);

  /////////////////////////////
  // Seed Open Orders
  //

  // User 1 makes 10 orders

  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user1)
      .makeOrder(mETH.address, tokens(10 * i), Trane.address, tokens(10));
    result = await transaction.wait();
    console.log(`Made order ${i} to get tokens by ${user1.address}`);
  }

  // User 2 makes 10 orders

  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user2)
      .makeOrder(Trane.address, tokens(10), mETH.address, tokens(10 * i));
    result = await transaction.wait();
    console.log(`Made order ${i} to get tokens by ${user2.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
