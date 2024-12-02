class Employee {
    constructor(pool) {
      this.pool = pool;
    }
  
    async showPendingOrders() {
      const query = `SELECT * FROM ORDERS WHERE STATUS = 'Pending'`;
      const [rows] = await this.pool.query(query);
      return rows;
    }
  
    async handleOrder(orderId, status, updates) {
      const updateOrderQuery = `UPDATE ORDERS SET STATUS = ? WHERE ORDER_ID = ?`;
      const updateStockQuery = `UPDATE STORAGE SET QUANTITY = QUANTITY - ? WHERE PRODUCT_ID = ?`;
      await this.pool.query(updateOrderQuery, [status, orderId]);
      if (status === 'Completed' && updates) {
        for (const { productId, quantity } of updates) {
          await this.pool.query(updateStockQuery, [quantity, productId]);
        }
      }
      return { message: 'Order handled successfully' };
    }
  }
  