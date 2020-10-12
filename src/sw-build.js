const workboxBuild = require('workbox-build')

const buildSw = () => {
  return workboxBuild
    .injectManifest({
      swSrc: 'src/sw.js',
      swDest: 'build/sw.js',
      globDirectory: 'build',
      globPatterns: ['**/*.{js,css,html,png}']
    })
    .then(({ count, size, warnings }) => {
      warnings.forEach(console.warn)
      console.log(
        `${count} files are going to be precached totaling ${size} bites.`
      )
    })
}
  buildSw()

