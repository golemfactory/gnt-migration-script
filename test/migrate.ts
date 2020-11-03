import {expect, use} from 'chai';
import {Contract, utils, Wallet} from 'ethers';
import {deployMockContract, loadFixture, MockProvider, solidity} from 'ethereum-waffle';
import {abi} from '../src/GolemContracts';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {migrate} from '../src/migrate';

use(solidity);
use(sinonChai);

const balance = utils.parseEther('100')

const fixture = async (wallets: Wallet[], provider: MockProvider) => {
  const [deployer] = wallets;
  const oldToken = await deployMockContract(deployer, abi);
  await oldToken.mock.balanceOf.returns(balance);
  await oldToken.mock.migrate.returns();
  const newToken = await deployMockContract(deployer, abi);
  await newToken.mock.balanceOf.returns(balance);
  const batchToken = await deployMockContract(deployer, abi);
  await batchToken.mock.balanceOf.returns(0);
  const depositToken = await deployMockContract(deployer, abi);
  await depositToken.mock.balanceOf.returns(0);

  const config = {
    old: oldToken.address,
    new: newToken.address,
    batch: batchToken.address,
    deposit: depositToken.address
  };

  return {
    provider,
    wallets,
    config,
    oldToken,
    newToken,
    batchToken,
    depositToken
  };
};

describe('Migration script', () => {
  let logSpy: sinon.SinonSpy;
  let errorSpy: sinon.SinonSpy;
  let config: any;
  let owner: Wallet, migrator: Wallet;
  let oldToken: Contract;
  let newToken: Contract;
  let batchToken: Contract;
  let depositToken: Contract;
  let provider: MockProvider;

  beforeEach(async () => {
    logSpy = sinon.stub(console, 'log');
    errorSpy = sinon.stub(console, 'error');
    ({
      provider,
      oldToken,
      newToken,
      batchToken,
      depositToken,
      config,
      wallets: [owner, migrator]
    } = await loadFixture(fixture));
    provider.clearCallHistory()
  });

  it('prints wallet address on start', async () => {
    await migrate(migrator.privateKey, provider, config);
    expect(logSpy).to.be.calledWith(`Wallet address: ${migrator.address}`);
  });

  it('skips migration if no GNTs under address', async () => {
    await oldToken.mock.balanceOf.returns(0)
    await migrate(migrator.privateKey, provider, config);
    expect(errorSpy).to.be.calledWith(`This address doesn't have any GNT tokens. Aborting`);
    expect('migrate').to.be.not.calledOnContract(oldToken)
  });

  it('skips migration if has wrapped tokens', async () => {
    await batchToken.mock.balanceOf.returns(1)
    await migrate(migrator.privateKey, provider, config);
    expect(errorSpy).to.be.calledWith(`There are wrapped GNT tokens on this address. Please use the migration UI`);
    expect('migrate').to.be.not.calledOnContract(oldToken)
  });

  it('skips migration if has deposited tokens', async () => {
    await depositToken.mock.balanceOf.returns(1)
    await migrate(migrator.privateKey, provider, config);
    expect(errorSpy).to.be.calledWith(`There are deposited GNT tokens on this address. Please use the migration UI`);
    expect('migrate').to.be.not.calledOnContract(oldToken)
  });

  it('does migration and waits for confirmation', async () => {
    await migrate(migrator.privateKey, provider, config);
    expect(logSpy).to.be.calledWith(`100.0 GNT will be migrated to GNTv2`);
    expect('migrate').to.be.calledOnContractWith(oldToken, [balance])
    expect(logSpy).to.be.calledWith(`Transaction confirmed!`);
  });

  it('prints error if balance on new token is smaller than expected', async () => {
    newToken.mock.balanceOf.returns(utils.parseEther('99'))
    await migrate(migrator.privateKey, provider, config);
    expect('migrate').to.be.calledOnContractWith(oldToken, [balance])
    expect(errorSpy).to.be.calledWith('Something went wrong. Expected GNTv2 balance is 100.0, while actual is 99.0');
  });

  afterEach(() => {
    logSpy.restore();
    errorSpy.restore();
  });
});
