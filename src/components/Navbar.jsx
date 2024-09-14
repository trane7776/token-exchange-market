import { useSelector, useDispatch } from 'react-redux';
import Blockies from 'react-blockies';
import logo from '../assets/logo.svg';
import eth from '../assets/eth.svg';
import { loadAccount } from '../store/interactions';
import config from '../config.json';
const Navbar = () => {
  const dispatch = useDispatch();
  const account = useSelector((state) => state.provider.account);
  const chainId = useSelector((state) => state.provider.chainId);
  const balance = useSelector((state) => state.provider.balance);
  const provider = useSelector((state) => state.provider.connection);

  const connectHandler = async () => {
    // Load account
    await loadAccount(provider, dispatch);
  };

  const networkHandler = async (event) => {
    const selectedChainId = '0x' + Number(event.target.value).toString(16);
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: selectedChainId }],
    });
  };

  return (
    <div className="exchange-header grid">
      <div className="exchange-header-brand flex">
        <img src={logo} alt="logo" className="logo" />
        <h1>Trane Token Exchange</h1>
      </div>
      <div className="exchange-header-networks flex">
        <img src={eth} alt="eth" className="Eth Logo" />
        {chainId && (
          <select
            name="networks"
            id="networks"
            onChange={networkHandler}
            value={config[chainId] ? chainId : '0'}
          >
            <option value="0" disabled>
              Select Network
            </option>
            <option value="31337">Localhost</option>
            <option value="11155111">Sepolia</option>
            <option value="80002">Poligon Amoy</option>
          </select>
        )}
      </div>
      <div className="exchange-header-account flex">
        {balance ? (
          <p>
            <small>My Balance</small> {Number(balance).toFixed(4)} ETH
          </p>
        ) : (
          <p>
            <small>My Balance</small> 0 ETH
          </p>
        )}

        {account ? (
          <a
            href={
              config[chainId]
                ? `${config[chainId].explorerURL}/address/${account}`
                : '#'
            }
            target="_blank"
            rel="noreferrer"
          >
            {account.slice(0, 5) + '...' + account.slice(-4)}
            <Blockies seed={account.toLowerCase()} className="identicon" />
          </a>
        ) : (
          <button className="button" onClick={() => connectHandler()}>
            Connect to Blockchain
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
