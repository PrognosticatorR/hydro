import React from 'react';
import { connect } from 'react-redux';
import './styles.scss';


class OrderBook extends React.Component {
  constructor(props) {
    super(props);
    this.lastUpdatedAt = null;
    this.forceRenderTimer = null;
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
      <div className="orderbook flex-column flex-1">
        <div className="flex header text-secondary">
          <div className="col-6 ">Amount</div>
          <div className="col-6 text-right">Price</div>
        </div>
        <div className="flex-column flex-1">
          <div className="asks flex-column flex-column-reverse flex-1 overflow-hidden">
            {asks
              .slice(-16)
              .reverse()
              .toArray()
              .map(([price, amount],i) => {
                return (
                  <div className={`ask flex align-items-center ${i%2===0 ? "bg-blueishWhite": ""}`} key={price.toString()}>
                    <div className="col-6 orderbook-amount ">
                      {amount.toFixed(currentMarket.amountDecimals)}
                    </div>
                    <div className="col-6 text-danger text-right">{price.toFixed(currentMarket.priceDecimals)}</div>
                  </div>
                );
              })}
          </div>
          <div className="status border-top border-bottom bg-blueishWhite">
            {websocketConnected ? (
              <div className="col-12 text-success">
                <i className="fa fa-circle" aria-hidden="true" /> 
               <span className={`pl-2 text-blue`}>
                 Last Traded Price: {currentMarket.lastPrice}
               </span> 
              </div>
            ) : (
              <div className="col-6 text-danger">
                <i className="fa fa-circle" aria-hidden="true" /> Disconnected
              </div>
            )}
          </div>
          <div className="bids flex-column flex-1 overflow-hidden">
            {bids
              .slice(0, 16)
              .toArray()
              .map(([price, amount],i) => {
                return (
                  <div className={`bid flex align-items-center ${i%2!==0 ? "bg-blueishWhite": ""}`} key={price.toString()}>
                    <div className={`col-6 orderbook-amount`}>
                      {amount.toFixed(currentMarket.amountDecimals)}
                    </div>
                    <div className="col-6 text-success text-right">{price.toFixed(currentMarket.priceDecimals)}</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
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
