import { api } from "@/lib/api"
import { ensureSuccess, getApiErrorCode, unwrap } from "@/lib/envelope"

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && navigator.standalone === true)
const isPushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
const toKeyBytes = (base64url: string) =>
  Uint8Array.from(atob(base64url.replace(/-/g, "+").replace(/_/g, "/")), (char) =>
    char.charCodeAt(0),
  )
const getSubscription = async () => {
  const registration = await navigator.serviceWorker.getRegistration("/")

  return (await registration?.pushManager.getSubscription()) ?? null
}
const saveSubscription = async (subscription: PushSubscription) => {
  const { endpoint, keys } = subscription.toJSON()

  if (endpoint === undefined || keys?.p256dh === undefined || keys.auth === undefined) {
    throw new Error("The browser returned an incomplete push subscription.")
  }

  await ensureSuccess(
    await api.users.me["push-subscriptions"].$put({
      json: { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
    }),
  )
}

export const getPushState = async () => {
  if (!isPushSupported()) {
    return isIos() && !isStandalone() ? "needs-install" : "unsupported"
  }

  if (Notification.permission === "denied") {
    return "denied"
  }

  return Notification.permission === "granted" && (await getSubscription()) !== null ? "on" : "off"
}

export const enablePush = async () => {
  if ((await Notification.requestPermission()) !== "granted") {
    return
  }

  const { publicKey } = await unwrap(await api.users.me["push-subscriptions"]["public-key"].$get())

  if (publicKey === null) {
    throw new Error("Push notifications are not configured on this server.")
  }

  await navigator.serviceWorker.register("/sw.js", { scope: "/" })

  const registration = await navigator.serviceWorker.ready
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toKeyBytes(publicKey),
    }))

  await saveSubscription(subscription)
}

export const disablePush = async () => {
  const subscription = isPushSupported() ? await getSubscription() : null

  if (subscription === null) {
    return
  }

  await ensureSuccess(
    await api.users.me["push-subscriptions"].$delete({
      json: { endpoint: subscription.endpoint },
    }),
  )
  await subscription.unsubscribe()
}

export const sendTestPush = async () => {
  const subscription = await getSubscription()

  if (subscription === null) {
    throw new Error("This device is not subscribed to push notifications.")
  }

  try {
    await ensureSuccess(
      await api.users.me["push-subscriptions"].test.$post({
        json: { endpoint: subscription.endpoint },
      }),
    )
  } catch (error) {
    if (getApiErrorCode(error) === "PUSH_SUBSCRIPTION_EXPIRED") {
      await subscription.unsubscribe()
    }

    throw error
  }
}

/** Re-saves this device's subscription so the server keeps fresh keys and the right owner. */
export const syncPushSubscription = async () => {
  if (!isPushSupported() || Notification.permission !== "granted") {
    return
  }

  const subscription = await getSubscription()

  if (subscription !== null) {
    await saveSubscription(subscription)
  }
}
