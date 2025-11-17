"use client"
import { signOut } from "next-auth/react"
 
export function SignOut() {
  return <button className="btn btn-sm btn-danger ms-2" onClick={() => signOut()}>Sign Out</button>
}