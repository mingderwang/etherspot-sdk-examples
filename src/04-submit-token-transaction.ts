import { Sdk, randomPrivateKey, NetworkNames, EnvNames } from 'etherspot';
import {default as erc20Abi} from 'human-standard-token-abi';
const abiCoder = require('web3-eth-abi');

/**
 * Example code to create smart wallet on Goerli testnet using etherspot sdk
 * the generated smart wallet is not deployed on chain until the first transaction.
 */
const privateKey = "0x398dd483a53fef9b5b37c142bdbabcef69a9b5e133885ffb62981f6484ee7aa1" // or randomPrivateKey()

async function main(): Promise<void> {
  const sdk = new Sdk(privateKey, {
    env: EnvNames.TestNets, // Use EnvNames.Mainnet, If you are accessing Mainnets
    networkName: NetworkNames.Goerli,
    //projectKey: 'test-project', //optional can be used to uniquely identify your project
  });
  
  const { state } = sdk;

  console.log('create session', await sdk.createSession());
  await sdk.computeContractAccount({sync: true});
  console.log('Smart wallet', state.account);
  console.log('Account balances ', await sdk.getAccountBalances());

  const receiver = '0x9E4C996EFD1Adf643467d1a1EA51333C72a25453'; // Replace with address of your choice
  const tokenAddress = '0x9de9cde889a40b7402d824386064d17792298e1b'; //PLR contract on Goerli
  const tokens = '1000000000000000000000'; // 1000 PLR
  const methodName = erc20Abi.find(({ name }) => name === 'transfer');
  console.log('Method Name ',methodName);
  //encode the transfer method using ethers.js
  const encodedData = abiCoder.encodeFunctionCall(
      methodName,
      [
          receiver,
          tokens
      ]);

  console.log('Encoded function call ',encodedData);
  //this method will add the transaction to a batch, which has to be executed later.
  const transaction = await sdk.batchExecuteAccountTransaction({
    to: receiver,//wallet address
    data: encodedData,
  });

  console.log('Estimating transaction');
  await sdk.estimateGatewayBatch().then(async (result) => {
    console.log('Estimation ', result.estimation);
    const hash = await sdk.submitGatewayBatch();
    console.log('Transaction submitted ', hash);
  })
  .catch((error) => {
    console.log('Transaction estimation failed with error ',error);
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit());
