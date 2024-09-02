import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import TOKEN_ABI from './abis/Token.json';
import EXCHANGE_ABI from './abis/Exchange.json';
import config from './config.json';
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
} from './store/interactions';
import Navbar from './components/Navbar';
function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    // Connect ethers.js to the blockchain
    const provider = loadProvider(dispatch);
    // Fetch account and balance
    const account = await loadAccount(provider, dispatch);
    // Fetch chainId (hardhat: 31337, ropsten: 3, rinkeby: 4, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch);

    // Token Smart Contract
    const Trane = config[chainId].Trane;
    const mETH = config[chainId].mETH;
    const mDAI = config[chainId].mDAI;
    await loadTokens(provider, [Trane.address, mETH.address], dispatch);

    // Load Exchange Smart Contract
    const exchangeConfig = config[chainId].exchange;
    const exchange = await loadExchange(
      provider,
      exchangeConfig.address,
      dispatch
    );
  };

  useEffect(() => {
    if (window.ethereum) {
      loadBlockchainData();
    } else {
      console.log('Please install MetaMask!');
    }
  }, []);
  return (
    <div>
      <Navbar />
      <main className="exchange grid">
        <section className="exchange-section-left grid">
          {/* Markets */}

          {/* Balance  */}

          {/* Order */}
        </section>
        <section className="exchange-section-right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>
    </div>
  );
}

export default App;
