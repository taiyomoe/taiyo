"use client"

import { config } from "@taiyomoe/config"
import { pageSchema } from "@taiyomoe/schemas"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { parseAsInteger } from "nuqs"
import { useQueryState } from "nuqs"
import { type ComponentProps, useMemo, useState } from "react"
import { EditText } from "~/components/ui/edit-text"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { cn } from "~/utils/cn"
import { Button, buttonVariants } from "./button"

export const Pagination = ({ className, ...props }: ComponentProps<"div">) => {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(config.pagination.defaultPage),
  )
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(config.pagination.defaultPerPage),
  )
  const options = useMemo(() => {
    if (page === 1) {
      return [
        { label: 1, isActive: true },
        { label: 2, isActive: false },
        { label: 3, isActive: false },
      ]
    }

    return [
      { label: page - 1, isActive: false },
      { label: page, isActive: true },
      { label: page + 1, isActive: false },
    ]
  }, [page])
  const [isEditing, setIsEditing] = useState(false)

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setPage(page)
  }

  const handlePerPageChange = (value: string) => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setPage(null)
    setPerPage(Number(value))
  }

  console.log("isEditing", isEditing)

  return (
    <div
      className={cn(
        "mx-auto flex w-full items-center justify-center gap-4",
        className,
      )}
      {...props}
    >
      <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
        <SelectTrigger>
          <SelectValue placeholder={perPage} />
        </SelectTrigger>
        <SelectContent>
          {config.pagination.perPageOptions.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <PaginationRoot>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onPress={() => handlePageChange(page - 1)} />
          </PaginationItem>
          {options.map((option) => (
            <PaginationItem key={option.label}>
              <PaginationButton
                isActive={option.isActive}
                onPress={() => handlePageChange(option.label)}
              >
                {option.label}
              </PaginationButton>
            </PaginationItem>
          ))}
          <PaginationItem onClick={() => setIsEditing(true)}>
            <EditText
              inputClassName="w-12"
              onChange={(v) => handlePageChange(Number(v))}
              validation={pageSchema}
            >
              <PaginationEllipsis />
            </EditText>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onPress={() => handlePageChange(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>
    </div>
  )
}

const PaginationRoot = ({ className, ...props }: ComponentProps<"nav">) => (
  <nav aria-label="pagination" {...props} />
)
PaginationRoot.displayName = "PaginationRoot"

const PaginationContent = ({ className, ...props }: ComponentProps<"ul">) => (
  <ul
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
)

PaginationContent.displayName = "PaginationContent"

const PaginationItem = ({ className, ...props }: ComponentProps<"li">) => (
  <li className={cn("", className)} {...props} />
)

PaginationItem.displayName = "PaginationItem"

const PaginationButton = ({
  className,
  isActive,
  ...props
}: ComponentProps<typeof Button> & { isActive?: boolean }) => (
  <Button
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "outline" : "ghost"}
    className={cn(buttonVariants({ variant: "ghost" }), className)}
    {...props}
  />
)

const PaginationPrevious = ({
  className,
  ...props
}: ComponentProps<typeof PaginationButton>) => {
  const t = useTranslations("global.pagination")

  return (
    <PaginationButton
      aria-label={t("previousPage")}
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span>{t("previous")}</span>
    </PaginationButton>
  )
}
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: ComponentProps<typeof PaginationButton>) => {
  const t = useTranslations("global.pagination")

  return (
    <PaginationButton
      aria-label={t("nextPage")}
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>{t("next")}</span>
      <ChevronRightIcon className="size-4" />
    </PaginationButton>
  )
}
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: ComponentProps<"span">) => {
  const t = useTranslations("global.pagination")

  return (
    <span
      className={cn("flex size-9 items-center justify-center", className)}
      aria-hidden
      {...props}
    >
      <MoreHorizontalIcon className="size-4 text-subtle transition-colors" />
      <span className="sr-only">{t("morePages")}</span>
    </span>
  )
}
PaginationEllipsis.displayName = "PaginationEllipsis"
