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
    let transaction = await token1
      .connect(deployer)
      .transfer(user1.address, tokens(100));
    await transaction.wait();
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

    describe('Success', () => {
      beforeEach(async () => {
        // Approve Tokens
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();
        // Deposit Tokens
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();
      });
      it('tracks the token deposit', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount);
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          amount
        );
        expect(
          await exchange.balanceOf(token1.address, user1.address)
        ).to.equal(amount);
      });
      it('emits a Deposit event', async () => {
        const eventLog = result.events[1]; // 0 is the Approval event
        expect(eventLog.event).to.equal('Deposit');
        const args = eventLog.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(amount);
      });
    });
    describe('Failure', () => {
      it('fails when no tokens are approved', async () => {
        await expect(
          exchange.connect(user1).depositToken(token1.address, amount)
        ).to.be.revertedWith('Not enough allowance');
      });
    });
  });

  describe('Withdrawing Tokens', () => {
    let transaction, result;
    let amount = tokens(10);
    describe('Success', () => {
      beforeEach(async () => {
        // Deposit Tokens
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();

        // Withdraw Tokens
        transaction = await exchange
          .connect(user1)
          .withdrawToken(token1.address, amount);
        result = await transaction.wait();
      });
      it('withdraws token funds', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0);
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          0
        );
        expect(
          await exchange.balanceOf(token1.address, user1.address)
        ).to.equal(0);
      });
      it('emits a Withdraw event', async () => {
        const eventLog = result.events[1];
        expect(eventLog.event).to.equal('Withdraw');
        const args = eventLog.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(0);
      });
    });
    describe('Failure', () => {
      it('fails when not enough balance', async () => {
        // withdraw without depositing
        await expect(
          exchange.connect(user1).withdrawToken(token1.address, amount)
        ).to.be.revertedWith('Not enough tokens');
      });
    });
  });

  describe('Checking balances', () => {
    let transaction, result;
    let amount = tokens(1);
    beforeEach(async () => {
      // Deposit Tokens
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();
      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();
    });
    it('returns user balance', async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(
        amount
      );
    });
  });
});
