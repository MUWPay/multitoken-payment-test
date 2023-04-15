import {ChainId, CoinKey, ConfigUpdate, ExecutionSettings, Execution, findDefaultToken, Route, RoutesRequest, RoutesResponse, ERC20_ABI, ExchangeRateUpdateParams } from "@lifi/sdk";
import LiFi from "@lifi/sdk";
import {Wallet, JsonRpcProvider, SigningKey, ethers ,Interface } from "ethers";

import * as dotenv from 'dotenv'
// in order to capture the user session (and not getting the access of the private key of wallet)
import  {Core} from "@walletconnect/core";
import { Web3Wallet } from '@walletconnect/web3wallet';
// smart account from biconomy for provding the possiblity for testing the functionality of the Lifi 
import SmartAccount  from '@biconomy/smart-account';

import {TransactionBatchDto} from '@biconomy/core-types';

//const mnemonic = process.env.PRIVATE || ''

dotenv.config();


async function testSinglePayment() {

// TODO: change this for the destination address
const [destinationWallet] = await ethers.getAddress('0x');

console.log('setting up the wallet and getting multiple tokens (using uniswap)')

const rpc = await new JsonRpcProvider(process.env.ALCHEMY_POLYGON_ENDPOINT || '', ChainId.MUM);

const _key : string | SigningKey = process.env.PRIVATE_KEY || '';

// NOTE: this is done for testing purposes. actually we will be using @walletconnect SDK's,   
// for getting the user wallet provider and then supply to the biconomy smart account functionality 
//along with that i am going to build another version not requirng 
const wallet: any = await new Wallet( _key, rpc);

// now first you've to insure that you've different tokens in sufficient quantity in order to to test the swap for the given transaction.
// in our case we've taken MATIC, WMATIC and then we will try to convert them to WETH and transfer to the destination address.
// all of the given transaction will be only approved one time by the user (via batch transaction approval).

// currently typecasting on any given that 
const walletProvider : any = wallet.provider;

const options: any = { 
    activeNetworkId: ChainId.MUM,
    supportedNetworksIds: [ ChainId.MUM, ChainId.POL]
}


// creating the smart accounts

let smartAccount = new SmartAccount(walletProvider, options);



// now creating the corresponding batch transaction request.
/**
 * here we consider the following path (from Polygon to arbitrum chain).
 *  MATIC-> WETH
 * DAI -> WETH
 * received on the same wallet on both address.
 */


const multiTokenRequest: RoutesRequest[] = [
{
    fromChainId: ChainId.POL,
    fromAmount: '1000000',  //10 MATIC
    fromTokenAddress: findDefaultToken(CoinKey.MATIC, ChainId.MUM).address,
    fromAddress: smartAccount.address,
    toChainId: ChainId.ARB,
    toTokenAddress: findDefaultToken(CoinKey.WETH, ChainId.ARB).address,
    toAddress: destinationWallet,
    options: {
        slippage: 0.03,
        allowSwitchChain:false,
    }

},

{
    fromChainId: ChainId.POL,
    fromAmount: '1000000', //10 DAI
    fromTokenAddress: findDefaultToken(CoinKey.DAI, ChainId.MUM).address,
    toChainId: ChainId.ARB,
    toTokenAddress: findDefaultToken(CoinKey.WETH, ChainId.ARB).address,
    toAddress:destinationWallet,
    options: {
        slippage: 0.03,
        allowSwitchChain:false,
    }

}
];
 let mumbai : any = ChainId.MUM


// now defining the  API endpoint 
// staging api : https://staging.li.quest/v1/ 
// production: https://li.quest

// apart from rpc and APIUrl, other configurations are optional.
const optionalConfigs: ConfigUpdate = {
    apiUrl: 'https://staging.li.quest/v1/', // DEFAULT production endpoint
    rpcs: {
    [mumbai]: [process.env.ALCHEMY_POLYGON_ENDPOINT || ''],
    },
  }
  const lifi = new LiFi(optionalConfigs)
  // now request the potential route for the batch of transactions defined.

  const route: Route[] = []
  for(let i = 0; i < multiTokenRequest.length; i++) {
    route.push((await lifi.getRoutes(multiTokenRequest[i])).routes[0]);
    console.log(route[i]);
  }

  //TODO: need to define more conditions in the execution settings .

  const settings: ExecutionSettings = {
    updateCallback: (updatedRoute) => {
 },

    acceptExchangeRateUpdateHook: async(param: ExchangeRateUpdateParams) => {
        return true;
    },
    infiniteApproval:false,
    executeInBackground: true, 
  }


const txns: any = []

// now integrating the smart account functionality for the batch transaction approval.
// using the tutorial defined here: https://docs.biconomy.io/guides/react.js/gasless-transactions/gasless-batched-transaction
const erc20Interface = new Interface(ERC20_ABI);
​
// first encoding the function call for the approval for the token address


// Encode an ERC-20 token approval to spenderAddress of the specified amount
const approvalEncodedData = erc20Interface.encodeFunctionData(
  'approve', [smartAccount.address,multiTokenRequest[0].fromAmount]
)



for(let i = 1; i < multiTokenRequest.length; i++) { 


    const approvalEncodedData = erc20Interface.encodeFunctionData(
        'approve', [smartAccount.address,multiTokenRequest[i].fromAmount]
      )
      txns.push({
          to: multiTokenRequest[i].fromTokenAddress,
          data: approvalEncodedData
      })

}

// Optional: Transaction subscription. One can subscribe to various transaction states
// Event listener that gets triggered once a hash is generetaed
smartAccount.on('txHashGenerated', (response: any) => {
    console.log('txHashGenerated event received via emitter', response);
  });
// Event listener that gets triggered on any error
smartAccount.on('error', (response: any) => {
    console.log('error event received via emitter', response);
  });
    

// Sending  transaction in batch
const txResponse = await smartAccount.sendTransactionBatch({ transactions: txns });
console.log(' batch Approval transaction hash', txResponse.hash);





// now executing the function for each route, we will be doing the batch transaction.
// NOTE: till here we dont need specifically need to use the smartAcount Biconomy functionality.

const executionStatus : Route[] = []
for(let i = 0; i < multiTokenRequest.length; i++) {
    executionStatus.push( await lifi.executeRoute(wallet,route[i], settings));
    console.log(executionStatus[i]);
  }
}

