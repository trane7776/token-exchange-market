const { expect } = require('chai');
const { ethers } = require('hardhat');
const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');
describe('Token', () => {
  let token;
  let deployer, person1;
  beforeEach(async () => {
    // Deploy the contract
    [deployer, person1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory('Token');
    token = await Token.connect(deployer).deploy('Trane Coin', 'TRC', 1000000);
    await token.deployed();
  });

  describe('Deployment', async () => {
    const name = 'Trane Coin';
    const symbol = 'TRC';
    const totalSupply = tokens(1000000);
    const decimals = 18;

    it('has a name', async () => {
      expect(await token.name()).to.equal(name);
    });

    it('has a symbol', async () => {
      expect(await token.symbol()).to.equal(symbol);
    });

    it('has 18 decimals', async () => {
      expect(await token.decimals()).to.equal(decimals);
    });
    it('has a total supply of 1000000', async () => {
      expect(await token.totalSupply()).to.equal(tokens(1000000));
    });
    it('should assign the total supply to the owner', async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    });
  });
  describe('Sending Tokens', () => {
    let amount, transaction, result;
    describe('Success', () => {
      beforeEach(async () => {
        amount = tokens(100);
        transaction = await token
          .connect(deployer)
          .transfer(person1.address, amount);
        result = await transaction.wait();
      });

      it('transfers token balances', async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(999900)
        );
        expect(await token.balanceOf(person1.address)).to.equal(amount);
      });
      it('emits Transfer event', async () => {
        const eventLog = result.events[0];
        expect(eventLog.event).to.equal('Transfer');
        const args = eventLog.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(person1.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe('Failure', () => {
      it('rejects insufficient balances', async () => {
        // Transfer more than the balance of deployer - 100 millions
        const invalidAmount = tokens(100000000);
        await expect(
          token.connect(deployer).transfer(person1.address, invalidAmount)
        ).to.be.revertedWith('Not enough tokens');
      });
      it('rejects invalid recipients', async () => {
        const amount = tokens(100);
        await expect(
          token.connect(deployer).transfer(ethers.constants.AddressZero, amount)
        ).to.be.revertedWith('Invalid recipient');
      });
    });
  });
});
