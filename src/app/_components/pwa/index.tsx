"use client";

import React from "react";

/** @docs https://nextjs.org/docs/app/guides/progressive-web-apps#2-implementing-web-push-notifications */
export const Pwa = () => {
  React.useEffect(() => {
    const setup = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        console.log("Start registering service worker...");

        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        console.log("Service worker registered successfully.");
      }
    };

    void setup();
  }, []);

  return null;
};
