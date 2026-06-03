import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api";


const authHeaders = () => {
  const token = localStorage.getItem("crm_token");
  return { Authorization: `Bearer ${token}` };
};

export const post = async (path, data) => {
  return await axios.post(`${API_URL}${path}`, data, {
    headers: authHeaders(),
  });
};

export const put = async (path, data) => {
  return await axios.put(`${API_URL}${path}`, data, {
    headers: authHeaders(),
  });
};

export const delete_ = async (path) => {
  return await axios.delete(`${API_URL}${path}`, {
    headers: authHeaders(),
  });
};

export { delete_ as delete };


export const regg = async (data) => {
  try {
    return await axios.post(`${API_URL}/auth/register`, data);
  } catch (error) {
throw new Error(error.response?.data?.message || error.message);  }
};

export const logg = async (data) => {
  try {
    return await axios.post(`${API_URL}/auth/login`, data);
  } catch (error) {
throw new Error(error.response?.data?.message || error.message);  }
};

export const getMe = async () => {
  try {
    return await axios.get(`${API_URL}/auth/me`, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const getLeads = async (params) => {
  try {
    return await axios.get(`${API_URL}/leads`, {
      headers: authHeaders(),
      params,
    });
     return res.data; 
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createLead = async (data) => {
  return await axios.post(`${API_URL}/leads`, data, {
    headers: authHeaders(),
  });
};

export const updateLead = async (id, data) => {
  try {
    return await axios.put(`${API_URL}/leads/${id}`, data, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteLead = async (id) => {
  try {
    return await axios.delete(`${API_URL}/leads/${id}`, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const convertLead = async (id) => {
  try {
    return await axios.post(
      `${API_URL}/leads/${id}/convert`,
      {},
      { headers: authHeaders() }
    );
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ------------------- DEALS -------------------

export const getDeals = async () => {
  try {
    return await axios.get(`${API_URL}/deals`, {
      headers: authHeaders(),
    });
     return res.data; 
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createDeal = async (data) => {
  try {
    return await axios.post(`${API_URL}/deals`, data, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateDeal = async (id, data) => {
  try {
    return await axios.put(`${API_URL}/deals/${id}`, data, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteDeal = async (id) => {
  try {
    return await axios.delete(`${API_URL}/deals/${id}`, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const getTeam = async () => {
  try {
    return await axios.get(`${API_URL}/team`, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addMember = async (data) => {
  try {
    return await axios.post(`${API_URL}/team`, data, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteMember = async (id) => {
  try {
    return await axios.delete(`${API_URL}/team/${id}`, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getActivities = async () => {
  try {
    return await axios.get(`${API_URL}/activities`, {
      headers: authHeaders(),
    });
     return res.data; 
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ------------------- COMPANIES -------------------

export const getCompaniesMetrics = async () => {
  try {
    return await axios.get(`${API_URL}/companies/metrics`, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createCompany = async (data) => {
  try {
    return await axios.post(`${API_URL}/companies`, data, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createAdminForCompany = async (data) => {
  try {
    return await axios.post(`${API_URL}/auth/create-admin`, data, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createAdminBySuperAdmin = async (data) => {
  try {
    return await axios.post(`${API_URL}/superadmin/create-admin`, data, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllUsers = async () => {
  try {
    return await axios.get(`${API_URL}/auth/users`, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const updateUser = async (id, data) => {
  try {
    return await axios.put(`${API_URL}/auth/users/${id}`, data, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteUser = async (id) => {
  try {
    return await axios.delete(`${API_URL}/auth/users/${id}`, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getMyCompany = async () => {
  try {
    return await axios.get(`${API_URL}/companies/my-company`, {
      headers: authHeaders(),
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const updateCompanySubscription = async (companyId, data) => {
  try {
    return await axios.put(
      `${API_URL}/companies/${companyId}/subscription`,
      data,
      {
        headers: authHeaders(),
      }
    );
  } catch (error) {
    throw error.response?.data || error.message;
  }
};