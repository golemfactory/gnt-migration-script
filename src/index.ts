import {migrate} from './migrate';

const privateKey = process.env.PRIVATE_KEY
const rpc = process.env.RPC_URL

if (!privateKey) {
  console.error('Private key not found. Please set environment variable PRIVATE_KEY')
  process.exit(1)
}

if (!/^0x[0-9a-f]{64}$/i.exec(privateKey)) {
  console.error('Invalid private key format')
  process.exit(1)
}

if (!rpc) {
  console.error('Ethereum node URL not found. Please set environment variable RPC_URL')
  process.exit(1)
}

migrate(privateKey, rpc).catch(console.error)
