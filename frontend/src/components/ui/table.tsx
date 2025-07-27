"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 shadow-xl backdrop-blur-sm"
    >
      <div className="overflow-x-auto">
        <table
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </div>
  )
}


function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}


function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        "[&_tr:nth-child(even)]:bg-muted/20",
        "[&_tr:nth-child(odd)]:bg-background/50",
        className
      )}
      {...props}
    />
  )
}


function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "relative h-12 px-4 text-left align-middle font-semibold text-foreground/90 tracking-wide uppercase text-xs",
        "bg-gradient-to-b from-transparent to-primary/5",
        "border-r border-border/20 last:border-r-0",
        "group-hover:text-primary transition-colors duration-200",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
        "after:bg-gradient-to-r after:from-transparent after:via-primary/50 after:to-transparent",
        "after:opacity-0 after:transition-opacity after:duration-300",
        "hover:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}


function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "mt-6 text-sm text-muted-foreground/80 font-medium tracking-wide",
        "bg-gradient-to-r from-transparent via-muted/20 to-transparent",
        "py-2 px-4 rounded-lg border border-border/30",
        className
      )}
      {...props}
    />
  )
}


export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
