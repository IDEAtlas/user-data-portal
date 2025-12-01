export const setQueryParam = (key: string, value: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url.toString());
}


export const fetchQueryParam = (key: string) => {
  const url = new URL(window.location.href);
  return url.searchParams.get(key) || undefined;
}


export const removeQueryParam = (key: string) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.pushState({}, '', url.toString());
}
