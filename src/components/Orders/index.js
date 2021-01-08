import React from 'react';
import OpenOrders from './OpenOrders';
import Trades from './Trades';
import './styles.scss';

const OPTIONS = [
  { value: 'openOrders', name: 'Open' },
  { value: 'filled', name: 'Filled' }
];

class Orders extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedAccountID: OPTIONS[0].value
    };
  }
  render() {
    return (
      <div className="row">
        <OpenOrders />
        <Trades />
      </div>
    );
  }
}

export default Orders;
