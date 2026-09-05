// DealFlow360 — LocalStorage Mock Service Layer
// Clean mock data abstraction layer enabling future drop-in API migration without UI rewrites.

import { MOCK_USERS } from '../data/users.js';
import { MOCK_CUSTOMERS } from '../data/customers.js';
import { CUSTOMER_TIERS } from '../data/customerTiers.js';
import { MOCK_PRODUCTS } from '../data/products.js';
import { PRICE_LISTS, PRICE_LIST_ITEMS } from '../data/priceLists.js';
import { APPROVAL_RULES, APPROVAL_LEVELS } from '../data/approvalRules.js';
import { INITIAL_QUOTATIONS } from '../data/quotations.js';
import { RECOMMENDATION_RULES } from '../data/recommendations.js';
import { WAREHOUSES } from '../data/warehouses.js';
import { INITIAL_FULFILLMENTS } from '../data/fulfillments.js';
import { INITIAL_SUBSCRIPTIONS } from '../data/subscriptions.js';

export const STORAGE_KEYS = {
  USERS: 'dealflow360_users',
  ROLES: 'dealflow360_roles',
  CUSTOMERS: 'dealflow360_customers',
  CUSTOMER_TIERS: 'dealflow360_customer_tiers',
  CATEGORIES: 'dealflow360_categories',
  PRODUCTS: 'dealflow360_products',
  PRICE_LISTS: 'dealflow360_price_lists',
  PRICE_LIST_ITEMS: 'dealflow360_price_list_items',
  DISCOUNT_RULES: 'dealflow360_discount_rules',
  APPROVAL_RULES: 'dealflow360_approval_rules',
  APPROVAL_LEVELS: 'dealflow360_approval_levels',
  APPROVAL_RULE_STEPS: 'dealflow360_approval_rule_steps',
  QUOTATIONS: 'dealflow360_quotations',
  QUOTATION_ITEMS: 'dealflow360_quotation_items',
  QUOTATION_VERSIONS: 'dealflow360_quotation_versions',
  QUOTATION_COMMENTS: 'dealflow360_quotation_comments',
  RECOMMENDATION_RULES: 'dealflow360_recommendation_rules',
  NEGOTIATION_REQUESTS: 'dealflow360_negotiation_requests',
  NEGOTIATION_ITEMS: 'dealflow360_negotiation_items',
  ORDERS: 'dealflow360_orders',
  FULFILLMENT_ORDERS: 'dealflow360_fulfillment_orders',
  WAREHOUSES: 'dealflow360_warehouses',
  SUBSCRIPTIONS: 'dealflow360_subscriptions',
  BILLING_SCHEDULES: 'dealflow360_billing_schedules',
  INVOICES: 'dealflow360_invoices',
  PAYMENTS: 'dealflow360_payments',
  DEAL_HEALTH: 'dealflow360_deal_health',
};

const CATEGORIES_SEED = [
  { id: 'CAT-001', name: 'Software Subscription', code: 'SW_SUB', defaultGSTRate: 18 },
  { id: 'CAT-002', name: 'Hardware Infrastructure', code: 'HW_INFRA', defaultGSTRate: 18 },
  { id: 'CAT-003', name: 'Platform Core', code: 'PLAT_CORE', defaultGSTRate: 18 },
  { id: 'CAT-004', name: 'Premium Support', code: 'PREM_SUPP', defaultGSTRate: 18 },
  { id: 'CAT-005', name: 'Professional Services', code: 'PROF_SERV', defaultGSTRate: 18 },
  { id: 'CAT-006', name: 'IoT Hardware', code: 'IOT_HW', defaultGSTRate: 18 }
];

const ROLES_SEED = [
  { id: 'ROLE-001', code: 'SALES_REP', label: 'Sales Representative', permissions: ['create_quote', 'view_my_quotes', 'negotiate'] },
  { id: 'ROLE-002', code: 'SALES_MANAGER', label: 'Sales Manager', permissions: ['approve_level_1', 'view_all_quotes'] },
  { id: 'ROLE-003', code: 'FINANCE_DIRECTOR', label: 'Finance Director', permissions: ['approve_level_2', 'billing_control'] }
];

export const storageService = {
  /**
   * Retrieve an array or object from localStorage by key.
   */
  getData: (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`storageService.getData error on [${key}]:`, err);
      return null;
    }
  },

  /**
   * Store data directly into localStorage.
   */
  setData: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error(`storageService.setData error on [${key}]:`, err);
      return false;
    }
  },

  /**
   * Append an item to an array collection.
   */
  addData: (key, item) => {
    try {
      const list = storageService.getData(key) || [];
      const updated = [item, ...list];
      storageService.setData(key, updated);
      return item;
    } catch (err) {
      console.error(`storageService.addData error on [${key}]:`, err);
      return null;
    }
  },

  /**
   * Update an existing item in an array collection by id.
   */
  updateData: (key, id, changes) => {
    try {
      const list = storageService.getData(key) || [];
      let updatedItem = null;
      const updatedList = list.map(item => {
        if (item.id === id || item.quotationNumber === id) {
          updatedItem = { ...item, ...changes, updatedAt: new Date().toISOString() };
          return updatedItem;
        }
        return item;
      });
      storageService.setData(key, updatedList);
      return updatedItem;
    } catch (err) {
      console.error(`storageService.updateData error on [${key}, id:${id}]:`, err);
      return null;
    }
  },

  /**
   * Delete an item from an array collection by id.
   */
  deleteData: (key, id) => {
    try {
      const list = storageService.getData(key) || [];
      const filtered = list.filter(item => item.id !== id && item.quotationNumber !== id);
      storageService.setData(key, filtered);
      return true;
    } catch (err) {
      console.error(`storageService.deleteData error on [${key}, id:${id}]:`, err);
      return false;
    }
  },

  /**
   * Seed all initial mock data collections into localStorage if empty.
   */
  seedInitialData: (forceReset = false) => {
    try {
      const seeds = [
        { key: STORAGE_KEYS.USERS, data: MOCK_USERS },
        { key: STORAGE_KEYS.ROLES, data: ROLES_SEED },
        { key: STORAGE_KEYS.CUSTOMERS, data: MOCK_CUSTOMERS },
        { key: STORAGE_KEYS.CUSTOMER_TIERS, data: CUSTOMER_TIERS },
        { key: STORAGE_KEYS.CATEGORIES, data: CATEGORIES_SEED },
        { key: STORAGE_KEYS.PRODUCTS, data: MOCK_PRODUCTS },
        { key: STORAGE_KEYS.PRICE_LISTS, data: PRICE_LISTS },
        { key: STORAGE_KEYS.PRICE_LIST_ITEMS, data: PRICE_LIST_ITEMS },
        { key: STORAGE_KEYS.APPROVAL_RULES, data: APPROVAL_RULES },
        { key: STORAGE_KEYS.APPROVAL_LEVELS, data: APPROVAL_LEVELS },
        { key: STORAGE_KEYS.QUOTATIONS, data: INITIAL_QUOTATIONS },
        { key: STORAGE_KEYS.RECOMMENDATION_RULES, data: RECOMMENDATION_RULES },
        { key: STORAGE_KEYS.WAREHOUSES, data: WAREHOUSES },
        { key: STORAGE_KEYS.FULFILLMENT_ORDERS, data: INITIAL_FULFILLMENTS },
        { key: STORAGE_KEYS.SUBSCRIPTIONS, data: INITIAL_SUBSCRIPTIONS },
      ];

      seeds.forEach(({ key, data }) => {
        if (forceReset || !localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(data));
        }
      });

      return true;
    } catch (err) {
      console.error('Error seeding initial data:', err);
      return false;
    }
  },

  /**
   * Returns an object containing all raw stored JSON collections for developer inspection.
   */
  getAllCollectionsSnapshot: () => {
    const result = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      result[name] = storageService.getData(key) || [];
    });
    return result;
  }
};

// Auto-seed on module import if storage is empty
storageService.seedInitialData(false);
