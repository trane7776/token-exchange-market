const { ethers } = require('hardhat');
const { expect } = require('chai');
const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');

describe('Exchange', () => {
  let deployer, feeAccount, user1, user2;
  let exchange, token1, token2;
  const feePercent = 10;
  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory('Exchange');
    const Token = await ethers.getContractFactory('Token');
    token1 = await Token.deploy('Trane Coin', 'TRC', 1000000);
    token2 = await Token.deploy('Mock Dai', 'mDAI', 1000000);
    [deployer, feeAccount, user1, user2] = await ethers.getSigners();
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
  describe('Making Orders', () => {
    let transaction, result;
    let amount = tokens(10);
    describe('Success', () => {
      beforeEach(async () => {
        // Deposit Tokens before making order
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();

        // Make Order
        transaction = await exchange
          .connect(user1)
          .makeOrder(token2.address, tokens(1), token1.address, tokens(1));
        result = await transaction.wait();
      });
      it('tracks the new order', async () => {
        expect(await exchange.orderCount()).to.equal(1);
        const order = await exchange.orders(1);
        expect(order.id).to.equal(1);
        expect(order.user).to.equal(user1.address);
        expect(order.tokenGive).to.equal(token1.address);
        expect(order.amountGive).to.equal(tokens(1));
        expect(order.tokenGet).to.equal(token2.address);
        expect(order.amountGet).to.equal(tokens(1));
      });
      it('emits Order event', async () => {
        const eventLog = result.events[0];
        expect(eventLog.event).to.equal('OrderCreated');
        const args = eventLog.args;
        expect(args.id).to.equal(1);
        expect(args.user).to.equal(user1.address);
        expect(args.tokenGive).to.equal(token1.address);
        expect(args.amountGive).to.equal(tokens(1));
        expect(args.tokenGet).to.equal(token2.address);
        expect(args.amountGet).to.equal(tokens(1));
        expect(args.timestamp).to.at.least(1);
      });
    });
    describe('Failure', () => {
      it('rejects with no balance', async () => {
        await expect(
          exchange
            .connect(user1)
            .makeOrder(token2.address, tokens(1), token1.address, tokens(1))
        ).to.be.reverted;
      });
    });
  });
  describe('Order actions', async () => {
    let transaction, result;
    let amount = tokens(1);
    beforeEach(async () => {
      // Deposit Tokens before making order
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();
      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();

      // Make Order
      transaction = await exchange
        .connect(user1)
        .makeOrder(token2.address, amount, token1.address, amount);
      result = await transaction.wait();

      // Give tokens to user2
      transaction = await token2
        .connect(deployer)
        .transfer(user2.address, tokens(2));
      result = await transaction.wait();

      // user2 approves exchange to spend tokens
      transaction = await token2
        .connect(user2)
        .approve(exchange.address, tokens(2));
      result = await transaction.wait();

      // user2 deposits tokens
      transaction = await exchange
        .connect(user2)
        .depositToken(token2.address, tokens(2));
      result = await transaction.wait();
    });
    describe('Cancelling orders', async () => {
      describe('Success', async () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user1).cancelOrder(1);
          result = await transaction.wait();
        });
        it('cancels the order', async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true);
        });
        it('emits Cancel event', async () => {
          const eventLog = result.events[0];
          expect(eventLog.event).to.equal('OrderCancelled');
          const args = eventLog.args;
          expect(args.id).to.equal(1);
          expect(args.user).to.equal(user1.address);
          expect(args.tokenGive).to.equal(token1.address);
          expect(args.amountGive).to.equal(tokens(1));
          expect(args.tokenGet).to.equal(token2.address);
          expect(args.amountGet).to.equal(tokens(1));
          expect(args.timestamp).to.at.least(1);
        });
      });
      describe('Failure', async () => {
        it('rejects invalid order', async () => {
          await expect(exchange.connect(user1).cancelOrder(12345)).to.be
            .reverted;
        });
        it('rejects other users order', async () => {
          await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
        });
      });
    });

    describe('Filling orders', async () => {
      describe('Success', () => {
        beforeEach(async () => {
          // user2 fills order
          transaction = await exchange.connect(user2).fillOrder('1');
          result = await transaction.wait();
        });

        it('executes the trade and charge fees', async () => {
          // Token Give
          expect(
            await exchange.balanceOf(token1.address, user1.address)
          ).to.equal(tokens(0));
          expect(
            await exchange.balanceOf(token1.address, user2.address)
          ).to.equal(tokens(1));
          expect(
            await exchange.balanceOf(token1.address, feeAccount.address)
          ).to.equal(tokens(0));
          // --- Token Get ---
          // Token Get
          expect(
            await exchange.balanceOf(token2.address, user1.address)
          ).to.equal(tokens(1));
          expect(
            await exchange.balanceOf(token2.address, user2.address)
          ).to.equal(tokens(0.9));
          expect(
            await exchange.balanceOf(token2.address, feeAccount.address)
          ).to.equal(tokens(0.1));
        });

        it('updates filled orders', async () => {
          const orderFilled = await exchange.orderFilled(1);
          expect(orderFilled).to.equal(true);
        });

        it('emits Trade event', async () => {
          const eventLog = result.events[0];
          expect(eventLog.event).to.equal('Trade');
          const args = eventLog.args;
          expect(args.id).to.equal(1);
          expect(args.user).to.equal(user2.address);
          expect(args.tokenGet).to.equal(token2.address);
          expect(args.amountGet).to.equal(tokens(1));
          expect(args.tokenGive).to.equal(token1.address);
          expect(args.amountGive).to.equal(tokens(1));
          expect(args.creator).to.equal(user1.address);
          expect(args.timestamp).to.at.least(1);
        });
      });
      describe('Failure', () => {
        it('rejects invalid order ids', async () => {
          const invalidOrderId = 12345;
          await expect(
            exchange.connect(user2).fillOrder(invalidOrderId)
          ).to.be.revertedWith('Invalid order id');
        });
        it('rejects already filled orders', async () => {
          transaction = await exchange.connect(user2).fillOrder('1');
          result = await transaction.wait();
          await expect(
            exchange.connect(user2).fillOrder('1')
          ).to.be.revertedWith('Order already filled');
        });
        it('rejects cancelled orders', async () => {
          transaction = await exchange.connect(user1).cancelOrder(1);
          result = await transaction.wait();
          await expect(
            exchange.connect(user2).fillOrder('1')
          ).to.be.revertedWith('Order already cancelled');
        });
      });
    });
  });
});
