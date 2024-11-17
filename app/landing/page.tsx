import { ArrowRight, Menu } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Component() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-white">
            <header className="flex h-20 w-full items-center px-4 md:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <nav className="grid gap-6">
                            <Link className="hover:text-foreground/80" href="#">
                                Menú
                            </Link>
                            <Link className="hover:text-foreground/80" href="#">
                                Servicios
                            </Link>
                            <Link className="hover:text-foreground/80" href="#">
                                Ofertas
                            </Link>
                            <Link className="hover:text-foreground/80" href="#">
                                Contacto
                            </Link>
                        </nav>
                    </SheetContent>
                </Sheet>
                <Link className="mr-6 hidden lg:flex" href="#">
                    <span className="font-serif text-2xl font-bold">iFOOD</span>
                </Link>
                <nav className="hidden gap-6 lg:flex">
                    <Link className="hover:text-foreground/80" href="#">
                        Menú
                    </Link>
                    <Link className="hover:text-foreground/80" href="#">
                        Servicios
                    </Link>
                    <Link className="hover:text-foreground/80" href="#">
                        Ofertas
                    </Link>
                    <Link className="hover:text-foreground/80" href="#">
                        Contacto
                    </Link>
                </nav>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="font-serif text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                        SIMPLE Y DELICIOSAS RECETAS
                                    </h1>
                                    <p className="max-w-[600px] text-gray-500 md:text-xl">
                                        Una de nuestras especialidades es nuestro saludable desayuno. Preparamos platos frescos y deliciosos
                                        todos los días.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button className="bg-black text-white">
                                        Explorar Platos
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="relative aspect-square w-full">
                                    <Image
                                        alt="Plato principal"
                                        className="object-cover"
                                        height="600"
                                        src="/placeholder.svg"
                                        style={{
                                            aspectRatio: "600/600",
                                            objectFit: "cover",
                                        }}
                                        width="600"
                                    />
                                    <div className="absolute inset-0 rounded-full border-8 border-orange-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="font-serif text-3xl font-bold tracking-tighter sm:text-5xl">NUESTRAS CATEGORÍAS</h2>
                                <p className="max-w-[900px] text-gray-500 md:text-xl">
                                    Entendemos que cada evento es único, y trabajamos contigo para personalizar nuestro menú de catering según
                                    tus necesidades específicas.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative aspect-square w-full">
                                    <Image
                                        alt="Plato de pasta"
                                        className="rounded-full object-cover"
                                        height="400"
                                        src="/placeholder.svg"
                                        style={{
                                            aspectRatio: "400/400",
                                            objectFit: "cover",
                                        }}
                                        width="400"
                                    />
                                    <div className="absolute inset-0 rounded-full border-8 border-green-200" />
                                </div>
                                <h3 className="font-serif text-xl font-bold">Pasta Fresca</h3>
                                <p className="text-center text-gray-500">Deliciosas pastas hechas a mano con ingredientes frescos.</p>
                            </div>
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative aspect-square w-full">
                                    <Image
                                        alt="Plato de ensalada"
                                        className="rounded-full object-cover"
                                        height="400"
                                        src="/placeholder.svg"
                                        style={{
                                            aspectRatio: "400/400",
                                            objectFit: "cover",
                                        }}
                                        width="400"
                                    />
                                    <div className="absolute inset-0 rounded-full border-8 border-orange-200" />
                                </div>
                                <h3 className="font-serif text-xl font-bold">Ensaladas</h3>
                                <p className="text-center text-gray-500">Frescas y saludables ensaladas con ingredientes de temporada.</p>
                            </div>
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative aspect-square w-full">
                                    <Image
                                        alt="Plato de carne"
                                        className="rounded-full object-cover"
                                        height="400"
                                        src="/placeholder.svg"
                                        style={{
                                            aspectRatio: "400/400",
                                            objectFit: "cover",
                                        }}
                                        width="400"
                                    />
                                    <div className="absolute inset-0 rounded-full border-8 border-green-200" />
                                </div>
                                <h3 className="font-serif text-xl font-bold">Carnes</h3>
                                <p className="text-center text-gray-500">Selectas carnes preparadas a la perfección.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="font-serif text-3xl font-bold tracking-tighter sm:text-5xl">
                                    EXPERIENCIA DE SABORES REALES
                                </h2>
                                <p className="max-w-[900px] text-gray-500 md:text-xl">
                                    Nuestro menú no se detiene en el desayuno. También ofrecemos una amplia variedad de platos para todas las
                                    comidas del día.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                            <div className="flex flex-col space-y-4">
                                <div className="relative aspect-video overflow-hidden rounded-xl">
                                    <Image
                                        alt="Plato especial"
                                        className="object-cover"
                                        height="300"
                                        src="/placeholder.svg"
                                        style={{
                                            aspectRatio: "16/9",
                                            objectFit: "cover",
                                        }}
                                        width="600"
                                    />
                                </div>
                                <h3 className="font-serif text-xl font-bold">Platos Especiales</h3>
                                <p className="text-gray-500">
                                    Descubre nuestras creaciones únicas, preparadas con ingredientes seleccionados y técnicas innovadoras.
                                </p>
                            </div>
                            <div className="flex flex-col space-y-4">
                                <div className="relative aspect-video overflow-hidden rounded-xl">
                                    <Image
                                        alt="Menú del día"
                                        className="object-cover"
                                        height="300"
                                        src="/placeholder.svg"
                                        style={{
                                            aspectRatio: "16/9",
                                            objectFit: "cover",
                                        }}
                                        width="600"
                                    />
                                </div>
                                <h3 className="font-serif text-xl font-bold">Menú del Día</h3>
                                <p className="text-gray-500">
                                    Disfruta de nuestras opciones diarias, siempre frescas y preparadas con los mejores ingredientes.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
                <p className="text-xs text-gray-500">© 2024 iFood. Todos los derechos reservados.</p>
            </footer>
        </div>
    )
}