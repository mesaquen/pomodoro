if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js'
  )
  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded')
    workbox.core.skipWaiting()

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([{"revision":"6375cbab4cad74f3976c96c294e7fbfa","url":"index.html"},{"revision":"33dbdd0177549353eeeb785d02c294af","url":"logo192.png"},{"revision":"917515db74ea8d1aee6a246cfbcc0b45","url":"logo512.png"},{"revision":"e91befd07aa939e37b3ce9e0195bffa5","url":"precache-manifest.e91befd07aa939e37b3ce9e0195bffa5.js"},{"revision":"3e1797a174137ea68d6a18d58173b4a0","url":"service-worker.js"},{"revision":"eac203985bdb019f84605aac04abb861","url":"static/css/main.5ecd60fb.chunk.css"},{"revision":"43d619086e4d98b226c71f346a884264","url":"static/js/2.d06f870b.chunk.js"},{"revision":"f804a6ec86bfb933b199935f97cdb53f","url":"static/js/main.b555a4df.chunk.js"},{"revision":"98a480677eee115dbecd6b1316a96684","url":"static/js/runtime-main.c61ccbe0.js"}])

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
