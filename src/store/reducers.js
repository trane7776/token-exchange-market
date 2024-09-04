export const provider = (state = {}, action) => {
  switch (action.type) {
    case 'PROVIDER_LOADED':
      return {
        ...state,
        connection: action.connection,
      };
    case 'NETWORK_LOADED':
      return {
        ...state,
        chainId: action.chainId,
      };
    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account,
      };
    case 'ETHER_BALANCE_LOADED':
      return {
        ...state,
        balance: action.balance,
      };
    default:
      return state;
  }
};

const defaultTokensState = {
  loaded: false,
  contracts: [],
  symbols: [],
};

export const tokens = (state = defaultTokensState, action) => {
  switch (action.type) {
    case 'TOKEN_LOADED_1':
      return {
        ...state,
        loaded: true,
        contracts: [action.token],
        symbols: [action.symbol],
      };
    case 'TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance],
      };
    case 'TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance],
      };
    case 'TOKEN_LOADED_2':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token],
        symbols: [...state.symbols, action.symbol],
      };
    default:
      return state;
  }
};

const DEFAULT_EXCHANGE_STATE = {
  loaded: false,
  contract: {},
  transaction: {
    isSuccessful: false,
  },
  events: [],
};

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        exchange: action.exchange,
      };
    case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance],
      };
    case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance],
      };

    // --------------------------------------------------------------------------------------------
    // Transfer Tokens (Deposit/Withdraw)
    case 'TRANSFER_IN_PROGRESS':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: true,
          isSuccessful: false,
        },
        transferInProgress: true,
      };
    case 'TRANSFER_COMPLETE':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: true,
        },
        transferInProgress: false,
        events: [action.event, ...state.events],
      };
    case 'TRANSFER_FAILED':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
        transferInProgress: false,
      };

    default:
      return state;
  }
};
