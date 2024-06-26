async function fetch1s(resource) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 500);

  const response = await fetch(resource, { signal: controller.signal });
  clearTimeout(id);

  return response;
}

let count = 0;
let message = '';
let app1 = '';
let app2 = '';
const app1Hosts = new Map();
const app2Hosts = new Map();
let interval;

const counterElement = document.getElementById('counter');
const responseElement = document.getElementById('response');
const app1Element = document.getElementById('app-1');
const app2Element = document.getElementById('app-2');

async function incrementCounter() {
  try {
    const response = await fetch1s('/test');
    json = await response.json();
    message = json.message;
    if (response.ok) {
      count++;
      const app2Host = message.split(' ')[0].split('@')[1];
      const app1Host = message.split(' ')[2].split('@')[1];
      app1Hosts.set(app1Host, (app1Hosts.get(app1Host) || 0) + 1);
      app2Hosts.set(app2Host, (app2Hosts.get(app2Host) || 0) + 1);
    }
    let hosts = [];
    for (const [host, counter] of app1Hosts) {
      hosts.push(`${host} (${Math.floor((100 * counter) / count)}%)`);
    }
    app1 = hosts.join(',');
    hosts = [];
    for (const [host, counter] of app2Hosts) {
      hosts.push(`${host} (${Math.floor((100 * counter) / count)}%)`);
    }
    app2 = hosts.join(',');
  } catch (error) {
    console.error(error);
  }

  counterElement.textContent = count;
  responseElement.textContent = message;
  app1Element.textContent = app1;
  app2Element.textContent = app2;
}

function resetCounter() {
  count = 0;
  app1Hosts.clear();
  app2Hosts.clear();

  counterElement.textContent = count;
  responseElement.textContent = '';
  app1Element.textContent = '';
  app2Element.textContent = '';
}

function changeInterval(event) {
  const delay = event.target.value;
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(incrementCounter, delay);
}

interval = setInterval(incrementCounter, 1000);
