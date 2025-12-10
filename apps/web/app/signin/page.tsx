"use client"
import { signIn } from "next-auth/react"

export default function Signin() {
    return (
        <div>
            <button onClick={() => {signIn('credentials',{username:'test@user.com',password:'123456'})}}>Signin</button>
        </div>
    )
}