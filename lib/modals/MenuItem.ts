import mongoose from 'mongoose';

// Interfaz para los elementos del menú
interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    isOutOfStock: boolean;
    discount?: number; // Porcentaje de descuento opcional
}

// Esquema de Mongoose para los elementos del menú
const menuItemSchema = new mongoose.Schema<MenuItem>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false }, // Campo opcional para descripción
    price: { type: Number, required: true },
    isOutOfStock: { type: Boolean, required: true, default: false }, // Indica si está agotado
    discount: { type: Number, required: false, default: 0 }, // Descuento opcional
});

// Modelo de Mongoose
const MenuItemModel = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

export default MenuItemModel;
