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
  loadToken,
} from './store/interactions';
function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const account = await loadAccount(dispatch);
    console.log(account);

    // Connect ethers.js to the blockchain
    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);
    console.log(chainId);

    // Token Smart Contract
    await loadToken(provider, config[chainId].Trane.address, dispatch);
    await loadToken(provider, config[chainId].mETH.address, dispatch);
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
      {/* Navbar */}
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
