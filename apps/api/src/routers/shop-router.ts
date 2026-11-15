import { Hono } from "hono"
import { getShopHandler } from "../handlers/get-shop-handler"
import { openLootBoxHandler } from "../handlers/open-loot-box-handler"
import { purchaseShopItemHandler } from "../handlers/purchase-shop-item-handler"

export const shopRouter = new Hono()
  .route("/", getShopHandler)
  .route("/", purchaseShopItemHandler)
  .route("/", openLootBoxHandler)
