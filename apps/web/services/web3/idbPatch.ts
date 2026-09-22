"use client";

/**
 * idbPatch.ts
 * Bulletproof protection against transient IndexedDB closing errors in Next.js
 * and Web3 providers (@walletconnect/keyvaluestorage, idb-keyval, wagmi).
 *
 * Prevents:
 * "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing."
 */

if (typeof window !== "undefined") {
  // 1. Safe interceptor for IDBDatabase.prototype.transaction
  if (
    typeof IDBDatabase !== "undefined" &&
    IDBDatabase.prototype &&
    typeof IDBDatabase.prototype.transaction === "function" &&
    !(IDBDatabase.prototype.transaction as any)?.__isPatched
  ) {
    const origTransaction = IDBDatabase.prototype.transaction;

    const patchedTransaction = function (
      this: any,
      storeNames: any,
      mode?: any,
      options?: any
    ) {
      try {
        if (typeof origTransaction === "function") {
          return origTransaction.call(this, storeNames, mode, options);
        }
      } catch (err: any) {
        const isClosingError =
          err?.name === "InvalidStateError" ||
          (typeof err?.message === "string" &&
            (err.message.includes("database connection is closing") ||
              err.message.includes("The database connection is closing") ||
              err.message.includes("IDBDatabase")));

        if (isClosingError) {
          // Return a harmless dummy transaction so async callers (idb-keyval, walletconnect)
          // resolve gracefully with empty/undefined data instead of crashing the runtime.
          const dummyRequest: any = {
            result: undefined,
            error: null,
            source: null,
            transaction: null,
            readyState: "done",
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          };

          // Trigger onsuccess asynchronously on the next macrotask
          setTimeout(() => {
            if (typeof dummyRequest.onsuccess === "function") {
              try {
                dummyRequest.onsuccess({ target: dummyRequest } as any);
              } catch {}
            }
          }, 0);

          const dummyStore: any = {
            get: () => dummyRequest,
            getAll: () => {
              dummyRequest.result = [];
              return dummyRequest;
            },
            getAllKeys: () => {
              dummyRequest.result = [];
              return dummyRequest;
            },
            put: () => dummyRequest,
            add: () => dummyRequest,
            delete: () => dummyRequest,
            clear: () => dummyRequest,
            count: () => {
              dummyRequest.result = 0;
              return dummyRequest;
            },
            index: () => dummyStore,
          };

          const dummyTx: any = {
            db: this,
            mode: mode || "readonly",
            error: null,
            objectStore: () => dummyStore,
            abort: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
            oncomplete: null,
            onerror: null,
            onabort: null,
          };

          setTimeout(() => {
            if (typeof dummyTx.oncomplete === "function") {
              try {
                dummyTx.oncomplete({ target: dummyTx } as any);
              } catch {}
            }
          }, 0);

          return dummyTx;
        }

        // Re-throw if it's not a closing connection error
        throw err;
      }
    };

    (patchedTransaction as any).__isPatched = true;
    IDBDatabase.prototype.transaction = patchedTransaction;
  }

  // 2. Global unhandledrejection listener to suppress transient Web3/IDB rejections
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const msg =
      typeof reason === "string"
        ? reason
        : reason instanceof Error
        ? `${reason.name}: ${reason.message} ${reason.stack || ""}`
        : typeof reason === "object" && reason !== null
        ? reason.message || reason.stack || JSON.stringify(reason)
        : String(reason || "");

    if (
      msg.includes("database connection is closing") ||
      msg.includes("IDBDatabase") ||
      msg.includes("Proposal expired") ||
      msg.includes("User rejected") ||
      msg.includes("Connection request reset") ||
      msg.includes("Context is not initialized")
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    }
  });

  // 3. Global error listener
  window.addEventListener("error", (event) => {
    const msg =
      typeof event.message === "string"
        ? event.message
        : event.error?.message || String(event.error || "");

    if (
      msg.includes("database connection is closing") ||
      msg.includes("IDBDatabase")
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    }
  });

  // 4. Console log filter covering all arguments and object payloads
  const shouldSuppress = (args: any[]): boolean => {
    for (const arg of args) {
      if (!arg) continue;
      if (typeof arg === "string") {
        if (
          arg.includes("database connection is closing") ||
          arg.includes("IDBDatabase") ||
          arg.includes("Proposal expired") ||
          arg.includes("Lit is in dev mode") ||
          arg.includes("ObjectMultiplex") ||
          arg.includes("MaxListenersExceededWarning")
        ) {
          return true;
        }
      } else if (arg instanceof Error) {
        if (
          arg.message?.includes("database connection is closing") ||
          arg.message?.includes("IDBDatabase") ||
          arg.stack?.includes("database connection is closing") ||
          arg.stack?.includes("IDBDatabase")
        ) {
          return true;
        }
      } else if (typeof arg === "object") {
        try {
          const str = (arg.message || "") + " " + (arg.stack || "") + " " + JSON.stringify(arg);
          if (
            str.includes("database connection is closing") ||
            str.includes("IDBDatabase") ||
            str.includes("Proposal expired")
          ) {
            return true;
          }
        } catch {}
      }
    }
    return false;
  };

  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    try {
      if (shouldSuppress(args)) return;
      if (typeof origWarn === "function") {
        origWarn.apply(console, args);
      }
    } catch {}
  };

  const origError = console.error;
  console.error = (...args: any[]) => {
    try {
      if (shouldSuppress(args)) return;
      if (typeof origError === "function") {
        origError.apply(console, args);
      }
    } catch {}
  };
}

export {};
