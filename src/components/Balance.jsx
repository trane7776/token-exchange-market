import { useEffect, useState, useRef } from 'react';

import dapp from '../assets/dapp.svg';
import eth from '../assets/eth.svg';
import { useSelector, useDispatch } from 'react-redux';
import { loadBalances, transferTokens } from '../store/interactions';
const Balance = () => {
  const [token1TransferAmount, setToken1TransferAmount] = useState(0);
  const [token2TransferAmount, setToken2TransferAmount] = useState(0);
  const [isDeposit, setIsDeposit] = useState(true);

  const dispatch = useDispatch();
  const exchange = useSelector((state) => state.exchange.exchange);
  const tokens = useSelector((state) => state.tokens.contracts);
  const account = useSelector((state) => state.provider.account);
  const symbols = useSelector((state) => state.tokens.symbols);
  const tokenBalances = useSelector((state) => state.tokens.balances);
  const exchangeBalances = useSelector((state) => state.exchange.balances);
  const transferInProgress = useSelector(
    (state) => state.exchange.transferInProgress
  );
  const provider = useSelector((state) => state.provider.connection);

  const depositRef = useRef(null);
  const withdrawRef = useRef(null);

  const amountHandler = (e, token) => {
    if (token.address === tokens[0].address) {
      setToken1TransferAmount(e.target.value);
    } else {
      setToken2TransferAmount(e.target.value);
    }
  };

  // Step 1: Do the transfer
  // Step 2: Notify app of the transfer
  // Step 3: Get confirmation from the blockchain
  // Step 4: Notify app of the confirmation
  // Step 5: Handle transfer fails - notify app

  const depositHandler = (e, token) => {
    e.preventDefault();
    if (token.address === tokens[0].address) {
      transferTokens(
        provider,
        exchange,
        'deposit',
        token,
        token1TransferAmount,
        dispatch
      );
      setToken1TransferAmount(0);
    } else {
      transferTokens(
        provider,
        exchange,
        'deposit',
        token,
        token2TransferAmount,
        dispatch
      );
      setToken2TransferAmount(0);
    }
  };

  const tabHandler = (e) => {
    if (e.target === depositRef.current) {
      depositRef.current.classList.add('tab-active');
      withdrawRef.current.classList.remove('tab-active');
      setIsDeposit(true);
    } else {
      depositRef.current.classList.remove('tab-active');
      withdrawRef.current.classList.add('tab-active');
      setIsDeposit(false);
    }
  };

  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch);
    }
  }, [exchange, tokens, account, dispatch, transferInProgress]);

  return (
    <div className="component exchange-transfers">
      <div className="component-header flex-between">
        <h2>Balance</h2>
        <div className="tabs">
          <button
            onClick={tabHandler}
            ref={depositRef}
            className="tab tab-active"
          >
            Deposit
          </button>
          <button onClick={tabHandler} ref={withdrawRef} className="tab">
            Withdraw
          </button>
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

        <form onSubmit={(e) => depositHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input
            type="text"
            id="token0"
            placeholder="0.0000"
            onChange={(e) => amountHandler(e, tokens[0])}
            value={token1TransferAmount === 0 ? '' : token1TransferAmount}
          />

          <button className="button" type="submit">
            {isDeposit ? <span>Deposit</span> : <span>Withdraw</span>}
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH/mDAI) */}

      <div className="exchange-transfers-form">
        <div className="flex-between">
          <p>
            <small>Token</small>
            <br />
            <img src={eth} alt="token 1" />
            {symbols && symbols[1]}
          </p>
          <p>
            <small>Wallet</small>
            <br />
            {tokenBalances && tokenBalances[1]}
          </p>
          <p>
            <small>Exchange</small>
            <br />
            {exchangeBalances && exchangeBalances[1]}
          </p>
        </div>

        <form onSubmit={(e) => depositHandler(e, tokens[1])}>
          <label htmlFor="token1"></label>
          <input
            type="text"
            id="token1"
            placeholder="0.0000"
            onChange={(e) => amountHandler(e, tokens[1])}
            value={token2TransferAmount === 0 ? '' : token2TransferAmount}
          />

          <button className="button" type="submit">
            {isDeposit ? <span>Deposit</span> : <span>Withdraw</span>}
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
};

export default Balance;
