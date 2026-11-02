import { redirect } from "next/navigation"

/* Temporário: enquanto as telas (Paper · "02 · Telas & Fluxos") não são
   implementadas, a raiz aponta para a referência viva do Design System. */
export default function Home() {
  redirect("/design-system")
}
