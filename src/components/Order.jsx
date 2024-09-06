import { useState, useRef } from 'react';

const Order = () => {
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [isBuy, setIsBuy] = useState(true);
  const [isSell, setIsSell] = useState(false);
  const buyRef = useRef(null);
  const sellRef = useRef(null);

  const buyHandler = (e) => {
    e.preventDefault();
    console.log('Buy', amount, price);
  };

  const sellHandler = (e) => {
    e.preventDefault();
    console.log('Sell', amount, price);
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
        <input
          type="text"
          id="amount"
          placeholder="0.0000"
          onChange={(e) => setAmount(e.target.value)}
          value={amount === 0 ? '' : amount}
        />

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
