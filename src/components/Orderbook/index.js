import React from 'react';
import { connect } from 'react-redux';
import './styles.scss';

class OrderBook extends React.Component {
  constructor(props) {
    super(props);
    this.lastUpdatedAt = null;
    this.forceRenderTimer = null;
    this.state = {
      currentTab: 'all'
    };
  }

  // max 1 render in 1 second
  shouldComponentUpdate() {
    if (this.lastUpdatedAt) {
      const diff = new Date().valueOf() - this.lastUpdatedAt;
      const shouldRender = diff > 1000;

      if (!shouldRender && !this.forceRenderTimer) {
        this.forceRenderTimer = setTimeout(() => {
          this.forceUpdate();
          this.forceRenderTimer = null;
        }, 1000 - diff);
      }
      return shouldRender;
    } else {
      return true;
    }
  }

  componentWillUnmount() {
    if (this.forceRenderTimer) {
      clearInterval(this.forceRenderTimer);
    }
  }

  componentDidUpdate() {
    this.lastUpdatedAt = new Date();
  }

  render() {
    let { bids, asks, websocketConnected, currentMarket } = this.props;
    return (
      <div className="orderbook flex-column flex-1 border mr-2 ">
        <div className="border-bottom d-flex">
          <span
            onClick={() => this.setState({ currentTab: 'all' })}
            className={`px-2 py-3 selection-container ${this.state.currentTab === 'all' ? 'active' : ''}`}>
            ALL
          </span>
          <span
            onClick={() => this.setState({ currentTab: 'sell' })}
            className={`px-2 py-3 selection-container ${this.state.currentTab === 'sell' ? 'active' : ''}`}>
            SELL
          </span>
          <span
            onClick={() => this.setState({ currentTab: 'buy' })}
            className={`px-2 py-3 selection-container ${this.state.currentTab === 'buy' ? 'active' : ''}`}>
            BUY
          </span>
        </div>
        <div className="flex header font-weight-bold border-bottom">
          <div className="col-4 text-center ">Amount</div>
          <div className="col-4 text-center">Price</div>
          <div className="col-4 text-center">Total</div>
        </div>
        <div className="flex-column flex-1">
          <div
            className={`asks flex-column flex-column-reverse flex-1 overflow-hidden ${
              this.state.currentTab === 'buy' ? 'd-none' : ''
            }`}>
            {asks
              .slice(-16)
              .reverse()
              .toArray()
              .map(([price, amount], i) => {
                let total = price * amount;
                let decimals = currentMarket.amountDecimals;
                return (
                  <div
                    className={`ask flex align-items-center ${i % 2 === 0 ? 'bg-blueishWhite' : ''}`}
                    key={price.toString()}>
                    <div className="col-4 orderbook-amount ">
                      {amount.toFixed(decimals) ? amount.toFixed(decimals) : '-'}
                    </div>
                    <div className="col-4 text-danger text-center">
                      {price.toFixed(decimals) ? price.toFixed(decimals) : '-'}
                    </div>
                    <div className="col-4 text-danger text-right">
                      {total.toFixed(decimals) ? total.toFixed(decimals) : '-'}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="status border-top border-bottom bg-blueishWhite">
            {websocketConnected ? (
              <div className="col-12 text-success text-right">
                <i className="fa fa-circle" aria-hidden="true" />
                <span className={`px-2 text-blue`}>Last Traded Price: {currentMarket.lastPrice}</span>
              </div>
            ) : (
              <div className="col-6 text-danger text-right">
                <i className="fa fa-circle" aria-hidden="true" /> Disconnected
              </div>
            )}
          </div>
          <div
            className={`bids flex-column flex-1 overflow-hidden ${this.state.currentTab === 'sell' ? 'd-none' : ''}`}>
            {bids
              .slice(0, 16)
              .toArray()
              .map(([price, amount], i) => {
                let total = price * amount;
                let decimals = currentMarket.amountDecimals;
                return (
                  <div
                    className={`bid flex align-items-center ${i % 2 !== 0 ? 'bg-blueishWhite' : ''}`}
                    key={price.toString()}>
                    <div className={`col-4 orderbook-amount`}>
                      {amount.toFixed(decimals) ? amount.toFixed(decimals) : '-'}
                    </div>
                    <div className="col-4 text-success text-center">
                      {price.toFixed(decimals) ? price.toFixed(decimals) : '-'}
                    </div>
                    <div className="col-4 text-success text-right">
                      {total.toFixed(decimals) ? total.toFixed(decimals) : '-'}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    asks: state.market.getIn(['orderbook', 'asks']),
    bids: state.market.getIn(['orderbook', 'bids']),
    loading: false,
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    websocketConnected: state.config.get('websocketConnected'),
    theme: state.config.get('theme')
  };
};

export default connect(mapStateToProps)(OrderBook);
