"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { api, User } from "@/lib/api"
import { GuestAuthModal } from "@/components/guest-auth-modal"

interface AuthModalState {
  isOpen: boolean
  title?: string
  description?: string
  action?: string
}

interface GuestContextType {
  isGuest: boolean
  user: User | null
  setUser: (user: User | null) => void
  openAuthModal: (options?: { title?: string; description?: string; action?: string }) => void
  closeAuthModal: () => void
  requireAuth: (
    actionCallback?: () => void,
    options?: { title?: string; description?: string; action?: string }
  ) => boolean
  loginUrl: string
}

const GuestContext = createContext<GuestContextType | undefined>(undefined)

export const GUEST_USER: User = {
  user_id: "guest_session",
  name: "Guest Explorer",
  email: "guest@cpaa.ai",
  isGuest: true,
}

export function GuestProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode
  initialUser?: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [modalState, setModalState] = useState<AuthModalState>({
    isOpen: false,
    title: undefined,
    description: undefined,
    action: undefined,
  })

  const isGuest = !user || user.isGuest === true

  const openAuthModal = useCallback((options?: { title?: string; description?: string; action?: string }) => {
    setModalState({
      isOpen: true,
      title: options?.title,
      description: options?.description,
      action: options?.action,
    })
  }, [])

  const closeAuthModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const requireAuth = useCallback(
    (
      actionCallback?: () => void,
      options?: { title?: string; description?: string; action?: string }
    ): boolean => {
      if (isGuest) {
        openAuthModal(options)
        return false
      }
      if (actionCallback) {
        actionCallback()
      }
      return true
    },
    [isGuest, openAuthModal]
  )

  const loginUrl = api.login()

  return (
    <GuestContext.Provider
      value={{
        isGuest,
        user,
        setUser,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        loginUrl,
      }}
    >
      {children}
      <GuestAuthModal
        open={modalState.isOpen}
        onOpenChange={(open) => {
          if (!open) closeAuthModal()
        }}
        title={modalState.title}
        description={modalState.description}
        action={modalState.action}
      />
    </GuestContext.Provider>
  )
}

export function useGuest() {
  const context = useContext(GuestContext)
  if (!context) {
    throw new Error("useGuest must be used within a GuestProvider")
  }
  return context
}
