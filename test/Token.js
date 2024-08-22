const { expect } = require('chai');
const { ethers } = require('hardhat');
const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');
describe('Token', () => {
  let token;
  let deployer;
  beforeEach(async () => {
    // Deploy the contract
    [deployer] = await ethers.getSigners();
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

  // describe spending

  // describe approving

  // describe transferring
});
