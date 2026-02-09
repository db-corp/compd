/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as businesses from "../businesses.js";
import type * as constants from "../constants.js";
import type * as creators from "../creators.js";
import type * as deals from "../deals.js";
import type * as disputes from "../disputes.js";
import type * as helpers from "../helpers.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as offers from "../offers.js";
import type * as payments from "../payments.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  businesses: typeof businesses;
  constants: typeof constants;
  creators: typeof creators;
  deals: typeof deals;
  disputes: typeof disputes;
  helpers: typeof helpers;
  messages: typeof messages;
  notifications: typeof notifications;
  offers: typeof offers;
  payments: typeof payments;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
