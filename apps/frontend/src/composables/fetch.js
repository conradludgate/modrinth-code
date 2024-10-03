export const useBaseFetch = async (url, options = {}, skipAuth = false, prodOverride = false) => {
  const config = useRuntimeConfig();
  let base = import.meta.server ? config.apiBaseUrl : config.public.apiBaseUrl;
  if (prodOverride) {
    base = "https://api.modrinth.com/v2/";
  }

  if (!options.headers) {
    options.headers = {};
  }

  if (import.meta.server) {
    options.headers["x-ratelimit-key"] = config.rateLimitKey;
  }

  if (!skipAuth) {
    const auth = await useAuth();

    options.headers.Authorization = auth.value.token;
  }

  if (options.apiVersion || options.internal) {
    // Base may end in /vD/ or /vD. We would need to replace the digit with the new version number
    // and keep the trailing slash if it exists
    const baseVersion = base.match(/\/v\d\//);

    const replaceStr = options.internal ? `/_internal/` : `/v${options.apiVersion}/`;

    if (baseVersion) {
      base = base.replace(baseVersion[0], replaceStr);
    } else {
      base = base.replace(/\/v\d$/, replaceStr);
    }

    delete options.apiVersion;
  }

  return await $fetch(`${base}${url}`, options);
};
