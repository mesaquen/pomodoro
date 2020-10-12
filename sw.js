if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js'
  )
  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded')
    workbox.core.skipWaiting()

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([{"revision":"7e28fa2869cd8e5334ea43b3f37c2bbb","url":"index.html"},{"revision":"33dbdd0177549353eeeb785d02c294af","url":"logo192.png"},{"revision":"917515db74ea8d1aee6a246cfbcc0b45","url":"logo512.png"},{"revision":"f161a6a8f30e4d948a86c0c1e10452a9","url":"precache-manifest.f161a6a8f30e4d948a86c0c1e10452a9.js"},{"revision":"f090c12981c172f8ef41febfd538a772","url":"service-worker.js"},{"revision":"eac203985bdb019f84605aac04abb861","url":"static/css/main.5ecd60fb.chunk.css"},{"revision":"80d17178a489d55e0325eff754b0e1a1","url":"static/js/2.02306e0e.chunk.js"},{"revision":"ca80d1294d8621e8448ebe2bdc62c485","url":"static/js/main.6f3ca29e.chunk.js"},{"revision":"c2ba25cf6eea443d01d4df49ca008616","url":"static/js/runtime-main.f3456f13.js"}])

    /* custom cache rules */
    workbox.routing.registerRoute(
      new workbox.routing.NavigationRoute(
        new workbox.strategies.NetworkFirst({
          cacheName: 'PRODUCTION'
        })
      )
    )
  } else {
    // console.log('Workbox could not be loaded. No Offline support');
  }
}

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

const notify = (title, options) => {
  self.registration.showNotification(title, options)
}

const postMessage = async data => {
  const clientList = await self.clients.matchAll()
  clientList.forEach(client => {
    client.postMessage(data)
  })
}

self.addEventListener('message', event => {
  const baseActions = [{ action: 'start', title: 'Start' }]

  const intervalActions = [
    ...baseActions,
    { action: 'skip', title: 'Skip interval' }
  ]

  const baseOptions = {
    vibrate: [250, 250, 250]
  }

  switch (event.data.type) {
    case 'NOTIFY_LONG':
      notify('Time to take a long break', {
        ...baseOptions,
        actions: intervalActions
      })
      break
    case 'NOTIFY_SHORT':
      notify('Time to take a short break', {
        ...baseOptions,
        actions: intervalActions
      })
      break
    case 'NOTIFY_WORK':
      notify('Time to work', {
        ...baseOptions,
        actions: baseActions
      })
      break
    default:
      break
  }
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const action = event.action || 'default'
  if (action === 'default') {
    const promise = new Promise(resolve => {
      self.clients.matchAll().then(clientList => {

        clientList.forEach(client => {
          if ('focus' in client) {
            client.focus()
          }
        })
        resolve()
      })
    })
    event.waitUntil(promise)
  } else {
    postMessage({ type: 'NOTIFICATION_ACTION', action })
  }
})
