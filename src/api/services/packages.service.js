import api from "../client.js";

export const packagesService = {
  getAll: async (params = {}) => {
    const res = await api.get('/admin/operator-auth/packages', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/admin/operator-auth/packages/${id}`);
    return res.data;
  },

  createForOperator: async (operatorId, data) => {
    const res = await api.post(`/admin/operator-auth/packages/for-operator/${operatorId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getPackageTypes: async () => {
    const res = await api.get('/admin/operator-auth/packages/package-types');
    return res.data;
  },

  getServiceLevels: async () => {
    const res = await api.get('/admin/operator-auth/packages/service-levels');
    return res.data;
  },

  getExtensions: async () => {
    const res = await api.get('/admin/operator-auth/extensions');
    return res.data;
  },

  suggest: async (data) => {
    const res = await api.post('/admin/operator-auth/packages/suggest', data);
    return res.data;
  },
};
