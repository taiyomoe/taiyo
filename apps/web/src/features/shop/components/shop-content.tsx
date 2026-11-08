import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { ShopViewer } from "@/features/shop/components/items/item-preview"
import { shopQueryOptions } from "@/features/shop/api/shop"
import { ItemSection } from "@/features/shop/components/items/item-section"
import { ShopHeader } from "@/features/shop/components/shop-header"
import { ShopSection } from "@/features/shop/components/shop-section"
import { Treasury } from "@/features/shop/components/treasury/treasury"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  content: {
    gap: "2.75rem",
    display: "flex",
    flexDirection: "column",
  },
  skeletonStage: {
    borderRadius: radius.xxxl,
    height: { default: "40rem", [breakpoints.md]: "36rem" },
  },
  skeletonHeader: {
    borderRadius: radius.xl,
    height: "6rem",
  },
})

export function ShopContent({ viewer, username }: { viewer: ShopViewer; username: string }) {
  const { data: shop } = useSuspenseQuery(shopQueryOptions)

  return (
    <div sx={styles.content}>
      <ShopHeader balance={shop.balance} />
      <Treasury shop={shop} username={username} viewer={viewer} />
      <ShopSection
        description={m.shop_section_cosmetics_description()}
        title={m.shop_section_cosmetics()}
      >
        <ItemSection shop={shop} username={username} viewer={viewer} />
      </ShopSection>
    </div>
  )
}

export function ShopContentSkeleton() {
  return (
    <div aria-hidden sx={styles.content}>
      <Skeleton sx={styles.skeletonHeader} />
      <Skeleton sx={styles.skeletonStage} />
    </div>
  )
}
