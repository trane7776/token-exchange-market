import { createSelector } from 'reselect';
import { get, groupBy, maxBy, reject, minBy } from 'lodash';
import { ethers } from 'ethers';
import moment from 'moment';

const GREEN = '#25CE8F';
const RED = '#FF4535';

const account = (state) => get(state, 'provider.account', '');

const tokens = (state) => get(state, 'tokens.contracts', []);
const events = (state) => get(state, 'exchange.events', []);

const allOrders = (state) => get(state, 'exchange.allOrders.data', []);
const cancelledOrders = (state) =>
  get(state, 'exchange.cancelledOrders.data', []);
const filledOrders = (state) => get(state, 'exchange.filledOrders.data', []);

// -------------------------------------------------------------------------------
// MY EVENTS
export const myEventsSelector = createSelector(
  account,
  events,
  (account, events) => {
    events = events.filter((e) => e.args.user === account);
    console.log(events);

    return events;
  }
);

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

// -------------------------------------------------------------------------------
// MY OPEN ORDERS

export const myOpenOrdersSelector = createSelector(
  account,
  tokens,
  openOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) return;
    // filter orders by current account
    orders = orders.filter((o) => o.user === account);

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

    // Decorate orders
    orders = decorateMyOpenOrders(orders, tokens);

    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    return orders;
  }
);

const decorateMyOpenOrders = (orders, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyOpenOrder(order, tokens);
    return order;
  });
};

const decorateMyOpenOrder = (order, tokens) => {
  let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';
  return {
    ...order,
    orderType,
    orderTypeClass: orderType === 'buy' ? GREEN : RED,
  };
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
// ALL FILLED ORDERS

export const filledOrdersSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) return;
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
    // 1: sort orders by timestamp ascending
    // 2: decorate orders
    // 3: sord orders by timestamp descending
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);

    // decorate orders
    orders = decorateFilledOrders(orders, tokens);

    // sort orders by timestamp descending
    return orders.sort((a, b) => b.timestamp - a.timestamp);
  }
);

const decorateFilledOrders = (orders, tokens) => {
  // track previous order to compare prices
  let previousOrder = orders[0];

  return orders.map((order) => {
    // decorate each order
    order = decorateOrder(order, tokens);
    order = decorateFilledOrder(order, previousOrder);
    previousOrder = order; // update previous order
    return order;
  });
};

const decorateFilledOrder = (order, previousOrder) => {
  return {
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder),
  };
};

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  if (previousOrder.id === orderId) {
    return GREEN;
  }
  if (previousOrder.tokenPrice <= tokenPrice) {
    // show green price if order price higher than previous order price
    return GREEN;
  } else {
    return RED;
  }
};

// -------------------------------------------------------------------------------
// MY FILLED ORDERS
export const myFilledOrdersSelector = createSelector(
  account,
  tokens,
  filledOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) return;
    // orders on account
    orders = orders.filter((o) => o.user === account || o.creator === account);
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

    // sort descending
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    // decorate orders
    orders = decorateMyFilledOrders(orders, account, tokens);

    return orders;
  }
);

const decorateMyFilledOrders = (orders, account, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyFilledOrder(order, account, tokens);
    return order;
  });
};

const decorateMyFilledOrder = (order, account, tokens) => {
  const myOrder = order.creator === account;
  let orderType;
  if (myOrder) {
    orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';
  } else {
    orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy';
  }
  return {
    ...order,
    orderType,
    orderClass: orderType === 'buy' ? GREEN : RED,
    orderSign: orderType === 'buy' ? '+' : '-',
  };
};
// -------------------------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(
  openOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) return;
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

// -------------------------------------------------------------------------------
// PRICE CHART

export const priceChartSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) return;

    // Filter orders by tokens
    orders = orders.filter(
      (order) =>
        order.tokenGive === tokens[0].address ||
        order.tokenGive === tokens[1].address
    );
    orders = orders.filter(
      (order) =>
        order.tokenGet === tokens[0].address ||
        order.tokenGet === tokens[1].address
    );

    // sort by timestamp
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);

    // Decorate orders
    orders = orders.map((order) => decorateOrder(order, tokens));

    // get price for up and down arrows
    const lastOrder = orders[orders.length - 1];
    const previousOrder = orders[orders.length - 2] || lastOrder;

    const lastPrice = get(lastOrder, 'tokenPrice', 0);
    const previousPrice = get(previousOrder, 'tokenPrice', 0);
    return {
      lastPrice,
      lastPriceChange: lastPrice >= previousPrice ? 'up' : 'down',
      series: [
        {
          data: buildGraphData(orders),
        },
      ],
    };
  }
);

const buildGraphData = (orders) => {
  // Group orders by hour
  orders = groupBy(orders, (o) =>
    moment.unix(o.timestamp).startOf('hour').format()
  );

  // Get each hour where orders were placed
  const hours = Object.keys(orders);
  // Build the graph data
  const graphData = hours.map((hour) => {
    // Fetch all orders for the hour
    const group = orders[hour];
    // Calculate open, high, low, close prices

    const open = group[0]; // first order
    const high = maxBy(group, 'tokenPrice'); // highest price
    const low = minBy(group, 'tokenPrice'); // lowest price
    const close = group[group.length - 1]; // last order

    return {
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice],
    };
  });
  return graphData;
};
