const locationRepo = require('../../infrastructure/repositories/location.repository');

const getDepartments = async (req, res) => {
  try {
    const departments = await locationRepo.getDepartments();
    return res.json(departments);
  } catch (err) {
    console.error('Error al obtener departamentos:', err);
    return res.status(500).json({ error: 'Error al consultar departamentos' });
  }
};

const getMunicipalities = async (req, res) => {
  const { department_id, department_name } = req.query;
  try {
    let municipalities = [];
    if (department_id) {
      municipalities = await locationRepo.getMunicipalitiesByDepartmentId(department_id);
    } else if (department_name) {
      municipalities = await locationRepo.getMunicipalitiesByDepartmentName(department_name);
    } else {
      municipalities = await locationRepo.getMunicipalitiesByDepartmentId(req.params.departmentId);
    }
    return res.json(municipalities);
  } catch (err) {
    console.error('Error al obtener municipios:', err);
    return res.status(500).json({ error: 'Error al consultar municipios' });
  }
};

module.exports = { getDepartments, getMunicipalities };
