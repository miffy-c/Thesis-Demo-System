export async function apiCall (url, payload, mtd) {
    const request = {
      method: mtd,
      headers: {
        'Content-type': 'application/json',
      },
    };
    if (mtd !== 'GET') {
      request.body = JSON.stringify(payload);
    }
    if (localStorage.getItem('token')) {
      request.headers.Authorization = 'Bearer ' + localStorage.getItem('token');
    }
    let data = '';
    try {
      const response = await fetch('http://localhost:' + 5005 + url, request);
      data = await response.json();
      if (response.status !== 200) {
        throw new Error(data.error);
      }
    } catch (err) {
      data = ''
    }
    return data;
  }