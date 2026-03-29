const getClientEnv = (name: keyof ImportMetaEnv) => {
  const value = import.meta.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Falta configurar ${name} en el entorno del frontend.`);
  }

  return value.trim();
};

export const getRequiredClientEnv = (name: keyof ImportMetaEnv) => getClientEnv(name);
export const getOptionalClientEnv = (name: keyof ImportMetaEnv) => {
  const value = import.meta.env[name];
  return value && value.trim() ? value.trim() : null;
};

export const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
