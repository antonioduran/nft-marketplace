import { CryptoHookFactory } from "@_types/hooks";
import { useEffect } from "react";
import useSWR from "swr";

type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>

type UseAccountResponse = {
  connect: () => void
}

export type UseAccountHook = ReturnType<AccountHookFactory>

export const hookFactory : AccountHookFactory = ({provider, ethereum}) => () => {
    const swrRes = useSWR(
      provider ? "web3/useAccount" : null,
     async () => {
        const accounts = await provider!.listAccounts();
        console.log("accounts:::::: " + JSON.stringify(accounts));
        const account = accounts[0];

        console.log("accounts::::::-" + JSON.stringify(account));
  
        if (!account) {
          throw ("Cannot retreive account! Please, connect to web3 wallet.");
        }
        return account;
      }, {
        revalidateOnFocus : false
      }
    )

    useEffect(() => {
      ethereum?.on("accountsChanged", handleAccountsChanged);
      return () => {
        ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      }
    })

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        console.error("Please, connect to Web3 wallet");
      } else if (accounts[0] !== swrRes.data) {
        swrRes.mutate(accounts[0])
      }
    }

    const connect = async () => {
      try {
        ethereum?.request({method: "eth_requestAccounts"});
      } catch(e) {
        console.error(e);
      }
    }
  
    return {
      ...swrRes,
      connect
    }
  }
  