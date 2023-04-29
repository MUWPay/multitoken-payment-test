import { ethers, BigNumber } from "ethers";
import SmartAccount from "@biconomy/smart-account";
import { ClientConfig, SmartAccountAPI } from "@biconomy/account-abstraction";
import { EntryPoint__factory } from "@account-abstraction/contracts";
import {
  SmartWalletContractFactoryV100,
  EntryPointFactoryContractV100,
  SmartWalletFactoryV100,
  SmartWalletFactoryContractV100,
  EntryPointContractV100,
  SmartWalletContractV100,
} from "@biconomy/ethers-lib";
import { UserOperation } from "@biconomy/core-types";
import { TransactionDetailsForBatchUserOp } from "@biconomy/account-abstraction/dist/src/TransactionDetailsForUserOp";

export const sendBatchTx = async (
  smartAccount: SmartAccount,
  amount: BigNumber,
  provider: ethers.providers.Web3Provider,
  wallet: any
) => {
  try {
    // creating an array of txs
    const txs = [];

    // creating erc20 interface
    const erc20Interface = new ethers.utils.Interface([
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_spender",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_from",
            type: "address",
          },
          {
            name: "_to",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "transferFrom",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [
          {
            name: "",
            type: "uint8",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_to",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "transfer",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
          {
            name: "_spender",
            type: "address",
          },
        ],
        name: "allowance",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        payable: true,
        stateMutability: "payable",
        type: "fallback",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            name: "spender",
            type: "address",
          },
          {
            indexed: false,
            name: "value",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            name: "value",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
    ]);

    // for testing purposes, i am just calling two transfers for now
    // later on, we can try with approve + transfer functionality

    // first transfer
    const data1 = erc20Interface.encodeFunctionData("transfer", [
      "0xA8Ae542cEB682c230DCDc043Ebdd2DE1386cD2B9",
      amount,
    ]);
    const tx1 = {
      to: "0x4F0a60C531e1731985bC20F321E76A42a4663bEd",
      data: data1,
    };
    txs.push(tx1);

    // second transfer
    const data2 = erc20Interface.encodeFunctionData("transfer", [
      "0x79b0B7Aa68350291A2b01B364Aa37672316Bb223",
      amount,
    ]);
    const tx2 = {
      to: "0x4F0a60C531e1731985bC20F321E76A42a4663bEd",
      data: data2,
    };
    txs.push(tx2);

    // getting fee quotes, it gives an array
    const feeQuotes = await smartAccount.getFeeQuotesForBatch({
      transactions: txs,
    });

    console.log("Fee quotes are");

    for (let index = 0; index < feeQuotes.length; index++) {
      console.log(feeQuotes[index].tokenGasPrice);
    }

  
    // now here we are starting process to create smartAccount using account abstraction on biconomy.
    const chainId: any = await provider.getSigner().getChainId();

    const accountState: any = await smartAccount.getSmartAccountState();

    const clientConfig: ClientConfig = {
      dappAPIKey: "", // TODO: add API key
      chainId: accountState.chainId,
      entryPointAddress: accountState.entryPointAddress,
      biconomySigningServiceUrl:
        "https://paymaster-signing-service.staging.biconomy.io/api/v1/sign",
      socketServerUrl:
        "wss://sdk-testing-ws.staging.biconomy.io/connection/websocket",
      bundlerUrl: "https://sdk-relayer.staging.biconomy.io/api/v1/relay",
      txServiceUrl: "https://sdk-backend.staging.biconomy.io/v1",
    };
    //test
    console.log("state of aaAccount: ", accountState);
    console.log("client config: ", clientConfig);
    const entrypointInterface: any = EntryPoint__factory.connect(
      accountState["entryPointAddress"],
      provider
    );

    const providerAddress: any = await provider.getSigner().getAddress();
    const AccntAbstractionAPI = new SmartAccountAPI(
      provider,
      entrypointInterface,
      clientConfig,
      providerAddress,
      accountState["implementationAddress"],
      provider.getSigner(),
      accountState["fallbackHandlerAddress"],
      accountState["factoryAddress"]
    );

    console.log(
      "AA wallet:",
      (await AccntAbstractionAPI.getAccountAddress()).toString()
    );

    console.log("AA state", await AccntAbstractionAPI.getAccountInitCode());

    const verificationGasLimit: any =
      await AccntAbstractionAPI.getVerificationGasLimit();
    console.log("gas limit required", verificationGasLimit.toString());

    const batchTxnDetails: TransactionDetailsForBatchUserOp = {
      target: [txs[0].to, txs[1].to],
      data: [txs[0].data, txs[1].data],
      value: [amount],

      //TODO: use the ethers transactionTypes eip1559 to determine the values of the unsigned txns
      gasLimit: verificationGasLimit,
      // maxFeePerGas: ethers.utils.parseUnits('10', 'gwei'),
      // maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei')
    };

    // just we need to pass the following error : UNPREDICTABLE_GAS_LIMIT .
    const userOpData: any = await AccntAbstractionAPI.createUnsignedUserOp(
      batchTxnDetails
    );


    // console.log("finally the userOpData is", userOpData);
  } catch (err) {
    console.log(err);
  }
};
