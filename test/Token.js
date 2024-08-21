const { expect } = require('chai');
const { ethers } = require('hardhat');
const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');
describe('Token', () => {
  let token;
  beforeEach(async () => {
    // Deploy the contract
    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy('Trane Coin', 'TRC', 1000000);
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
  });

  // describe spending

  // describe approving

  // describe transferring
});
