const pool = require('../config/database.config');

const getDepartments = async () => {
  const { rows } = await pool.query('SELECT id, name FROM departments ORDER BY name ASC');
  return rows;
};

const getMunicipalitiesByDepartmentId = async (departmentId) => {
  const { rows } = await pool.query(
    'SELECT id, department_id, name FROM municipalities WHERE department_id = $1 ORDER BY name ASC',
    [departmentId]
  );
  return rows;
};

const getMunicipalitiesByDepartmentName = async (deptName) => {
  const { rows } = await pool.query(
    `SELECT m.id, m.name
     FROM municipalities m
     JOIN departments d ON m.department_id = d.id
     WHERE d.name = $1
     ORDER BY m.name ASC`,
    [deptName]
  );
  return rows;
};

module.exports = {
  getDepartments,
  getMunicipalitiesByDepartmentId,
  getMunicipalitiesByDepartmentName
};
