<template>
  <BaseAuthLink @click="redirectToLogin()">
    <slot>
      Sign in
    </slot>
  </BaseAuthLink>
</template>

<script setup lang="ts">

import { useKeycloak } from "@/components/Authentication/keycloak.ts";
import BaseAuthLink from "@/components/Authentication/BaseAuthLink.vue";

const { keycloak } = useKeycloak();

const redirectToLogin = () => {
  keycloak.login({ redirectUri: window.location.href })
}
</script>
