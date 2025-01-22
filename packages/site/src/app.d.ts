declare global {
  namespace App {
    // interface Error {}
    interface PageData {
      title: {
        en: string
        ja: string
      }
      description: {
        en: string
        ja: string
      }
    }
    interface Platform {
      env: {
        D1: D1Database
      }
    }
  }
}

export {}
