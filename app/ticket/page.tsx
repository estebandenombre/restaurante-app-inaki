'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    CircularProgress,
    Typography,
    Box,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Container,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { jsPDF } from 'jspdf';

const styles = {
    container: {
        padding: '16px',
        color: '#FFC03A',
    },
    name: {
        marginBottom: '8px',
        color: 'black', // Color del nombre del restaurante
    },
    addressLink: {
        textDecoration: 'none', // Quitar el subrayado del enlace
        color: '#FFC03A', // Color del enlace
    },
    address: {
        color: '#555', // Color de la dirección
    },
    phone: {
        color: '#555', // Color del teléfono
    },
    phoneText: {
        color: '#555', // Color del teléfono
    },
};

// Definición de la paleta de colores
const theme = createTheme({
    palette: {
        primary: {
            main: '#FFC03A',
        },
        secondary: {
            main: '#e74c3c',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#2c3e50',
            secondary: '#7f8c8d',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

interface PedidoItem {
    id: string; // ID único para cada item
    name: string;
    quantity: number;
    price: number; // Precio unitario
}

interface Pedido {
    id: string;
    items: PedidoItem[];
    total: string;
    status: 'pendiente' | 'preparando' | 'listo';
    timestamp: string;
    notation?: string; // Campo de notas
    customerName?: string; // Campo para el nombre del cliente
    customerPhone?: string; // Campo para el teléfono del cliente
    pickupDateTime?: string; // Nuevo campo para la fecha y hora de recogida (opcional)
    isDelivery?: boolean; // Campo para indicar si es entrega a domicilio
    paid: boolean; // Campo para indicar si el pedido ha sido pagado
}

// Información ficticia del restaurante
const restaurantInfo = {
    name: 'LA CUINA- COMIDAS PARA LLEVAR',
    address: 'Calle de Pérez Bayer, 11, Ciutat Vella, 46002 Valencia, España',
    phone: '++34 963516327',
};

const TicketPage: React.FC = () => {
    const searchParams = useSearchParams();

    const [orderId, setOrderId] = useState<string | null>(null);
    const [total, setTotal] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState<string | null>(null);
    const [customerPhone, setCustomerPhone] = useState<string | null>(null);
    const [notation, setNotation] = useState<string | null>(null);
    const [isDelivery, setIsDelivery] = useState<boolean>(false);
    const [pickupDateTime, setPickupDateTime] = useState<string | null>(null);
    const [items, setItems] = useState<PedidoItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasPostedOrder, setHasPostedOrder] = useState(false);

    useEffect(() => {
        const id = searchParams.get('orderId');
        const totalParam = searchParams.get('total');
        const name = searchParams.get('customerName');
        const phone = searchParams.get('customerPhone');
        const note = searchParams.get('notation');
        const delivery = searchParams.get('isDelivery');
        const pickupDate = searchParams.get('pickupDateTime');
        const itemsParam = searchParams.get('items');

        if (id) setOrderId(id);
        if (totalParam) setTotal(totalParam);
        if (name) setCustomerName(name);
        if (phone) setCustomerPhone(phone);
        if (note) setNotation(note);
        if (delivery) setIsDelivery(delivery === 'true'); // Convertir a booleano
        if (pickupDate) setPickupDateTime(pickupDate);

        if (itemsParam) {
            try {
                const parsedItems: PedidoItem[] = itemsParam.split(',').map((item) => {
                    const match = item.match(/(\w+)\s\((.*?)\):\s*(\d+)\s*x\s*([\d,.]+)\s*€/);
                    if (match) {
                        const id = match[1].trim();
                        const name = match[2].trim();
                        const quantity = parseInt(match[3], 10);
                        const price = parseFloat(match[4].replace(',', '.'));

                        return {
                            id,
                            name,
                            quantity,
                            price,
                        };
                    } else {
                        throw new Error(`El formato del item "${item}" es inválido.`);
                    }
                });
                setItems(parsedItems);
            } catch (error) {
                console.error('Error al analizar itemsParam:', error);

            }
        }
    }, [searchParams]);

    useEffect(() => {
        const handlePostOrder = async () => {
            if (!orderId || !items.length) {
                setLoading(false);
                return;
            }

            if (hasPostedOrder) {
                setLoading(false);
                return;
            }

            try {
                // Verificar si la orden ya existe
                const response = await fetch(`/api/orders/${orderId}`);
                if (response.ok) {
                    const existingOrder = await response.json();
                    if (existingOrder.data) {
                        console.error('La orden ya existe:', existingOrder.data);
                        setLoading(false);
                        return; // Salir si la orden ya existe
                    }
                }

                const orderData: Pedido = {
                    id: orderId!,
                    items,
                    total: total || "0",
                    status: 'pendiente',
                    timestamp: new Date().toISOString(),
                    notation: notation || undefined,
                    customerName: customerName || undefined,
                    customerPhone: customerPhone || undefined,
                    pickupDateTime: pickupDateTime || undefined,
                    isDelivery,
                    paid: true
                };

                const postResponse = await fetch("/api/orders", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderData),
                });

                if (!postResponse.ok) {
                    throw new Error("Error al guardar la orden.");
                }

                const result = await postResponse.json();
                console.log("Orden guardada:", result);
                setHasPostedOrder(true);

            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error creando la orden:', error.message);
                } else {
                    console.error('Error creando la orden:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        handlePostOrder();
    }, [hasPostedOrder, orderId, total, customerName, customerPhone, notation, isDelivery, pickupDateTime, items]);

    const handleDownloadReceipt = async () => {
        if (!orderId) return;

        const doc = new jsPDF();
        const margin = 20;
        const yStart = margin + 10;

        // Cargar el logo y agregarlo al PDF
        const logoImg = await loadImage('/logo.png') as HTMLImageElement; // Ajusta la ruta de la imagen según sea necesario
        doc.addImage(logoImg, 'PNG', margin, yStart, 40, 40); // Ajustar la posición y tamaño del logo

        // Agregar la información del restaurante al recibo
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor('#FFC03A');
        doc.text(restaurantInfo.name, margin, yStart + 50);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#555');
        doc.text(restaurantInfo.address, margin, yStart + 60);
        doc.text(`Teléfono: ${restaurantInfo.phone}`, margin, yStart + 70);

        // Agregar detalles del pedido
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor('black');
        doc.text('Recibo de Pedido', margin, yStart + 90);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#2c3e50');
        doc.text(`ID de Pedido: ${orderId}`, margin, yStart + 100);
        doc.text(`Nombre: ${customerName}`, margin, yStart + 110);
        doc.text(`Teléfono: ${customerPhone}`, margin, yStart + 120);

        // Agregar línea divisoria
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, yStart + 130, 190 - margin, yStart + 130);

        // Agregar lista de artículos
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor('black');
        doc.text('Artículos:', margin, yStart + 140);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor('#2c3e50');

        items.forEach((item, index) => {
            const itemPosition = yStart + 150 + index * 10; // Ajustar posición
            doc.text(
                `${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)}€`,
                margin,
                itemPosition
            );
        });

        const finalYPosition = yStart + 150 + items.length * 10 + 10;
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor('black');
        doc.text(`Total: ${total}€`, margin, finalYPosition);

        if (notation) {
            doc.setFont('Helvetica', 'normal');
            doc.setTextColor('#555');
            doc.text(`Notas: ${notation}`, margin, finalYPosition + 10);
        }

        doc.setFontSize(10);
        doc.setTextColor('#555');
        doc.text('Gracias por su compra. ¡Esperamos verle de nuevo!', margin, finalYPosition + 30);

        // Descargar el PDF
        doc.save(`recibo_${orderId}.pdf`);
    };

    const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Cargando...
                </Typography>
            </Box>
        );
    }

    if (!orderId) {
        return <Typography variant="h6" color="error">Error al cargar el pedido.</Typography>;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '150px' }} />
                    </Box>

                    <div style={styles.container}>
                        <h5 style={styles.name}>{restaurantInfo.name}</h5>
                        <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(restaurantInfo.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.addressLink}
                        >
                            <p style={styles.address}>{restaurantInfo.address}</p>
                        </a>
                        <a href={`tel:${restaurantInfo.phone}`} style={styles.phone}>
                            <p style={styles.phoneText}>Teléfono: {restaurantInfo.phone}</p>
                        </a>
                    </div>

                    <Box
                        sx={{
                            mb: 3,
                            p: 3,
                            border: '1px solid rgba(255, 192, 58, 0.1)', // Borde en tono amarillo claro
                            borderRadius: 2,
                            backgroundColor: 'black', // Fondo negro
                            color: '#FFC03A', // Color de texto amarillo
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Sombra negra sutil
                        }}
                    >

                        <Typography variant="h5" gutterBottom>
                            ID de Pedido: {orderId}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Por favor, presente este ID en la caja para recojer el pedido.
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Detalles del Pedido:
                    </Typography>
                    <List sx={{ borderRadius: 2 }}>
                        {items.map((item) => (
                            <ListItem key={item.id} disablePadding>
                                <ListItemText
                                    primary={`${item.name} x${item.quantity}`}
                                    secondary={`${(item.price * item.quantity).toFixed(2)}€`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
                        Total: {total}€
                    </Typography>
                    {notation && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Notas: {notation}
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Download />}
                        onClick={handleDownloadReceipt}
                        sx={{ mt: 3 }}
                    >
                        Descargar Recibo
                    </Button>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

// Componente principal que envuelve TicketPage
const App: React.FC = () => {
    return (
        <Suspense fallback={<CircularProgress />}>
            <TicketPage />
        </Suspense>
    );
};

export default App;
