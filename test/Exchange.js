const { ethers } = require('hardhat');
const { expect } = require('chai');
const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');

describe('Exchange', () => {
  let deployer, feeAccount;
  let exchange;
  const feePercent = 10;
  beforeEach(async () => {
    [deployer, feeAccount] = await ethers.getSigners();
    const Exchange = await ethers.getContractFactory('Exchange');
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
});
