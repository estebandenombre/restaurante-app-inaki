import connect from '@/lib/db'; // Conexión a la base de datos
import MenuItemModel from '@/lib/modals/MenuItem'; // Modelo de MenuItem
import { NextResponse } from 'next/server';

// Define la estructura de los datos de un elemento del menú
interface MenuItem {
    id?: string; // El ID puede no estar presente en la creación
    name: string;
    description?: string;
    price: number;
    isOutOfStock: boolean;
    discount?: number; // Porcentaje de descuento opcional
}

// GET request: Obtener todos los elementos del menú o filtrados por algún criterio
export const GET = async (request: Request) => {
    try {
        await connect(); // Conectar a la base de datos

        const { searchParams } = new URL(request.url);
        const filters: Record<string, string> = Object.fromEntries(searchParams.entries());

        // Recuperar los elementos del menú de la base de datos según los filtros
        const menuItems = await MenuItemModel.find(filters).exec();

        return NextResponse.json({
            message: "Elementos del menú recuperados con éxito",
            data: menuItems,
        }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error recuperando elementos del menú:", error.message);
            return NextResponse.json({ error: "Error recuperando elementos del menú: " + error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error desconocido" }, { status: 500 });
    }
};

// POST request: Crear un nuevo elemento del menú
export const POST = async (request: Request) => {
    try {
        await connect(); // Conectar a la base de datos
        const data: MenuItem = await request.json();

        // Validar los campos requeridos
        const { name, price, isOutOfStock } = data;

        if (!name || price == null || isOutOfStock == null) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        const newMenuItem = new MenuItemModel({
            id: data.id,
            name,
            description: data.description,
            price,
            isOutOfStock,
            discount: data.discount ?? 0, // Valor por defecto en 0 si no se proporciona
        });

        await newMenuItem.save();

        return NextResponse.json({
            message: "Elemento del menú creado con éxito",
            data: newMenuItem,
        }, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error guardando el elemento del menú:", error.message);
            return NextResponse.json({ error: "Error guardando el elemento del menú: " + error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error desconocido" }, { status: 500 });
    }
};

export const PUT = async (request: Request) => {
    try {
        await connect(); // Conectar a la base de datos

        // Extraer ID desde la URL o desde el cuerpo JSON
        const { searchParams } = new URL(request.url);
        const idFromUrl = searchParams.get("id");
        const updateData: Partial<MenuItem> = await request.json();
        const id = idFromUrl || updateData.id;

        // Verificar que el ID está presente
        if (!id) {
            return NextResponse.json({ error: "Se requiere un ID para actualizar el elemento del menú" }, { status: 400 });
        }

        // Construir los campos a actualizar
        const updateFields: Partial<MenuItem> = {};
        if (updateData.name) updateFields.name = updateData.name;
        if (updateData.description !== undefined) updateFields.description = updateData.description;
        if (updateData.price !== undefined) updateFields.price = updateData.price;
        if (updateData.isOutOfStock !== undefined) updateFields.isOutOfStock = updateData.isOutOfStock;
        if (updateData.discount !== undefined) updateFields.discount = updateData.discount;

        // Realizar la actualización con el ID recuperado
        const updatedMenuItem = await MenuItemModel.findOneAndUpdate(
            { id: id }, // Filtro usando el ID
            updateFields,
            { new: true }
        );

        // Validar que el elemento fue encontrado
        if (!updatedMenuItem) {
            return NextResponse.json({ message: "Elemento del menú no encontrado para actualizar" }, { status: 404 });
        }

        return NextResponse.json({ message: "Elemento del menú actualizado con éxito", data: updatedMenuItem }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error actualizando el elemento del menú:", error.message);
            return NextResponse.json({ error: "Error actualizando el elemento del menú: " + error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error desconocido" }, { status: 500 });
    }
};

// DELETE request: Eliminar un elemento del menú existente
export const DELETE = async (request: Request) => {
    try {
        await connect(); // Conectar a la base de datos

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Se requiere un ID para eliminar el elemento del menú" }, { status: 400 });
        }

        const deletedMenuItem = await MenuItemModel.findOneAndDelete({ id: id });

        if (!deletedMenuItem) {
            return NextResponse.json({ message: "Elemento del menú no encontrado para eliminar" }, { status: 404 });
        }

        return NextResponse.json({ message: "Elemento del menú eliminado con éxito", data: deletedMenuItem }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error eliminando el elemento del menú:", error.message);
            return NextResponse.json({ error: "Error eliminando el elemento del menú: " + error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error desconocido" }, { status: 500 });
    }
};
