import {constants} from 'ethers';

export const abi = [{
  constant: false,
  inputs: [
    {
      name: '_value',
      type: 'uint256'
    }
  ],
  name: 'migrate',
  outputs: [],
  payable: false,
  type: 'function'
}, {
  constant: true,
  inputs: [
    {
      name: '_owner',
      type: 'address'
    }
  ],
  name: 'balanceOf',
  outputs: [
    {
      name: '',
      type: 'uint256'
    }
  ],
  payable: false,
  type: 'function'
}];

export const oldTokenAddress = '0xa74476443119A942dE498590Fe1f2454d7D4aC0d'
export const batchingTokenAddress = '0xA7dfb33234098c66FdE44907e918DAD70a3f211c'
export const depositAddress = '0x98d3ca6528A2532Ffd9BDef50F92189568932570'

// TODO set address after new token is deployed
export const newTokenAddress = '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429'

