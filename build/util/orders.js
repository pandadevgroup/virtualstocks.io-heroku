"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stocks_watcher_1 = require("./stocks-watcher");
class OrderData {
}
exports.OrderData = OrderData;
class Order extends OrderData {
    constructor(data) {
        super();
        if (data instanceof OrderData) {
            return Object.assign(this, data);
        }
        else {
            return Object.assign(this, Object.assign({ id: data.id }, data.data()));
        }
    }
    toString() {
        return `${this.id} => ${this.type} ${this.ticker} x${this.quantity}`;
    }
}
exports.Order = Order;
class Orders {
    constructor() {
        this.orders = {};
        this.callbacks = [];
        this.stocksWatcher = new stocks_watcher_1.StocksWatcher();
        this.stocksWatcher.onChange((change) => {
            this.handleStockUpdate(change);
        });
    }
    addOrder(order) {
        const { ticker, id } = order;
        if (!this.orders[ticker])
            this.initializeTicker(ticker);
        this.orders[ticker][id] = order;
    }
    updateOrder(order) {
        const { ticker, id } = order;
        this.orders[ticker][id] = order;
    }
    removeOrder(order) {
        const { ticker, id } = order;
        if (!this.orders[ticker])
            return;
        if (this.orders[ticker].hasOwnProperty(id))
            delete this.orders[ticker][id];
        if (Object.keys(this.orders[ticker]).length === 0)
            this.removeTicker(ticker);
    }
    listen(callback) {
        this.callbacks.push(callback);
    }
    initializeTicker(ticker) {
        this.orders[ticker] = {};
        this.stocksWatcher.watch(ticker);
    }
    removeTicker(ticker) {
        delete this.orders[ticker];
        this.stocksWatcher.stop(ticker);
    }
    handleStockUpdate(change) {
        const { ticker } = change;
        const orders = this.orders[ticker];
        for (let orderId of Object.keys(orders)) {
            this.checkOrder(orders[orderId], change);
        }
    }
    checkOrder(order, change) {
        const { type, price } = order;
        if (type === "buy") {
            this.notifyListeners(order, change);
        }
    }
    notifyListeners(order, change) {
        this.callbacks.map(callback => callback(order, change));
    }
}
exports.Orders = Orders;
//# sourceMappingURL=orders.js.map