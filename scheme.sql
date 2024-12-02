DROP DATABASE my_database;

-- Step 1: Create the database


CREATE DATABASE my_database;

-- Step 2: Switch to the database
USE my_database;

-- Step 3: Create the tables in the correct order
CREATE TABLE POSTAL_CODE (
                             POSTAL_CODE VARCHAR(10) PRIMARY KEY,
                             CITY VARCHAR(100),
                             COUNTRY VARCHAR(100)
);

CREATE TABLE ADDRESS (
                         ADDRESS_ID INTEGER PRIMARY KEY,
                         STREET_NAME VARCHAR(100),
                         HOUSE_NUMBER VARCHAR(10),
                         POSTAL_CODE VARCHAR(10),
                         FOREIGN KEY (POSTAL_CODE) REFERENCES POSTAL_CODE(POSTAL_CODE)
);

CREATE TABLE BRANCH (
                        BRANCH_ID INTEGER PRIMARY KEY,
                        ADDRESS_ID INTEGER,
                        FOREIGN KEY (ADDRESS_ID) REFERENCES ADDRESS(ADDRESS_ID)
);

CREATE TABLE CUSTOMER (
                          CUSTOMER_ID VARCHAR(50) PRIMARY KEY,
                          NAME VARCHAR(255),
                          ADDRESS_ID INTEGER,
                          FOREIGN KEY (ADDRESS_ID) REFERENCES ADDRESS(ADDRESS_ID)
);

CREATE TABLE EMPLOYEE (
                          EMPLOYEE_ID VARCHAR(50) PRIMARY KEY,
                          NAME VARCHAR(255),
                          BRANCH_ID INTEGER,
                          SALARY DECIMAL(10,2),
                          ADDRESS_ID INTEGER,
                          FOREIGN KEY (BRANCH_ID) REFERENCES BRANCH(BRANCH_ID),
                          FOREIGN KEY (ADDRESS_ID) REFERENCES ADDRESS(ADDRESS_ID)
);

CREATE TABLE PRODUCT (
                         PRODUCT_ID INTEGER PRIMARY KEY,
                         NAME VARCHAR(100),
                         DESCRIPTION TEXT,
                         PRICE DECIMAL(10,2)
);

CREATE TABLE INGREDIENT (
                            INGREDIENT_ID INTEGER PRIMARY KEY,
                            NAME VARCHAR(100),
                            COST DECIMAL(10,2)
);

CREATE TABLE PRODUCT_INGREDIENT (
                                    PRODUCT_ID INTEGER,
                                    INGREDIENT_ID INTEGER,
                                    QUANTITY_REQUIRED DECIMAL(10,2),
                                    PRIMARY KEY (PRODUCT_ID, INGREDIENT_ID),
                                    FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID),
                                    FOREIGN KEY (INGREDIENT_ID) REFERENCES INGREDIENT(INGREDIENT_ID)
);

CREATE TABLE STORAGE (
                         BRANCH_ID INTEGER,
                         INGREDIENT_ID INTEGER,
                         QUANTITY DECIMAL(10,2),
                         PRIMARY KEY (BRANCH_ID, INGREDIENT_ID),
                         FOREIGN KEY (BRANCH_ID) REFERENCES BRANCH(BRANCH_ID),
                         FOREIGN KEY (INGREDIENT_ID) REFERENCES INGREDIENT(INGREDIENT_ID)
);

CREATE TABLE `ORDER` (
                         ORDER_ID INTEGER PRIMARY KEY,
                         STATUS VARCHAR(50),
                         CUSTOMER_ID VARCHAR(50),
                         BRANCH_ID INTEGER,
                         ORDER_DATE TIMESTAMP,
                         FOREIGN KEY (CUSTOMER_ID) REFERENCES CUSTOMER(CUSTOMER_ID),
                         FOREIGN KEY (BRANCH_ID) REFERENCES BRANCH(BRANCH_ID)
);

CREATE TABLE ORDER_ITEM (
                            ORDER_ID INTEGER,
                            PRODUCT_ID INTEGER,
                            QUANTITY INTEGER,
                            PRIMARY KEY (ORDER_ID, PRODUCT_ID),
                            FOREIGN KEY (ORDER_ID) REFERENCES `ORDER`(ORDER_ID),
                            FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID)
);

CREATE TABLE ORDER_ITEM_PRICE (
                                  ORDER_ID INTEGER,
                                  PRODUCT_ID INTEGER,
                                  PRICE DECIMAL(10,2),
                                  PRIMARY KEY (ORDER_ID, PRODUCT_ID),
                                  FOREIGN KEY (ORDER_ID) REFERENCES `ORDER`(ORDER_ID),
                                  FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID)
);