import { ethers } from 'ethers';
import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';

export const loadProvider = (dispatch) => {
  const connection = new ethers.providers.Web3Provider(window.ethereum);
  dispatch({ type: 'PROVIDER_LOADED', connection });
  return connection;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch({ type: 'NETWORK_LOADED', chainId });
  return chainId;
};

export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  const account = ethers.utils.getAddress(accounts[0]);
  dispatch({ type: 'ACCOUNT_LOADED', account });

  let balance = await provider.getBalance(account);
  balance = ethers.utils.formatEther(balance);

  dispatch({ type: 'ETHER_BALANCE_LOADED', balance });
  return account;
};

export const loadTokens = async (provider, addresses, dispatch) => {
  let token, symbol;
  token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
  symbol = await token.symbol();
  dispatch({ type: 'TOKEN_LOADED_1', token, symbol });

  token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
  symbol = await token.symbol();
  dispatch({ type: 'TOKEN_LOADED_2', token, symbol });
  return token;
};

export const loadExchange = async (provider, address, dispatch) => {
  const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
  dispatch({ type: 'EXCHANGE_LOADED', exchange });
  return exchange;
};

export const subscribeToEvents = (exchange, dispatch) => {
  exchange.on('Deposit', (token, user, amount, balance, event) => {
    dispatch({ type: 'TRANSFER_COMPLETE', event });
  });

  exchange.on('Withdraw', (token, user, amount, balance, event) => {
    dispatch({ type: 'TRANSFER_COMPLETE', event });
  });
  exchange.on(
    'OrderCreated',
    (
      id,
      user,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      timestamp,
      event
    ) => {
      const order = event.args;
      dispatch({ type: 'NEW_ORDER_SUCCESS', order, event });
    }
  );

  exchange.on(
    'OrderCancelled',
    (
      id,
      user,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      timestamp,
      event
    ) => {
      const order = event.args;
      dispatch({ type: 'ORDER_CANCEL_SUCCESS', order, event });
    }
  );

  exchange.on(
    'Trade',
    (
      id,
      user,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      creator,
      timestamp,
      event
    ) => {
      const order = event.args;
      dispatch({ type: 'ORDER_FILL_SUCCESS', order, event });
    }
  );
};

// event OrderCreated(
//   uint256 id,
//   address user,
//   address tokenGet,
//   uint256 amountGet,
//   address tokenGive,
//   uint256 amountGive,
//   uint256 timestamp
// );
// --------------------------------------------------------------------------------------------
// LOAD USER BALANCES (WALLET and EXCHANGE BALANCES)

export const loadBalances = async (exchange, tokens, account, dispatch) => {
  // TOKEN 1

  let balance = ethers.utils.formatUnits(
    await tokens[0].balanceOf(account),
    18
  );
  dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance });
  balance = ethers.utils.formatUnits(
    await exchange.balanceOf(tokens[0].address, account),
    18
  );
  dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance });

  // TOKEN 2

  balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18);
  dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance });
  balance = ethers.utils.formatUnits(
    await exchange.balanceOf(tokens[1].address, account),
    18
  );
  dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance });
};

// --------------------------------------------------------------------------------------------
// LOAD ORDERS
export const loadAllOrders = async (provider, exchange, dispatch) => {
  const block = await provider.getBlockNumber();

  // Fetch cancelled orders
  const cancelStream = await exchange.queryFilter('OrderCancelled', 0, block);
  const cancelledOrders = cancelStream.map((event) => event.args);

  dispatch({ type: 'CANCELLED_ORDERS_LOADED', cancelledOrders });

  // Fetch filled orders
  const tradeStream = await exchange.queryFilter('Trade', 0, block);
  const filledOrders = tradeStream.map((event) => event.args);

  dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders });

  // FETCH ALL ORDERS
  const orderStream = await exchange.queryFilter('OrderCreated', 0, block);
  const allOrders = orderStream.map((event) => event.args);

  dispatch({ type: 'ALL_ORDERS_LOADED', allOrders });
};

// --------------------------------------------------------------------------------------------
// Transfer Tokens (Deposit/Withdraw)

export const transferTokens = async (
  provider,
  exchange,
  transferType,
  token,
  amount,
  dispatch
) => {
  let transaction;

  dispatch({ type: 'TRANSFER_IN_PROGRESS' });
  try {
    const signer = provider.getSigner();
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);
    if (transferType === 'deposit') {
      transaction = await token
        .connect(signer)
        .approve(exchange.address, amountToTransfer);
      await transaction.wait();
      transaction = await exchange
        .connect(signer)
        .depositToken(token.address, amountToTransfer);
      await transaction.wait();
    } else {
      transaction = await exchange
        .connect(signer)
        .withdrawToken(token.address, amountToTransfer);
      await transaction.wait();
    }
  } catch (error) {
    dispatch({ type: 'TRANSFER_FAILED' });
    console.log(error);
  }
};

// --------------------------------------------------------------------------------------------
// ORDERS (BUY/SELL)

export const makeBuyOrder = async (
  provider,
  exchange,
  tokens,
  order,
  dispatch
) => {
  const tokenGet = tokens[0].address; //покупаем трейны
  const amountGet = ethers.utils.parseUnits(order.amount, 18); //количество трейнов
  const tokenGive = tokens[1].address; // продаём mETH
  const amountGive = ethers.utils.parseUnits(
    (order.amount * order.price).toString(),
    18
  ); // количество mETH для продажи
  dispatch({ type: 'NEW_ORDER_REQUEST' });
  try {
    const signer = provider.getSigner();
    let transaction = await exchange
      .connect(signer)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
    await transaction.wait();
  } catch (error) {
    dispatch({ type: 'NEW_ORDER_FAILED' });
    console.log(error);
  }
};

export const makeSellOrder = async (
  provider,
  exchange,
  tokens,
  order,
  dispatch
) => {
  const tokenGet = tokens[1].address; //покупаем mETH
  const amountGet = ethers.utils.parseUnits(
    (order.amount * order.price).toString(),
    18
  ); // количество mETH для покупки
  const tokenGive = tokens[0].address; // продаём трейны
  const amountGive = ethers.utils.parseUnits(order.amount, 18); // количество трейнов
  dispatch({ type: 'NEW_ORDER_REQUEST' });
  try {
    const signer = provider.getSigner();
    let transaction = await exchange
      .connect(signer)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
    await transaction.wait();
  } catch (error) {
    dispatch({ type: 'NEW_ORDER_FAILED' });
    console.log(error);
  }
};

// ---------------------------------------------------
// CANCEL ORDER

export const cancelOrder = async (provider, exchange, order, dispatch) => {
  dispatch({ type: 'ORDER_CANCEL_REQUEST' });
  try {
    const signer = provider.getSigner();
    let transaction = await exchange.connect(signer).cancelOrder(order.id);
    await transaction.wait();
  } catch (error) {
    dispatch({ type: 'ORDER_CANCEL_FAILED' });
    console.log(error);
  }
};

// ---------------------------------------------------
// FILL ORDER
export const fillOrder = async (provider, exchange, order, dispatch) => {
  dispatch({ type: 'ORDER_FILL_REQUEST' });
  try {
    const signer = provider.getSigner();
    let transaction = await exchange.connect(signer).fillOrder(order.id);
    await transaction.wait();
  } catch (error) {
    dispatch({ type: 'ORDER_FILL_FAILED' });
    console.log(error);
  }
};
