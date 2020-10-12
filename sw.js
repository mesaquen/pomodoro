if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js'
  )
  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded')
    workbox.core.skipWaiting()

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([{"revision":"0a0167435df195cddcea67943265ed45","url":"index.html"},{"revision":"33dbdd0177549353eeeb785d02c294af","url":"logo192.png"},{"revision":"917515db74ea8d1aee6a246cfbcc0b45","url":"logo512.png"},{"revision":"089fb6a0f4974c00beedc80fc6d40934","url":"precache-manifest.089fb6a0f4974c00beedc80fc6d40934.js"},{"revision":"86587e265c80c773b5356e1a42b5914a","url":"service-worker.js"},{"revision":"eac203985bdb019f84605aac04abb861","url":"static/css/main.5ecd60fb.chunk.css"},{"revision":"80d17178a489d55e0325eff754b0e1a1","url":"static/js/2.02306e0e.chunk.js"},{"revision":"f3eb3a2153afa41377c3f6c073050e48","url":"static/js/main.05828c99.chunk.js"},{"revision":"c2ba25cf6eea443d01d4df49ca008616","url":"static/js/runtime-main.f3456f13.js"}])

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
  console.log('activate sw')
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

  switch (event.data.type) {
    case 'NOTIFY_LONG':
      notify('Time to take a long break', { actions: intervalActions })
      break
    case 'NOTIFY_SHORT':
      notify('Time to take a short break', { actions: intervalActions })
      break
    case 'NOTIFY_WORK':
      notify('Time to work', {
        actions: baseActions
      })
      break
    default:
      break
  }
})

self.addEventListener('notificationclick', event => {
  const action = event.action || 'default'
  console.log('action type:', action)
  if (action === 'default') {
    const promise = new Promise((resolve) => {
      self.clients.matchAll().then(clientList => {

        
        console.log(clientList.length)
        
        clientList.forEach((client) => {
          console.log('focus' in client, client)
          if ('focus' in client) {
            console.log('trying focus on ', client)
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
