<template>
  <nav class="bg-gray-800 px-4 py-2.5 flex justify-end">
    <button
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 text-center"
      v-if="walletId"
    >
      {{ shortAddress(walletId) }}
    </button>
    <button
      @click="show = true"
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 text-center"
      v-else
    >
      Connect
    </button>
  </nav>
  <ConnectModal
    :show="show"
    @close="show = false"
    @connectMetamask="connectMetamask"
    @walletConnect="walletConnect"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider/dist/umd/index.min.js";

const runtimeConfig = useRuntimeConfig();
const emit = defineEmits(["update-address"]);

const walletId = ref(null);
const chainId = ref(null);

// reactive state
const show = ref(false);

onMounted(async () => {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const accounts = await window.web3.eth.getAccounts();
    if (accounts.length > 0) {
      walletId.value = accounts[0];
    }
    const chainId = await window.web3.eth.getChainId();
    if (chainId !== 1 && chainId !== 137)
      alert("Change Network to Ethereum Mainnet");
    emit("update-address", walletId.value);
  }
});

async function connectMetamask() {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    window.alert("Non-Ethereum browser detected");
  }
  const accounts = await window.web3.eth.getAccounts();
  walletId.value = accounts[0];
  show.value = false;

  chainId.value = await window.web3.eth.getChainId();
  emit("update-address", walletId.value);
}

async function walletConnect() {
  window.global = window.globalThis;
  if (process.client) {
    const provider = new WalletConnectProvider({
      infuraId: runtimeConfig.public.infuraId,
    });
    await provider.enable();
    walletId.value = provider.accounts[0] ?? null;
    show.value = false;
    emit("update-address", walletId.value);
  }
}
</script>
