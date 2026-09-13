import api from './axios';

export const listCustomers = () => api.get('/customers').then((res) => res.data);

export const createCustomer = (payload) => api.post('/customers', payload).then((res) => res.data);

export const updateCustomer = (id, payload) => api.put(`/customers/${id}`, payload).then((res) => res.data);

export const recordPayment = (id, amount, note) =>
  api.post(`/customers/${id}/payments`, { amount, note }).then((res) => res.data);

export const listPayments = (id) => api.get(`/customers/${id}/payments`).then((res) => res.data);

export const getLedger = (id) => api.get(`/customers/${id}/ledger`).then((res) => res.data);

// Resolves a customer picker's state to a customerId, creating the customer first if needed.
// Returns null when no customer is selected (walk-in).
export async function resolveCustomerId({ mode, selectedId, newCustomer }) {
  if (mode === 'new') {
    if (!newCustomer.name.trim()) {
      throw new Error('Customer name is required');
    }
    const created = await createCustomer(newCustomer);
    return created._id;
  }
  return selectedId || null;
}
