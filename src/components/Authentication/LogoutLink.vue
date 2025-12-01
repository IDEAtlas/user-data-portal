<template>
  <BaseAuthLink @click="redirectToLogin()">
    <slot>
      Sign out
    </slot>
  </BaseAuthLink>
</template>

<script setup lang="ts">
import BaseAuthLink from "@/components/Authentication/BaseAuthLink.vue";
import { useKeycloak } from "@/components/Authentication/keycloak.ts";

const { keycloak } = useKeycloak();

const redirectToLogin = () => {
  keycloak.logout({ redirectUri: window.location.href })
}
</script>
