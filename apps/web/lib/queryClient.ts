import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
    mutations: {
      // Plan/tarif üretimi tekrar denenmez — kullanıcı butona tekrar basmalı,
      // aksi halde 15-45sn'lik bir isteğin sessizce ikinci kez atılması riski var.
      retry: false,
    },
  },
});
