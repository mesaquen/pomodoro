if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js'
  )
  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded')
    workbox.core.skipWaiting()

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)

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
