'use client';
import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    IconButton,
    Box,
    Chip,
    Skeleton, // Importa Skeleton
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';

interface MenuItem {
    id?: string;
    name: string;
    description?: string;
    price: number;
    isOutOfStock: boolean;
    discount?: number;
}

export default function GestorMenu() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        setLoading(true); // Inicia la carga
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) throw new Error('Error al obtener los elementos del menú');
            const data = await response.json();
            setMenuItems(data.data);
        } catch (error) {
            console.error('Error al obtener los elementos del menú:', error);
            setSnackbar({ open: true, message: 'Error al obtener los elementos del menú' });
        } finally {
            setLoading(false); // Finaliza la carga
        }
    };

    const handleOpenDialog = (item: MenuItem | null = null) => {
        setCurrentItem(item);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setCurrentItem(null);
        setOpenDialog(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const discountValue = formData.get('discount') as string; // Obtener el descuento como cadena
        const itemData: MenuItem = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            isOutOfStock: formData.get('isOutOfStock') === 'true',
            discount: discountValue === '' ? undefined : parseFloat(discountValue), // Asegura que 0 sea un valor válido
        };

        try {
            const url = currentItem ? `/api/menu?id=${currentItem.id}` : '/api/menu';
            const method = currentItem ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) throw new Error('Error al guardar el elemento del menú');

            setSnackbar({ open: true, message: `Elemento del menú ${currentItem ? 'actualizado' : 'añadido'} con éxito` });
            handleCloseDialog();
            fetchMenuItems();
        } catch (error) {
            console.error('Error al guardar el elemento del menú:', error);
            setSnackbar({ open: true, message: 'Error al guardar el elemento del menú' });
        }
    };


    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar el elemento del menú');
            setSnackbar({ open: true, message: 'Elemento del menú eliminado con éxito' });
            fetchMenuItems();
        } catch (error) {
            console.error('Error al eliminar el elemento del menú:', error);
            setSnackbar({ open: true, message: 'Error al eliminar el elemento del menú' });
        }
    };

    const calculateDiscountedPrice = (price: number, discount?: number) => {
        if (!discount) return price;
        return price - (price * discount / 100);
    };

    return (
        <Container maxWidth="lg">
            <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ mb: 2 }}
            >
                Añadir Nuevo Plato
            </Button>
            <Grid container spacing={2}>
                {loading ? ( // Muestra el esqueleto de carga mientras se cargan los datos
                    [...Array(6)].map((_, index) => ( // Genera 6 Skeletons
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" height={30} />
                                    <Skeleton variant="text" height={20} sx={{ mt: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Skeleton variant="text" height={30} width="40%" />
                                        <Skeleton variant="rectangular" height={30} width={30} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    menuItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" component="h2">
                                        {item.name}
                                    </Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        {item.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Typography variant="h6" component="p">
                                            {item.discount ? (
                                                <>
                                                    <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '8px' }}>
                                                        {item.price.toFixed(2)}€
                                                    </span>
                                                    {calculateDiscountedPrice(item.price, item.discount).toFixed(2)}€
                                                </>
                                            ) : (
                                                `${item.price.toFixed(2)}€`
                                            )}
                                        </Typography>
                                        {item.discount && (
                                            <Chip label={`- ${item.discount}%`} color="secondary" size="small" />
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Chip
                                            label={item.isOutOfStock ? 'Agotado' : 'Disponible'}
                                            color={item.isOutOfStock ? 'error' : 'success'}
                                        />
                                        <Box>
                                            <IconButton onClick={() => handleOpenDialog(item)} color="primary">
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(item.id!)} color="error">
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{currentItem ? 'Editar Elemento del Menú' : 'Añadir Nuevo Elemento del Menú'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Nombre"
                            type="text"
                            fullWidth
                            required
                            defaultValue={currentItem?.name}
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Descripción"
                            type="text"
                            fullWidth
                            multiline
                            rows={2}
                            defaultValue={currentItem?.description}
                        />
                        <TextField
                            margin="dense"
                            name="price"
                            label="Precio"
                            type="number"
                            fullWidth
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                            defaultValue={currentItem?.price}
                        />
                        <TextField
                            margin="dense"
                            name="discount"
                            label="Descuento (%)"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, max: 100, step: 1 }}
                            defaultValue={currentItem?.discount}
                        />
                        <TextField
                            margin="dense"
                            name="isOutOfStock"
                            label="Agotado"
                            select
                            fullWidth
                            required
                            defaultValue={currentItem?.isOutOfStock ? 'true' : 'false'}
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button type="submit" color="primary">
                            {currentItem ? 'Actualizar' : 'Añadir'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                action={
                    <IconButton
                        size="small"
                        aria-label="cerrar"
                        color="inherit"
                        onClick={() => setSnackbar({ ...snackbar, open: false })}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                }
            />
        </Container>
    );
}
