import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";

export const getSmartAccount = async (walletProvider: any, dappAPIKey: any): Promise<any> => {
	// get EOA address from wallet provider
	const eoa = await walletProvider.getSigner().getAddress();
	console.log(`EOA address: ${eoa}`);

	// set options for SmartAccount object creation
	const options = {
		activeNetworkId: ChainId.POLYGON_MUMBAI,
		supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
		networkConfig: [
			{
				chainId: ChainId.POLYGON_MUMBAI,
				dappAPIKey: dappAPIKey,
			},
		],
	};

	// get SmartAccount data from wallet provider
	const wallet = new SmartAccount(walletProvider, options);
	const smartAccount = await wallet.init();
	const state = await smartAccount.getSmartAccountState();
	console.log(`SmartAccount address: ${state.address}`);
	console.dir(state, { depth: null });
	return smartAccount;
};
