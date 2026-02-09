'use client'

// React Imports
import { forwardRef } from 'react'

// Next Imports
import Link from 'next/link'
import type { LinkProps } from 'next/link'

// Type Imports
import type { ChildrenType } from '../types'

type RouterLinkProps = LinkProps &
  Partial<ChildrenType> & {
    className?: string
  }

export const RouterLink = forwardRef((props: RouterLinkProps, ref: any) => {
  // Props
  const { href, className, ...other } = props

  // Prevent undefined href - Next.js Link requires string or object
  const safeHref = href ?? '/'

  return (
    <Link ref={ref} href={safeHref} className={className} {...other}>
      {props.children}
    </Link>
  )
})
