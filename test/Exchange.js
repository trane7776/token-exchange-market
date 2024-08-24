const { ethers } = require('hardhat');
const { expect } = require('chai');
const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');

describe('Exchange', () => {
  let deployer, feeAccount, user1;
  let exchange, token1;
  const feePercent = 10;
  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory('Exchange');
    const Token = await ethers.getContractFactory('Token');
    token1 = await Token.deploy('Trane Coin', 'TRC', 1000000);
    [deployer, feeAccount, user1] = await ethers.getSigners();
    exchange = await Exchange.connect(deployer).deploy(
      feeAccount.address,
      feePercent
    );
  });
  describe('Deployment', () => {
    it('tracks the fee account', async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });
    it('tracks the fee percent', async () => {
      expect(await exchange.feePercent()).to.equal(feePercent);
    });
  });
  describe('Depositing Tokens', () => {
    let transaction, result;
    let amount = tokens(10);
    beforeEach(async () => {
      // Approve Tokens
      // Deposit Tokens
      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
    });
    describe('Success', () => {
      it('tracks the token deposit', async () => {
        result = await transaction.wait();
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          amount
        );
      });
    });
    describe('Failure', () => {});
  });
});
