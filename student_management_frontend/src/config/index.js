const { REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_NODE_ENV, REACT_APP_HEALTHCHECK_PATH } = process.env;

const baseUrl = (REACT_APP_API_BASE && REACT_APP_API_BASE.trim()) ||
  (REACT_APP_BACKEND_URL && REACT_APP_BACKEND_URL.trim()) ||
  '';

const nodeEnv = (REACT_APP_NODE_ENV && REACT_APP_NODE_ENV.trim()) || 'development';

const healthPath = (REACT_APP_HEALTHCHECK_PATH && REACT_APP_HEALTHCHECK_PATH.trim()) || '/health';

// PUBLIC_INTERFACE
export const config = {
  baseUrl,
  nodeEnv,
  healthPath,
};
