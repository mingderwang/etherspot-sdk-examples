import { Sdk, randomPrivateKey, NetworkNames, EnvNames } from 'etherspot';

/**
 * Example code to create smart wallet on Goerli testnet using etherspot sdk
 * the generated smart wallet is not deployed on chain until the first transaction.
 */

const privateKey = "0x398dd483a53fef9b5b37c142bdbabcef69a9b5e133885ffb62981f6484ee7aa1" // or randomPrivateKey()
// account address = '0xCCB186825101B56d8Fae58065191Fcf4eC2F2033'
// wallet address = '0xBF4f2D1Fdaf898DF5D9a53a9a5019856DB88Aa1B'

// const privateKey = "0xef60ad624bf7850ffc262995860bfc84485ccf7fbe252faf770960e427f3e5cc" // or randomPrivateKey()
// account address = '0xf3e06eeC1A90A7aEB10F768B924351A0F0158A1A'

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
  console.log('sdk.state.network', state.network);
  console.log('Account balances ', (await sdk.getAccountBalances()).items[0].balance.toString());

  //const receiver = '0x940d89BFAB20d0eFd076399b6954cCc42Acd8e15'; // Replace with address of your choice // for Goerli
  const receiver = '0x9E4C996EFD1Adf643467d1a1EA51333C72a25453'; // Replace with address of your choice // for Goerli
  const amtInWei = '500000000000000'; //Send 0.0005 ETH
  //this method will add the transaction to a batch, which has to be executed later.
  const transaction = await sdk.batchExecuteAccountTransaction({
    to: receiver,//wallet address
    value: amtInWei,//in wei
  });

  console.log('Estimating transaction');
  await sdk.estimateGatewayBatch().then(async (result) => {
    console.log('Estimation ', result.estimation);
    const hash = await sdk.submitGatewayBatch();
    console.log('Transaction submitted ', hash);
  })
  .catch((error) => {
    console.log('Transaction estimation failed with error ',error.message);
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit());
