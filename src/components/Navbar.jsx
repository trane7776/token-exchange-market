import { useSelector } from 'react-redux';
import Blockies from 'react-blockies';
import logo from '../assets/logo.png';
const Navbar = () => {
  const account = useSelector((state) => state.provider.account);
  const balance = useSelector((state) => state.provider.balance);
  return (
    <div className="exchange-header grid">
      <div className="exchange-header-brand flex">
        <img src={logo} alt="logo" className="logo" />
        <h1>Trane Token Exchange</h1>
      </div>
      <div className="exchange-header-networks flex">Networks</div>
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
          <a href="">
            {account.slice(0, 5) + '...' + account.slice(-4)}
            <Blockies seed={account.toLowerCase()} className="identicon" />
          </a>
        ) : (
          <a href="">Connect Wallet</a>
        )}
      </div>
    </div>
  );
};

export default Navbar;
