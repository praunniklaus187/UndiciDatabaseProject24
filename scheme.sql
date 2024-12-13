DROP DATABASE IF EXISTS my_database;
CREATE DATABASE my_database;
USE my_database;

CREATE TABLE POSTAL_CODE (
                             POSTAL_CODE VARCHAR(10) PRIMARY KEY,
                             CITY VARCHAR(100),
                             COUNTRY VARCHAR(100)
);

CREATE TABLE ADDRESS (
                         ADDRESS_ID INT PRIMARY KEY AUTO_INCREMENT,
                         STREET_NAME VARCHAR(100),
                         HOUSE_NUMBER VARCHAR(10),
                         POSTAL_CODE VARCHAR(10),
                         FOREIGN KEY (POSTAL_CODE) REFERENCES POSTAL_CODE(POSTAL_CODE)
);

CREATE TABLE BRANCH (
                        BRANCH_ID INT PRIMARY KEY AUTO_INCREMENT,
                        ADDRESS_ID INT,
                        FOREIGN KEY (ADDRESS_ID) REFERENCES ADDRESS(ADDRESS_ID)
);

CREATE TABLE CUSTOMER (
                          CUSTOMER_ID VARCHAR(50) PRIMARY KEY,
                          NAME VARCHAR(255),
                          ADDRESS_ID INT,
                          FOREIGN KEY (ADDRESS_ID) REFERENCES ADDRESS(ADDRESS_ID)
);

-- Trigger to auto-generate CUSTOMER_ID
DELIMITER //
CREATE TRIGGER trg_customer_id
    BEFORE INSERT ON CUSTOMER
    FOR EACH ROW
BEGIN
    IF NEW.CUSTOMER_ID IS NULL OR NEW.CUSTOMER_ID = '' THEN
        -- Extract numeric part after 'CUST' and find max
        SELECT COALESCE(MAX(CAST(SUBSTR(CUSTOMER_ID,5) AS UNSIGNED)),0) + 1
        INTO @next_cust_id
        FROM CUSTOMER
        WHERE CUSTOMER_ID LIKE 'CUST%';

        SET NEW.CUSTOMER_ID = CONCAT('CUST', LPAD(@next_cust_id, 3, '0'));
    END IF;
END//
DELIMITER ;

CREATE TABLE EMPLOYEE (
                          EMPLOYEE_ID VARCHAR(50) PRIMARY KEY,
                          NAME VARCHAR(255),
                          PASSWORD VARCHAR(255),
                          ROLE VARCHAR(50),
                          BRANCH_ID INT,
                          SALARY DECIMAL(10,2),
                          ADDRESS_ID INT,
                          FOREIGN KEY (BRANCH_ID) REFERENCES BRANCH(BRANCH_ID),
                          FOREIGN KEY (ADDRESS_ID) REFERENCES ADDRESS(ADDRESS_ID)
);

-- Trigger to auto-generate EMPLOYEE_ID
DELIMITER //
CREATE TRIGGER trg_employee_id
    BEFORE INSERT ON EMPLOYEE
    FOR EACH ROW
BEGIN
    IF NEW.EMPLOYEE_ID IS NULL OR NEW.EMPLOYEE_ID = '' THEN
        SELECT COALESCE(MAX(CAST(SUBSTR(EMPLOYEE_ID,4) AS UNSIGNED)),0) + 1
        INTO @next_emp_id
        FROM EMPLOYEE
        WHERE EMPLOYEE_ID LIKE 'EMP%';

        SET NEW.EMPLOYEE_ID = CONCAT('EMP', LPAD(@next_emp_id, 3, '0'));
    END IF;
END//
DELIMITER ;

CREATE TABLE PRODUCT (
                         PRODUCT_ID INT PRIMARY KEY AUTO_INCREMENT,
                         NAME VARCHAR(100),
                         DESCRIPTION TEXT,
                         PRICE DECIMAL(10,2)
);

CREATE TABLE INGREDIENT (
                            INGREDIENT_ID INT PRIMARY KEY AUTO_INCREMENT,
                            NAME VARCHAR(100),
                            COST DECIMAL(10,2)
);

CREATE TABLE PRODUCT_INGREDIENT (
                                    PRODUCT_ID INT,
                                    INGREDIENT_ID INT,
                                    QUANTITY_REQUIRED DECIMAL(10,2),
                                    PRIMARY KEY (PRODUCT_ID, INGREDIENT_ID),
                                    FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID),
                                    FOREIGN KEY (INGREDIENT_ID) REFERENCES INGREDIENT(INGREDIENT_ID)
);

CREATE TABLE STORAGE (
                         BRANCH_ID INT,
                         INGREDIENT_ID INT,
                         QUANTITY DECIMAL(10,2),
                         PRIMARY KEY (BRANCH_ID, INGREDIENT_ID),
                         FOREIGN KEY (BRANCH_ID) REFERENCES BRANCH(BRANCH_ID),
                         FOREIGN KEY (INGREDIENT_ID) REFERENCES INGREDIENT(INGREDIENT_ID)
);

-- `ORDER` table with AUTO_INCREMENT
CREATE TABLE `ORDER` (
                         ORDER_ID INT PRIMARY KEY AUTO_INCREMENT,
                         STATUS VARCHAR(50),
                         CUSTOMER_ID VARCHAR(50),
                         BRANCH_ID INT,
                         ORDER_DATE TIMESTAMP,
                         FOREIGN KEY (CUSTOMER_ID) REFERENCES CUSTOMER(CUSTOMER_ID),
                         FOREIGN KEY (BRANCH_ID) REFERENCES BRANCH(BRANCH_ID)
);

CREATE TABLE ORDER_ITEM (
                            ORDER_ID INT,
                            PRODUCT_ID INT,
                            QUANTITY INT,
                            PRIMARY KEY (ORDER_ID, PRODUCT_ID),
                            FOREIGN KEY (ORDER_ID) REFERENCES `ORDER`(ORDER_ID),
                            FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID)
);

CREATE TABLE ORDER_ITEM_PRICE (
                                  ORDER_ID INT,
                                  PRODUCT_ID INT,
                                  PRICE DECIMAL(10,2),
                                  PRIMARY KEY (ORDER_ID, PRODUCT_ID),
                                  FOREIGN KEY (ORDER_ID) REFERENCES `ORDER`(ORDER_ID),
                                  FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID)
);


INSERT INTO POSTAL_CODE (POSTAL_CODE, CITY, COUNTRY) VALUES
                                                         ('9000', 'St. Gallen', 'Schweiz'),
                                                         ('94032', 'Passau', 'Deutschland');

INSERT INTO ADDRESS (STREET_NAME, HOUSE_NUMBER, POSTAL_CODE) VALUES
                                                                 ('Guisanstrasse', '20', '9000'),
                                                                 ('Innstraße', '41', '94032');

INSERT INTO BRANCH (ADDRESS_ID) VALUES
                                    (1),
                                    (2);

-- Insert customers without specifying CUSTOMER_ID, trigger will handle it
INSERT INTO CUSTOMER (NAME, ADDRESS_ID) VALUES
                                            ('Thomas Bieger', 1),
                                            ('Walter von der Vogelweide', 2);

-- Insert employees without specifying EMPLOYEE_ID, trigger will handle it
INSERT INTO EMPLOYEE (NAME, BRANCH_ID, SALARY, ADDRESS_ID, PASSWORD, ROLE) VALUES
                                                                               ('Samuel Widmer', 1, 140000.00, 1, 'secret123', 'admin' ),
                                                                               ('Niklaus von Praun', 2, 55000.00, 2, 'pass456', 'employee');

INSERT INTO PRODUCT (NAME, DESCRIPTION, PRICE) VALUES
                                                   ('Cheese Pizza', 'Classic cheese pizza', 10.99),
                                                   ('Pepperoni Pizza', 'Pizza with pepperoni topping', 12.99),
                                                   ('Veggie Pizza', 'Pizza with assorted vegetables', 11.99),
                                                   ('BBQ Chicken Pizza', 'Pizza with BBQ chicken topping', 13.99),
                                                   ('Margherita Pizza', 'Pizza with fresh basil and mozzarella', 9.99),
                                                   ('Hawaiian Pizza', 'Pizza with ham and pineapple topping', 12.49),
                                                   ('Meat Lover\'s Pizza', 'Pizza with assorted meat toppings', 14.99),
                                                   ('Gluten-Free Cheese Pizza', 'Gluten-free version of classic cheese pizza', 11.99),
                                                   ('White Pizza', 'Pizza with ricotta and mozzarella cheese', 11.49),
                                                   ('Buffalo Chicken Pizza', 'Pizza with buffalo chicken topping', 13.49);


INSERT INTO INGREDIENT (NAME, COST) VALUES
                                        ('Cheese', 2.50),
                                        ('Pepperoni', 3.00),
                                        ('Tomato Sauce', 1.00),
                                        ('Vegetables', 2.00),
                                        ('BBQ Chicken', 3.50),
                                        ('Basil', 1.50),
                                        ('Ham', 3.00),
                                        ('Pineapple', 2.50),
                                        ('Assorted Meats', 4.00),
                                        ('Ricotta', 2.50),
                                        ('Mozzarella', 2.50),
                                        ('Buffalo Chicken', 3.50);


-- Quantity is measured in kg or liters
INSERT INTO PRODUCT_INGREDIENT (PRODUCT_ID, INGREDIENT_ID, QUANTITY_REQUIRED) VALUES
                                                                                  (1, 1, 0.30),  -- Cheese Pizza requires 0.30 units of Cheese
                                                                                  (1, 3, 0.20),  -- Cheese Pizza requires 0.20 units of Tomato Sauce
                                                                                  (2, 1, 0.30),  -- Pepperoni Pizza requires 0.30 units of Cheese
                                                                                  (2, 2, 0.20),  -- Pepperoni Pizza requires 0.20 units of Pepperoni
                                                                                  (2, 3, 0.20),  -- Pepperoni Pizza requires 0.20 units of Tomato Sauce
                                                                                  (3, 1, 0.30),  -- Veggie Pizza requires 0.30 units of Cheese
                                                                                  (3, 4, 0.50),  -- Veggie Pizza requires 0.50 units of Vegetables
                                                                                  (3, 3, 0.20),  -- Veggie Pizza requires 0.20 units of Tomato Sauce
                                                                                  (4, 1, 0.30),  -- BBQ Chicken Pizza requires 0.30 units of Cheese
                                                                                  (4, 5, 0.40),  -- BBQ Chicken Pizza requires 0.40 units of BBQ Chicken
                                                                                  (5, 1, 0.30),  -- Margherita Pizza requires 0.30 units of Cheese
                                                                                  (5, 6, 0.10),  -- Margherita Pizza requires 0.10 units of Basil
                                                                                  (6, 1, 0.30),  -- Hawaiian Pizza requires 0.30 units of Cheese
                                                                                  (6, 7, 0.20),  -- Hawaiian Pizza requires 0.20 units of Ham
                                                                                  (6, 8, 0.20),  -- Hawaiian Pizza requires 0.20 units of Pineapple
                                                                                  (7, 1, 0.30),  -- Meat Lover's Pizza requires 0.30 units of Cheese
                                                                                  (7, 9, 0.50),  -- Meat Lover's Pizza requires 0.50 units of Assorted Meats
                                                                                  (8, 1, 0.30),  -- Gluten-Free Cheese Pizza requires 0.30 units of Cheese
                                                                                  (9, 10, 0.30), -- White Pizza requires 0.30 units of Ricotta
                                                                                  (9, 11, 0.30), -- White Pizza requires 0.30 units of Mozzarella
                                                                                  (10, 1, 0.30), -- Buffalo Chicken Pizza requires 0.30 units of Cheese
                                                                                  (10, 12, 0.40); -- Buffalo Chicken Pizza requires 0.40 units of Buffalo Chicken


INSERT INTO STORAGE (BRANCH_ID, INGREDIENT_ID, QUANTITY) VALUES
                                                             (1, 1, 200.00), -- Branch 1 has 200 units of Cheese
                                                             (1, 2, 100.00), -- Branch 1 has 100 units of Pepperoni
                                                             (1, 3, 150.00), -- Branch 1 has 150 units of Tomato Sauce
                                                             (1, 4, 80.00),  -- Branch 1 has 80 units of Vegetables
                                                             (1, 5, 50.00),  -- Branch 1 has 50 units of BBQ Chicken
                                                             (1, 6, 40.00),  -- Branch 1 has 40 units of Basil
                                                             (2, 1, 180.00), -- Branch 2 has 180 units of Cheese
                                                             (2, 2, 90.00),  -- Branch 2 has 90 units of Pepperoni
                                                             (2, 7, 70.00),  -- Branch 2 has 70 units of Ham
                                                             (2, 8, 60.00),  -- Branch 2 has 60 units of Pineapple
                                                             (2, 9, 40.00),  -- Branch 2 has 40 units of Assorted Meats
                                                             (2, 10, 50.00), -- Branch 2 has 50 units of Ricotta
                                                             (2, 11, 100.00),-- Branch 2 has 100 units of Mozzarella
                                                             (1, 12, 60.00), -- Branch 1 has 60 units of Buffalo Chicken
                                                             (2, 12, 70.00); -- Branch 2 has 70 units of Buffalo Chicken


INSERT INTO `ORDER` (STATUS, CUSTOMER_ID, BRANCH_ID, ORDER_DATE) VALUES
                                                                     ('Completed', 'CUST001', 1, '2024-12-02 12:30:00'),
                                                                     ('In Progress', 'CUST002', 2, '2024-12-02 13:00:00');

INSERT INTO ORDER_ITEM (ORDER_ID, PRODUCT_ID, QUANTITY) VALUES
                                                            (1, 1, 2),
                                                            (2, 2, 1);

INSERT INTO ORDER_ITEM_PRICE (ORDER_ID, PRODUCT_ID, PRICE) VALUES
                                                               (1, 1, 10.99),
                                                               (2, 2, 12.99);