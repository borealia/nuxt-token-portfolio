<template>
  <NavBar @updateAddress="updateAddress" />
  <div class="p-5 mt-5">
    <div class="flex items-center justify-center">
      <p class="mr-5 text-lg font-medium">Balances:</p>
      <div class="flex items-center mr-3" @click="chainId = ETHEREUM_CHAINID">
        <input
          id="ethereum-radio-1"
          type="radio"
          value=""
          :checked="chainId === ETHEREUM_CHAINID"
          name="network-radio"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          for="ethereum-radio-1"
          class="ml-2 text-lg font-regular text-gray-900 dark:text-gray-300"
          >Mainnet</label
        >
      </div>
      <div class="flex items-center" @click="chainId = POLYGON_CHAINID">
        <input
          id="polygon-radio-1"
          type="radio"
          value=""
          :checked="chainId === POLYGON_CHAINID"
          name="network-radio"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          for="polygon-radio-1"
          class="ml-2 text-lg font-regular text-gray-900 dark:text-gray-300"
          >Polygon</label
        >
      </div>
    </div>
  </div>
  <div class="flex justify-center p-5">
    <div class="max-w-2xl w-full border border-grey-600 px-10 py-4">
      <div class="w-fit" v-if="chainId === ETHEREUM_CHAINID && !ethLoading">
        <TokenItem
          :token="token"
          :isEth="true"
          :key="`token-${index}`"
          v-for="(token, index) in ethTokenList"
        />
      </div>
      <div
        class="w-fit"
        v-else-if="chainId === POLYGON_CHAINID && !polyLoading"
      >
        <TokenItem
          :token="token"
          :isEth="false"
          :key="`token-${index}`"
          v-for="(token, index) in polyTokenList"
        />
      </div>
      <div
        v-else-if="ethLoading || polyLoading"
        class="flex item-center justify-center gap-2"
      >
        <img
          src="https://t4.ftcdn.net/jpg/01/38/25/65/240_F_138256541_NAbkhf959zgBqIn7nSE952y94DbH03eE.jpg"
          class="animate-spin w-8 h-8"
          alt="loading"
        />
        <span class="leading-8">loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  ETHEREUM_CHAINID,
  POLYGON_CHAINID,
  ETHEREUM_ADDRESS,
  POLYGON_ADDRESS,
  ETHEREUM_LOGO,
  POLYGON_LOGO,
} from "../constants";
import { EvmChain } from "@moralisweb3/common-evm-utils";
const runtimeConfig = useRuntimeConfig();

let Moralis;

const chainId = ref(ETHEREUM_CHAINID);
const ethTokenList = ref([]);
const polyTokenList = ref([]);
const address = ref(null);
const ethLoading = ref(undefined);
const polyLoading = ref(undefined);

const getAvailableTokenList = async (chain, address) => {
  let result = [];
  const nativeBalance = (
    await Moralis.EvmApi.balance.getNativeBalance({
      address: address,
      chain,
    })
  ).toJSON();
  const response = [
    chain._value === EvmChain.ETHEREUM._value
      ? {
          balance: nativeBalance.balance,
          name: "Ether",
          symbol: "ETH",
          decimals: 18,
          logo: ETHEREUM_LOGO,
          token_address: ETHEREUM_ADDRESS,
        }
      : {
          balance: nativeBalance.balance,
          name: "Matic Token",
          symbol: "MATIC",
          decimals: 18,
          logo: POLYGON_LOGO,
          token_address: POLYGON_ADDRESS,
        },
    ...(
      await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain,
      })
    ).toJSON(),
  ];
  for (let i = 0; i < response.length; i++) {
    const token = response[i];
    let balance = token.balance;
    let usdPrice = 0;
    try {
      balance = balance / Math.pow(10, token.decimals);
      usdPrice =
        (
          await Moralis.EvmApi.token.getTokenPrice({
            address: token.token_address,
            chain,
          })
        ).toJSON().usdPrice * balance;
      result.push({
        address: token.token_address,
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        amount:
          balance < 1
            ? Number(balance.toPrecision(2))
            : Number(balance.toFixed(2)),
        usdPrice:
          usdPrice < 1
            ? Number(usdPrice.toPrecision(2))
            : Number(usdPrice.toFixed(2)),
      });
    } catch (err) {
      console.log(err, token.token_address);
    }
  }

  return result;
};

const updateAddress = async (newAddress) => {
  console.log("address", newAddress, runtimeConfig.public.moralisApi);

  if (address.value !== newAddress && newAddress) {
    address.value = newAddress;
    window.global = window.globalThis;
    if (process.client) {
      ethLoading.value = true;
      polyLoading.value = true;

      Moralis = (await import("moralis")).default;
      Moralis.start({
        apiKey: runtimeConfig.public.moralisApi,
      });
      getAvailableTokenList(EvmChain.ETHEREUM, newAddress)
        .then((res) => {
          ethTokenList.value = res;
          ethLoading.value = false;
        })
        .catch((err) => console.log(err));
      getAvailableTokenList(EvmChain.POLYGON, newAddress)
        .then((res) => {
          polyTokenList.value = res;
          polyLoading.value = false;
        })
        .catch((err) => console.log(err));
    }
  }
};
</script>
