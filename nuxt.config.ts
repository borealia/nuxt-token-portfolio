// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],
  runtimeConfig: {
    public: {
      moralisApi: process.env.MORALIS_API || "",
      infuraId: process.env.INFURA_ID || "",
    },
  },
});
