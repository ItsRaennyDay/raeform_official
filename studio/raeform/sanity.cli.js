import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'y5g5f0dm',
    dataset: 'production'
  },
  deployment: {
    appId: 'st0r4mvhllb8aesyb95hrmx3',
    autoUpdates: true,
  }
})
