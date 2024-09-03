import { useEffect } from 'react';

import dapp from '../assets/dapp.svg';
import { useSelector, useDispatch } from 'react-redux';
import { loadBalances } from '../store/interactions';
const Balance = () => {
  const dispatch = useDispatch();
  const exchange = useSelector((state) => state.exchange.exchange);
  const tokens = useSelector((state) => state.tokens.contracts);
  const account = useSelector((state) => state.provider.account);
  const symbols = useSelector((state) => state.tokens.symbols);
  const tokenBalances = useSelector((state) => state.tokens.balances);
  const exchangeBalances = useSelector((state) => state.exchange.balances);
  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch);
    }
  }, [exchange, tokens, account, dispatch]);

  return (
    <div className="component exchange-transfers">
      <div className="component-header flex-between">
        <h2>Balance</h2>
        <div className="tabs">
          <button className="tab tab-active">Deposit</button>
          <button className="tab">Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (TRANE) */}

      <div className="exchange-transfers-form">
        <div className="flex-between">
          <p>
            <small>Token</small>
            <br />
            <img src={dapp} alt="token 1" />
            {symbols && symbols[0]}
          </p>
          <p>
            <small>Wallet</small>
            <br />
            {tokenBalances && tokenBalances[0]}
          </p>
          <p>
            <small>Exchange</small>
            <br />
            {exchangeBalances && exchangeBalances[0]}
          </p>
        </div>

        <form>
          <label htmlFor="token0"></label>
          <input type="text" id="token0" placeholder="0.0000" />

          <button className="button" type="submit">
            <span></span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH/mDAI) */}

      <div className="exchange-transfers-form">
        <div className="flex-between"></div>

        <form>
          <label htmlFor="token1"></label>
          <input type="text" id="token1" placeholder="0.0000" />

          <button className="button" type="submit">
            <span></span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
};

export default Balance;
