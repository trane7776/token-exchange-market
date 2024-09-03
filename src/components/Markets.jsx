import React from 'react';

import config from '../config.json';
import { useSelector, useDispatch } from 'react-redux';
import { loadTokens } from '../store/interactions';
const Markets = () => {
  const dispatch = useDispatch();
  const chainId = useSelector((state) => state.provider.chainId);
  const provider = useSelector((state) => state.provider.connection);
  const marketHandler = async (event) => {
    await loadTokens(provider, event.target.value.split(','), dispatch);
  };
  return (
    <div className="component exchange-markets">
      <div className="component-header">
        <h2>Select Market</h2>
      </div>
      {chainId && config[chainId] ? (
        <select name="markets" id="markets" onChange={marketHandler}>
          <option
            value={`${config[chainId].Trane.address},${config[chainId].mETH.address}`}
          >
            TRC / mETH
          </option>
          <option
            value={`${config[chainId].Trane.address},${config[chainId].mDAI.address}`}
          >
            TRC / mDAI
          </option>
        </select>
      ) : (
        <p>Not Deployed to network.</p>
      )}

      <hr />
    </div>
  );
};

export default Markets;
