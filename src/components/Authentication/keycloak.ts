import Keycloak, { KeycloakConfig } from "keycloak-js";
import { reactive, toRefs, Ref } from 'vue'

let keycloak: Keycloak;
let refreshTokenIntervalId: number;
let initialiseKeycloak: Promise<boolean>;


const refreshToken = async () => {
  try {
    const data = await keycloak.updateToken(5);
    if (data) {
      if (keycloak.token) {
        localStorage.setItem("access-token", keycloak.token);
      }
    }
  } catch (err) {
    console.info("Auth token refresh failed", err);
  }
}


export default {
  install: (_: any, options: KeycloakConfig) => {
    keycloak = new Keycloak(options);

    keycloak.onReady = (authenticated) => {
      if (!authenticated) return;
      refreshTokenIntervalId = window.setInterval(refreshToken, 5000);
    }

    keycloak.onAuthSuccess = () => {
     // if (keycloak.tokenParsed?.sub) requestS3Allocation(keycloak.tokenParsed.sub);
    }

    keycloak.onAuthRefreshError = () => {
      clearInterval(refreshTokenIntervalId);
      keycloak.clearToken();
      localStorage.removeItem('access-token');
    }

    initialiseKeycloak = keycloak.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`
    });

    initialiseKeycloak
      .then((initResult: boolean) => {
        // console.debug("Keycloak adapter initialised:", initResult);
        state.isAuthenticated = initResult;
        if (keycloak.token !== undefined) {
          state.token = keycloak.token;
          localStorage.setItem("access-token", keycloak.token);
          keycloak.loadUserInfo().then((result: any) => {
            state.fullName = result.name;
            state.sub = result.sub;
          })
        } else {
          localStorage.removeItem("access-token");
        }
      })
      .catch(() => {
        state.hasFailed = true;
        // console.error('Failed to initialise keycloak adapter:', error);
      })
      .finally(() => {
        state.isPending = false;
      });
  }
}


interface KeycloakState {
  isAuthenticated: boolean
  hasFailed: boolean
  isPending: boolean
  token: string,
  fullName: string,
  sub: string
}

const state = reactive<KeycloakState>({
  isAuthenticated: false,
  hasFailed: false,
  isPending: false,
  token: '',
  fullName: '',
  sub: ''
})

interface KeycloakComposable {
  isAuthenticated: Ref<boolean>
  hasFailed: Ref<boolean>
  isPending: Ref<boolean>
  token: Ref<string>
  keycloak: Keycloak
  initialiseKeycloak: Promise<boolean>,
  fullName: Ref<string>,
  sub: Ref<string>
}

export const useKeycloak = (): KeycloakComposable => {
  return {
    ...toRefs<KeycloakState>(state),
    keycloak,
    initialiseKeycloak
  }
}

