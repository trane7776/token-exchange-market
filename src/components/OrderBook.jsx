import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import sort from '../assets/sort.svg';

import { orderBookSelector } from '../store/selectors';
import { fillOrder, loadBalances } from '../store/interactions';
const OrderBook = () => {
  const symbols = useSelector((state) => state.tokens.symbols);
  const orderBook = useSelector(orderBookSelector);
  const provider = useSelector((state) => state.provider.connection);
  const exchange = useSelector((state) => state.exchange.exchange);
  const tokens = useSelector((state) => state.tokens.contracts);
  const account = useSelector((state) => state.provider.account);
  const dispatch = useDispatch();

  const fillOrderHandler = (order) => {
    fillOrder(provider, exchange, order, dispatch);
    loadBalances(exchange, tokens, account, dispatch);
  };
  return (
    <div className="component exchange-orderbook">
      <div className="component-header flex-between">
        <h2>Order Book</h2>
      </div>

      <div className="flex">
        {!orderBook || orderBook.sellOrders.length === 0 ? (
          <p className="flex-center">No Sell Orders</p>
        ) : (
          <table className="exchange-orderbook-sell">
            <caption>Selling</caption>
            <thead>
              <tr>
                <th>
                  {symbols && symbols[0]}
                  <img src={sort} alt="sort" />
                </th>
                <th>
                  {symbols && symbols[0]}/{symbols && symbols[1]}
                  <img src={sort} alt="sort" />
                </th>
                <th>
                  {symbols && symbols[1]}
                  <img src={sort} alt="sort" />
                </th>
              </tr>
            </thead>
            <tbody>
              {orderBook &&
                orderBook.sellOrders.map((order, index) => (
                  <tr key={index} onClick={() => fillOrderHandler(order)}>
                    <td>{order.token0Amount}</td>
                    <td style={{ color: `${order.orderTypeClass}` }}>
                      {order.tokenPrice}
                    </td>
                    <td>{order.token1Amount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        <div className="divider"></div>
        {!orderBook || orderBook.buyOrders.length === 0 ? (
          <p className="flex-center">No Buy Orders</p>
        ) : (
          <table className="exchange-orderbook-buy">
            <caption>Buying</caption>
            <thead>
              <tr>
                <th>
                  {symbols && symbols[0]}
                  <img src={sort} alt="sort" />
                </th>
                <th>
                  {symbols && symbols[0]}/{symbols && symbols[1]}
                  <img src={sort} alt="sort" />
                </th>
                <th>
                  {symbols && symbols[1]}
                  <img src={sort} alt="sort" />
                </th>
              </tr>
            </thead>
            <tbody>
              {orderBook &&
                orderBook.buyOrders.map((order, index) => (
                  <tr key={index} onClick={() => fillOrderHandler(order)}>
                    <td>{order.token0Amount}</td>
                    <td style={{ color: `${order.orderTypeClass}` }}>
                      {order.tokenPrice}
                    </td>
                    <td>{order.token1Amount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrderBook;
