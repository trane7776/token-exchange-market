import { useState, useRef } from 'react';
import { makeBuyOrder, makeSellOrder } from '../store/interactions';
import { useDispatch, useSelector } from 'react-redux';
const Order = () => {
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [isBuy, setIsBuy] = useState(true);
  const [isSell, setIsSell] = useState(false);

  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const exchange = useSelector((state) => state.exchange.exchange);
  const tokens = useSelector((state) => state.tokens.contracts);

  const buyRef = useRef(null);
  const sellRef = useRef(null);

  const buyHandler = (e) => {
    e.preventDefault();
    makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch);
    console.log('Buy', amount, price);
    setAmount(0);
    setPrice(0);
  };

  const sellHandler = (e) => {
    e.preventDefault();
    makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch);
    console.log('Sell', amount, price);
    setAmount(0);
    setPrice(0);
  };

  const tabHandler = (e) => {
    if (e.target === buyRef.current) {
      buyRef.current.classList.add('tab-active');
      sellRef.current.classList.remove('tab-active');
      setIsBuy(true);
      setIsSell(false);
    } else {
      buyRef.current.classList.remove('tab-active');
      sellRef.current.classList.add('tab-active');
      setIsBuy(false);
      setIsSell(true);
    }
  };

  return (
    <div className="component exchange-orders">
      <div className="component-header flex-between">
        <h2>New Order</h2>
        <div className="tabs">
          <button className="tab tab-active" ref={buyRef} onClick={tabHandler}>
            Buy
          </button>
          <button className="tab" ref={sellRef} onClick={tabHandler}>
            Sell
          </button>
        </div>
      </div>

      <form onSubmit={isBuy ? buyHandler : sellHandler}>
        {isBuy ? (
          <label htmlFor="amount">
            <small>Buy</small> Amount
          </label>
        ) : (
          <label htmlFor="amount">
            <small>Sell</small> Amount
          </label>
        )}

        <input
          type="text"
          id="amount"
          placeholder="0.0000"
          onChange={(e) => setAmount(e.target.value)}
          value={amount === 0 ? '' : amount}
        />
        {isBuy ? (
          <label htmlFor="price">
            <small>Buy</small> Price
          </label>
        ) : (
          <label htmlFor="price">
            <small>Sell</small> Price
          </label>
        )}
        <input
          type="text"
          id="price"
          placeholder="0.0000"
          onChange={(e) => setPrice(e.target.value)}
          value={price === 0 ? '' : price}
        />

        <button className="button button-filled" type="submit">
          {isBuy ? <span>Buy</span> : <span>Sell</span>}
        </button>
      </form>
    </div>
  );
};

export default Order;
