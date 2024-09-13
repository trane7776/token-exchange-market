import { useRef, useEffect } from 'react';

import { useSelector } from 'react-redux';
import { myEventsSelector } from '../store/selectors';

import config from '../config.json';

const Alert = () => {
  const alertRef = useRef(null);
  const account = useSelector((state) => state.provider.account);
  const network = useSelector((state) => state.provider.chainId);
  const isPending = useSelector(
    (state) => state.exchange.transaction.isPending
  );
  const isError = useSelector((state) => state.exchange.transaction.isError);
  const isSuccessful = useSelector(
    (state) => state.exchange.transaction.isSuccessful
  );
  const events = useSelector(myEventsSelector);
  useEffect(() => {
    if ((events[0] || isPending || isError) && account) {
      alertRef.current.className = 'alert';
    }
  }, [events, isPending, isError, account]);

  const removeHandler = (e) => {
    alertRef.current.className = 'alert-remove';
  };
  return (
    <div>
      {isPending ? (
        <div
          className="alert alert-remove"
          onClick={removeHandler}
          ref={alertRef}
        >
          <h1>Transaction Pending...</h1>
        </div>
      ) : isError ? (
        <div>
          <div
            className="alert alert-remove"
            onClick={removeHandler}
            ref={alertRef}
          >
            <h1>Transaction Fail</h1>
          </div>
        </div>
      ) : !isPending && events[0] ? (
        <div
          className="alert alert-remove"
          onClick={removeHandler}
          ref={alertRef}
        >
          <h1>Transaction Successful</h1>
          <a
            href={
              config[network]
                ? `${config[network].explorerURL}/tx/${events[0].transactionHash}`
                : '#'
            }
            target="_blank"
            rel="noreferrer"
          >
            {events[0].transactionHash.slice(0, 6) +
              '...' +
              events[0].transactionHash.slice(-4)}
          </a>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Alert;
