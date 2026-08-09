import api from '../../../services/api';

export const locationService = {
  async getDepartments() {
    const response = await api.get('/locations/departments');
    return response.data || [];
  },

  async getMunicipalities(departmentNameOrId) {
    if (!departmentNameOrId) return [];

    let url = '/locations/municipalities';
    if (typeof departmentNameOrId === 'number' || !isNaN(departmentNameOrId)) {
      url += `?department_id=${departmentNameOrId}`;
    } else {
      url += `?department_name=${encodeURIComponent(departmentNameOrId)}`;
    }

    const response = await api.get(url);
    return response.data || [];
  }
};
