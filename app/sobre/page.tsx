import Footer from "@/components/footer"

export default function Sobre() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Sobre Nós</h1>

        <p className="mt-3 text-2xl">Página sobre nós.</p>
      </main>

      <Footer />
    </section>
  )
}
