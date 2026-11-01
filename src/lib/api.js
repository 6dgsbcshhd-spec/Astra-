const BASE = window.location.origin; // Автоматически берет адрес твоего сайта на Render

export async function api(method, path, body) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path.startsWith('/api') ? '' : '/api'}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

export const errText = (e) => {
  const map = {
    invalid_credentials: 'Неверный номер или пароль',
    phone_or_email_taken: 'Этот номер или почта уже заняты',
    no_token: 'Вы не авторизованы',
  };
  return map[e.message] || e.message;
};
