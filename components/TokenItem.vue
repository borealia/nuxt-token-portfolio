<template>
  <a
    :href="`https://${isEth ? 'etherscan.io' : 'polygonscan.com'}/address/${
      token.address
    }`"
    target="_blank"
    class="flex items-center hover:bg-gray-100 border-b border-b-1 border-gray-300 p-3"
  >
    <img
      v-if="props.token.logo"
      :src="props.token.logo"
      :alt="props.token.name"
      class="w-12 h-12 rounded-full mr-5"
    />
    <div v-else class="w-12 h-12 bg-gray-400 rounded-full mr-5" />
    <div class="flex flex-col">
      <h3>{{ props.token.amount }} {{ props.token.symbol }}</h3>
      <p>${{ props.token.usdPrice }} USD</p>
    </div>
  </a>
</template>

<script setup>
const props = defineProps({
  token: {
    address: String,
    logo: String,
    name: String,
    symbol: String,
    amount: Number,
    usdPrice: Number,
  },
  isEth: Boolean,
});
</script>
