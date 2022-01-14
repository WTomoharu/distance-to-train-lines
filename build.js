const esbuild = require('esbuild')
const alias = require('esbuild-plugin-alias')
const server = require("live-server")

const fs = require('fs-extra')
const glob = require('glob')

// remove old dist dir
fs.removeSync("./dist")

// build src
esbuild.build({
  entryPoints: glob.sync(
    "src/pages/**/index.@(js|ts|jsx|tsx)"
  ),

  outbase: './src/pages',
  outdir: './dist',

  bundle: true,
  minify: false,
  sourcemap: "inline",

  plugins: [
    alias({
      "~": "src",
      "react": require.resolve("preact/compat"),
      "react-dom/test-utils": require.resolve("preact/test-utils"),
      "react-dom": require.resolve("preact/compat"),
    }),
  ],

  watch: process.argv.includes("--watch") ? {
    onRebuild: (error, result) => {
      if (!error && result) {
        console.log(
          `${new Date().toLocaleString()} watch build succeeded\n`
        )
      }
    }
  } : false,
}).then(() => {
  console.log(`${new Date().toLocaleString()} build succeeded`)

  if (process.argv.includes("--server")) {
    const port = 8000

    server.start({
      port,
      host: "localhost",
      root: "./dist",
      open: false,
      logLevel: 0,
    })

    console.log(`listening at http://localhost:${port}`)
  }

  if (process.argv.includes("--watch")) console.log("")
}).catch(() => {
})


// copy static files
for (const path of glob.sync("@(src|public)/**/*.!(js|ts|jsx|tsx)")) {
  fs.copySync(`./${path}`, path.replace(/(^src\/pages|^src|^public)\//gm, "./dist/"))
}
