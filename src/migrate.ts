import {Contract, providers, Wallet, utils, BigNumber} from 'ethers';
import {abi, batchingTokenAddress, depositAddress, newTokenAddress, oldTokenAddress} from './GolemContracts';

export async function migrate(privateKey: string, rpc: string | providers.Provider, overrideAddresses?: {
  old?: string,
  new?: string,
  batch?: string,
  deposit?: string
}) {
  const provider = typeof rpc === 'string' ? new providers.JsonRpcProvider(rpc) : rpc;
  const wallet = new Wallet(privateKey, provider);
  console.log(`Wallet address: ${wallet.address}`);

  if (
    !await checkNoTokensWrapped(wallet, overrideAddresses?.batch ?? batchingTokenAddress) ||
    !await checkNoTokensDeposited(wallet, overrideAddresses?.deposit ?? depositAddress)) {
    return;
  }

  const token = new Contract(overrideAddresses?.old ?? oldTokenAddress, abi, wallet);
  const balance = await token.balanceOf(wallet.address);
  if (balance.eq(0)) {
    console.error(`This address doesn't have any GNT tokens. Aborting`);
    return;
  }
  console.log(`${utils.formatEther(balance)} GNT will be migrated to GNTv2`);
  const tx = await token.migrate(balance);
  console.log(`Transactions sent. See details here https://etherscan.io/tx/${tx.hash}`);
  console.log('Waiting for confirmation...');
  await tx.wait();
  console.log('Transaction confirmed!');
  await checkMigrationResult(wallet, token.address, overrideAddresses?.new ?? newTokenAddress, balance)
}

async function checkNoTokensWrapped(wallet: Wallet, contractAddress: string): Promise<boolean> {
  if (await isBalanceNotEmpty(wallet, contractAddress)) {
    console.error('There are wrapped GNT tokens on this address. Please use the migration UI');
    return false;
  }
  return true;
}

async function checkNoTokensDeposited(wallet: Wallet, contractAddress: string): Promise<boolean> {
  if (await isBalanceNotEmpty(wallet, contractAddress)) {
    console.error('There are deposited GNT tokens on this address. Please use the migration UI');
    return false;
  }
  return true;
}

async function isBalanceNotEmpty(wallet: Wallet, contractAddress: string) {
  const token = new Contract(contractAddress, abi, wallet);
  const balance = await token.balanceOf(wallet.address);
  return !balance.eq(0);
}

async function checkMigrationResult(wallet: Wallet, oldTokenAddress: string, newTokenAddress: string, expectedBalance: BigNumber) {
  if (await isBalanceNotEmpty(wallet, oldTokenAddress)) {
    console.error('Something went wrong, not all tokens were migrated');
  }
  const newToken = new Contract(newTokenAddress, abi, wallet);
  const balance = await newToken.balanceOf(wallet.address);
  if (balance.lt(expectedBalance)) {
    console.error(`Something went wrong. Expected GNTv2 balance is ${utils.formatEther(expectedBalance)}, while actual is ${utils.formatEther(balance)}`);
  }
}
