if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js'
  )
  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded')
    workbox.core.skipWaiting()

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([{"revision":"58b80137aebbbfbc86ff67de959c9fd7","url":"index.html"},{"revision":"33dbdd0177549353eeeb785d02c294af","url":"logo192.png"},{"revision":"917515db74ea8d1aee6a246cfbcc0b45","url":"logo512.png"},{"revision":"58df890c37aafb40e18bfc1e232f712c","url":"precache-manifest.58df890c37aafb40e18bfc1e232f712c.js"},{"revision":"d34b825dce71b56d901b8320de59787b","url":"service-worker.js"},{"revision":"eac203985bdb019f84605aac04abb861","url":"static/css/main.5ecd60fb.chunk.css"},{"revision":"099e0ae7aacf0cf46426dc435aa8141f","url":"static/js/2.0feb3c0c.chunk.js"},{"revision":"2ff3cf51b2a9aee7f68f8d1e08c84ef3","url":"static/js/main.3cdb90ad.chunk.js"},{"revision":"ea4b3261f31bed179765a887b6af4735","url":"static/js/runtime-main.f73bf744.js"}])

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
