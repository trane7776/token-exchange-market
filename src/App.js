import { useEffect } from 'react';
import { ethers } from 'ethers';
import TOKEN_ABI from './abis/Token.json';
import EXCHANGE_ABI from './abis/Exchange.json';

import config from './config.json';
function App() {
  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    console.log(accounts[0]);

    // Connect ethers.js to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    console.log(chainId);

    // Token Smart Contract
    const token = new ethers.Contract(
      config[chainId].Trane.address,
      TOKEN_ABI,
      provider
    );
    console.log(token.address);
    console.log(await token.symbol());
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
