import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Proteger rotas admin (exceto login)
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    // Verificar se há token de autenticação
    const authToken = request.cookies.get("admin-auth")?.value

    if (!authToken) {
      // Redirecionar para login se não autenticado
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Aqui você pode adicionar validação adicional do token se necessário
    try {
      // Validação básica do token (você pode implementar JWT ou outra validação)
      if (authToken !== "admin-authenticated") {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
