import { createSelector } from 'reselect';
import { get, groupBy, reject } from 'lodash';
import { ethers } from 'ethers';
import moment from 'moment';

const GREEN = '#25CE8F';
const RED = '#FF4535';

const tokens = (state) => get(state, 'tokens.contracts');
const allOrders = (state) => get(state, 'exchange.allOrders.data', []);
const cancelledOrders = (state) =>
  get(state, 'exchange.cancelledOrders.data', []);
const filledOrders = (state) => get(state, 'exchange.filledOrders.data', []);

const openOrders = (state) => {
  const all = allOrders(state);
  const cancelled = cancelledOrders(state);
  const filled = filledOrders(state);

  return reject(all, (order) => {
    const orderFilled = filled.some(
      (o) => o.id.toString() === order.id.toString()
    );
    const orderCancelled = cancelled.some(
      (o) => o.id.toString() === order.id.toString()
    );
    return orderFilled || orderCancelled;
  });
};

const decorateOrder = (order, tokens) => {
  let token0Amount, token1Amount;

  // ????????????? - token0, ????????????? - token1
  // incorrect code from the course
  // TRC - token0, mETH - token1
  if (order.tokenGive === tokens[0].address) {
    token0Amount = order.amountGive; // amount of TRC we are giving
    token1Amount = order.amountGet; // amount of mETH we want
  } else {
    token0Amount = order.amountGet; // amount of TRC we want
    token1Amount = order.amountGive; // amount of mETH we are giving
  }

  const precision = 100000;
  let tokenPrice = token1Amount / token0Amount;
  tokenPrice = Math.round(tokenPrice * precision) / precision;

  return {
    ...order,
    token0Amount: ethers.utils.formatUnits(token0Amount, 'ether'),
    token1Amount: ethers.utils.formatUnits(token1Amount, 'ether'),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D'),
  };
};

// -------------------------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(
  openOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) return;
    console.log(orders);
    // filter orders by tokens 2 times
    orders = orders.filter(
      (order) =>
        order.tokenGet === tokens[0].address ||
        order.tokenGive === tokens[0].address
    );
    orders = orders.filter(
      (order) =>
        order.tokenGet === tokens[1].address ||
        order.tokenGive === tokens[1].address
    );
    // decorate orders
    orders = decorateOrderBookOrders(orders, tokens);
    // group orders by orderType
    orders = groupBy(orders, 'orderType');

    // fetch buy orders
    const buyOrders = get(orders, 'buy', []);
    // Sort buy orders by tokenPrice
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    };

    // fetch sell orders
    const sellOrders = get(orders, 'sell', []);
    // Sort sell orders by tokenPrice
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    };

    console.log(orders);
    return orders;
  }
);

const decorateOrderBookOrders = (orders, tokens) => {
  // decorate orders
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateOrderBookOrder(order, tokens);
    return order;
  });
};

const decorateOrderBookOrder = (order, tokens) => {
  const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';
  return {
    ...order,
    orderType,
    orderTypeClass: orderType === 'buy' ? GREEN : RED,
    orderFillAction: orderType === 'buy' ? 'sell' : 'buy',
  };
};
