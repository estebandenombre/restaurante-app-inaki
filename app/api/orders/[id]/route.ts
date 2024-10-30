import connect from '@/lib/db';
import PedidoModel from '@/lib/modals/pedido';
import { NextResponse } from 'next/server';

export const GET = async (request: Request, { params }: { params: { id: string } }) => {
    try {
        await connect(); // Conectar a la base de datos

        const id = params.id; // Obtener el ID de la ruta dinámica

        if (!id) {
            return NextResponse.json({ error: "Se requiere un ID para obtener el pedido" }, { status: 400 });
        }

        // Buscar el pedido por ID
        const pedido = await PedidoModel.findOne({ id: id }).exec();

        if (!pedido) {
            return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
        }

        // Responder con el pedido encontrado
        return NextResponse.json({
            message: "Pedido recuperado con éxito",
            data: pedido,
        }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error recuperando pedido:", error.message);
            return NextResponse.json({ error: "Error recuperando pedido: " + error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error desconocido" }, { status: 500 });
    }
};