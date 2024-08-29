// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  console.log('Preparing to deploy contracts...');

  const Token = await ethers.getContractFactory('Token');
  const Exchange = await ethers.getContractFactory('Exchange');
  const accounts = await ethers.getSigners(); // This is required to get the signers - signers are the accounts that will deploy the contracts
  console.log(
    `Accounts fetched: ${accounts[0].address} ${accounts[1].address}`
  );

  const trane = await Token.deploy('Trane Coin', 'TRC', 1000000);
  await trane.deployed();
  console.log('TRANE Token deployed to:', trane.address);

  const mETH = await Token.deploy('mETH', 'mETH', 1000000);
  await mETH.deployed();
  console.log('mETH Token deployed to:', mETH.address);

  const mDAI = await Token.deploy('mDAI', 'mDAI', 1000000);
  await mDAI.deployed();
  console.log('mDAI Token deployed to:', mDAI.address);

  const exchange = await Exchange.deploy(accounts[1].address, 10);
  await exchange.deployed();
  console.log('Exchange deployed to:', exchange.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
