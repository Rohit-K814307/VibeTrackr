import React from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/firebase"
import { useNavigate } from "react-router-dom"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export const SignOutButton: React.FC = () => {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <DropdownMenuItem onSelect={(e) => {
      e.preventDefault()
      handleSignOut()
    }}>
      Sign out
    </DropdownMenuItem>
  )
}
