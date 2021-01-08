import React from 'react';
import { connect } from 'react-redux';
import PerfectScrollbar from 'perfect-scrollbar';
import { loadOrders, cancelOrder } from '../../actions/account';
import { getSelectedAccount } from '@gongddex/hydro-sdk-wallet';

const mapStateToProps = (state) => {
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    orders: state.account.get('orders'),
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    currentMarket: state.market.getIn(['markets', 'currentMarket'])
  };
};

class OpenOrders extends React.PureComponent {
  componentDidMount() {
    const { isLoggedIn, dispatch } = this.props;
    if (isLoggedIn) {
      dispatch(loadOrders());
    }
  }

  componentDidUpdate(prevProps) {
    const { isLoggedIn, dispatch, orders, currentMarket } = this.props;
    if (isLoggedIn && (isLoggedIn !== prevProps.isLoggedIn || currentMarket !== prevProps.currentMarket)) {
      dispatch(loadOrders());
    }
    if (orders !== prevProps.orders) {
      this.ps && this.ps.update();
    }
  }

  render() {
    const { orders, dispatch, currentMarket } = this.props;
    return (
      <div
        className="orders flex-1 position-relative overflow-hidden col-md-6 col-sm-12 border"
        ref={(ref) => this.setRef(ref)}>
        <div className="text-blue py-2 pl-2 border-bottom">Open Orders</div>
        <div className="order-history-col">
          <table className="table">
            <thead>
              <tr className="border-bottom">
                <th className="pair-column font-weight-bold">Pair</th>
                <th className="font-weight-bold">Side</th>
                <th className="text-right font-weight-bold">Price</th>
                <th className="text-right font-weight-bold">Amount</th>
                <th className="text-right font-weight-bold"> Cancle</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .toArray()
                .reverse()
                .map(([id, order]) => {
                  if (order.availableAmount.eq(0)) {
                    return null;
                  }
                  const symbol = order.marketID.split('-')[0];
                  return (
                    <tr key={id}>
                      <td className="pair-column">{order.marketID}</td>
                      <td className={order.side === 'sell' ? 'text-danger' : 'text-success'}>{order.side}</td>
                      <td className="text-right">{order.price.toFixed(currentMarket.priceDecimals)}</td>
                      <td className="text-right">
                        {order.availableAmount.toFixed(currentMarket.amountDecimals)} {symbol}
                      </td>
                      <td className="text-right">
                        <button className="btn btn-outline-danger" onClick={() => dispatch(cancelOrder(order.id))}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  setRef(ref) {
    if (ref) {
      this.ps = new PerfectScrollbar(ref, {
        suppressScrollX: true,
        maxScrollbarLength: 20
      });
    }
  }
}

export default connect(mapStateToProps)(OpenOrders);
