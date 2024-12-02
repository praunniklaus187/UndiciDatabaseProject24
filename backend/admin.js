class Admin {
    constructor(pool) {
      this.pool = pool;
    }
  
    async addEmployee(employeeId, name, role, branchId) {
      const query = `INSERT INTO EMPLOYEES (EMPLOYEE_ID, NAME, ROLE, BRANCH_ID) VALUES (?, ?, ?, ?)`;
      const [result] = await this.pool.query(query, [employeeId, name, role, branchId]);
      return result;
    }
  
    async addBranch(branchId, name, location) {
      const query = `INSERT INTO BRANCHES (BRANCH_ID, NAME, LOCATION) VALUES (?, ?, ?)`;
      const [result] = await this.pool.query(query, [branchId, name, location]);
      return result;
    }
  
    async addMenuItem(productId, name, price, category) {
      const query = `INSERT INTO PRODUCTS (PRODUCT_ID, NAME, PRICE, CATEGORY) VALUES (?, ?, ?, ?)`;
      const [result] = await this.pool.query(query, [productId, name, price, category]);
      return result;
    }
  
    async givePromotion(employeeId, newRole) {
      const query = `UPDATE EMPLOYEES SET ROLE = ? WHERE EMPLOYEE_ID = ?`;
      const [result] = await this.pool.query(query, [newRole, employeeId]);
      return { message: 'Promotion granted successfully' };
    }
  }
  