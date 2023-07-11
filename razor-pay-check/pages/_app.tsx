import { AuthBindings, Refine } from "@refinedev/core";
import {
  ThemedLayoutV2,
  ThemedTitleV2,
} from "@refinedev/mui";
import routerProvider from "@refinedev/nextjs-router";
import type { NextPage } from "next";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import React from "react";

import { Header } from "@components/header";
import { ColorModeContextProvider } from "@contexts";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import dataProvider from "@refinedev/simple-rest";
import { appWithTranslation, useTranslation } from "next-i18next";
import { AppIcon } from "src/components/app-icon";

import RazorPayButtonComponent from "src/components/razorpaybutton/paybtn";
import StripePayButtonComponent from "@components/stripepaybutton/stripepaybtn";

const API_URL = "https://api.fake-rest.refine.dev";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  noLayout?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = (props: React.PropsWithChildren) => {
  const { t, i18n } = useTranslation();

  const { data, status } = useSession();
  const router = useRouter();
  const { to } = router.query;

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  if (status === "loading") {
    return <span>loading...</span>;
  }

  const authProvider: AuthBindings = {
    login: async () => {
      signIn("google", {
        callbackUrl: to ? to.toString() : "/",
        redirect: true,
      });

      return {
        success: true,
      };
    },
    logout: async () => {
      signOut({
        redirect: true,
        callbackUrl: "/login",
      });

      return {
        success: true,
      };
    },
    onError: async (error) => {
      console.error(error);
      return {
        error,
      };
    },
    check: async () => {
      if (status === "unauthenticated") {
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }

      return {
        authenticated: true,
      };
    },
    getPermissions: async () => {
      return null;
    },
    getIdentity: async () => {
      if (data?.user) {
        const { user } = data;
        return {
          name: user.name,
          avatar: user.image,
        };
      }

      return null;
    },
  };

  return (
    <>
      <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider(API_URL)}
      >
        <RazorPayButtonComponent amount={200} />
        <StripePayButtonComponent />
      </Refine>
    </>
  );
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout): JSX.Element {
  const renderComponent = () => {
    if (Component.noLayout) {
      return <Component {...pageProps} />;
    }

    return (
      <ThemedLayoutV2
        Header={() => <Header sticky />}
        Title={({ collapsed }) => (
          <ThemedTitleV2
            collapsed={collapsed}
            text="Razor Pay Check"
            icon={<AppIcon />}
          />
        )}
      >
        <Component {...pageProps} />
      </ThemedLayoutV2>
    );
  };

  return (
    <SessionProvider session={session}>
      <App>{renderComponent()}</App>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
