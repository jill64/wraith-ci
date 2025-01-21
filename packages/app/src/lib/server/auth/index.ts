import {
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_CUSTOM_DOMAIN,
  AUTH0_DOMAIN,
  SESSION_SECRET
} from '$env/static/private'
import { PUBLIC_BASE_URL } from '$env/static/public'
import { CfAuth0 } from 'cf-auth0'

export const auth = new CfAuth0({
  auth0ClientId: AUTH0_CLIENT_ID,
  auth0Domain: AUTH0_DOMAIN,
  auth0CustomDomain: AUTH0_CUSTOM_DOMAIN,
  auth0ClientSecret: AUTH0_CLIENT_SECRET,
  callbackPath: '/api/auth/callback',
  loginPath: '/api/auth/login',
  logoutPath: '/api/auth/logout',
  baseUrl: PUBLIC_BASE_URL,
  sessionSecret: SESSION_SECRET,
  isSvelteKit: true
})
