'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Grid,
  TextField,
  IconButton,
  Divider,
  Snackbar,
  Card,
  CardContent,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Link as MuiLink,
  Stack,
  Chip,
} from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { Add, Remove, Delete } from '@mui/icons-material';
import Image from 'next/image';
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFC03A',
    },
    secondary: {
      main: '#e74c3c',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isOutOfStock: boolean;
  discount?: number;
}

interface OrderItem extends MenuItem {
  quantity: number;
  discountedPrice: number; // Añadido para almacenar el precio con descuento
}

// Styled components
const FooterRoot = styled(Box)(({ theme }) => ({
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: theme.spacing(6, 2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6, 3),
  },
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(3),
  textAlign: 'center',
}));

const ContactLink = styled(MuiLink)(({ theme }) => ({
  color: theme.palette.grey[300],
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  textDecoration: 'none',
  transition: 'color 0.2s',
  '&:hover': {
    color: '#ffffff',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.grey[400],
}));

export default function DeliveryOrderPage() {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotation, setOrderNotation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [schedulePickup, setSchedulePickup] = useState(false);
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const summaryRef = useRef<HTMLDivElement>(null);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Error al obtener los elementos del menú');
      }

      const data = await response.json();
      const items: MenuItem[] = data.data;

      setMenuItems(items);
    } catch (error) {
      console.error('Error al obtener los elementos del menú:', error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    const interval = setInterval(() => {
      fetchMenuItems();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addItemToOrder = (item: MenuItem) => {
    const existingItem = currentOrder.find((orderItem) => orderItem.id === item.id);
    const discountedPrice = item.price * (1 - (item.discount || 0) / 100);

    if (existingItem) {
      setCurrentOrder(currentOrder.map((orderItem) =>
        orderItem.id === item.id
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1, discountedPrice }]);
    }

    setSnackbarMessage(`Se ha añadido ${item.name} al pedido.`);
    setSnackbarOpen(true);
    handleScrollToSummary();
  };

  const handleScrollToSummary = () => {
    if (summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: 'smooth' });
      setSnackbarOpen(false);
    }
  };

  const removeItemFromOrder = (itemId: string) => {
    const existingItem = currentOrder.find((orderItem) => orderItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCurrentOrder(currentOrder.map((orderItem) =>
        orderItem.id === itemId
          ? { ...orderItem, quantity: orderItem.quantity - 1 }
          : orderItem
      ));
    } else {
      setCurrentOrder(currentOrder.filter((orderItem) => orderItem.id !== itemId));
    }
  };

  const deleteItemFromOrder = (itemId: string) => {
    setCurrentOrder(currentOrder.filter((orderItem) => orderItem.id !== itemId));
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items
      .reduce((total, item) => total + item.discountedPrice * item.quantity, 0)
      .toFixed(2);
  };

  const handleSubmitOrder = async () => {
    if (currentOrder.length === 0) {
      setSnackbarMessage('Por favor, añade items al pedido.');
      setSnackbarOpen(true);
      return;
    }

    const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
    if (!customerName || !nameRegex.test(customerName)) {
      setSnackbarMessage('Por favor, introduce un nombre válido (sin números).');
      setSnackbarOpen(true);
      return;
    }

    const phoneRegex = /^[0-9]{9,15}$/;
    if (!customerPhone || !phoneRegex.test(customerPhone)) {
      setSnackbarMessage('Por favor, introduce un número de teléfono válido (9 a 15 dígitos).');
      setSnackbarOpen(true);
      return;
    }

    if (!customerName || !customerPhone || !paymentMethod) {
      setSnackbarMessage('Por favor, completa todos los campos requeridos.');
      setSnackbarOpen(true);
      return;
    }

    const newOrder = {
      id: `ORD-${Date.now()}`,
      items: currentOrder,
      total: calculateTotal(currentOrder),
      status: 'pendiente',
      timestamp: new Date().toISOString(),
      notation: orderNotation,
      customerName,
      customerPhone,
      paymentMethod,
      isDelivery: true,
      pickupDateTime: schedulePickup ? pickupDateTime : undefined,
    };

    if (paymentMethod === 'tarjeta') {
      const itemsSummary = currentOrder.map(item => {
        const finalPrice = item.discountedPrice;
        return `${item.id} (${item.name}): ${item.quantity} x ${finalPrice.toFixed(2)} €`;
      }).join(', ');

      const total = newOrder.total;
      router.push(`/tarjeta?orderId=${newOrder.id}&total=${total}&customerName=${encodeURIComponent(customerName)}&customerPhone=${encodeURIComponent(customerPhone)}&notation=${encodeURIComponent(orderNotation)}&isDelivery=${encodeURIComponent(String(newOrder.isDelivery))}&pickupDateTime=${encodeURIComponent(pickupDateTime || '')}&items=${encodeURIComponent(itemsSummary)}`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        throw new Error('Error creando el pedido');
      }

      const createdOrder = await response.json();
      router.push(`/efectivo?orderId=${createdOrder.data.id}`);
    } catch (error) {
      console.error('Error creando el pedido:', error);
      setSnackbarMessage('Error al crear el pedido');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };



  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Image
              src="/logo.png"
              alt="Logo de la empresa - Nombre de la empresa"
              width={250} // Ancho deseado
              height={250} // Alto deseado
              quality={75} // Ajustar calidad (de 1 a 100)
            />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: 'primary.main' }}
          >
            ¡HAZ YA TU PEDIDO!
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Menú
              </Typography>
              <Grid container spacing={2}>
                {menuItems.map((item) => (
                  <Grid item xs={12} sm={6} key={item.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="h2">
                            {item.name}
                          </Typography>
                          {item.discount && (
                            <Chip
                              label={`- ${item.discount}%`}
                              color="secondary"
                              size="small"
                            />
                          )}
                        </Box>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Box>
                            <Typography variant="h6" component="span">
                              {(item.price * (1 - (item.discount ? item.discount / 100 : 0))).toFixed(2)}€
                            </Typography>
                            {item.discount && (
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{ textDecoration: 'line-through', ml: 1 }}
                                color="text.secondary"
                              >
                                {item.price.toFixed(2)}€
                              </Typography>
                            )}
                          </Box>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Add />}
                            onClick={() => addItemToOrder(item)}
                            disabled={item.isOutOfStock}
                          >
                            {item.isOutOfStock ? "AGOTADO" : "AÑADIR"}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5} ref={summaryRef}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Resumen de Pedido
              </Typography>
              <List>
                {currentOrder.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={`${item.name} (${item.quantity})`}
                      secondary={`${(item.price * (1 - (item.discount ? item.discount / 100 : 0)) * item.quantity).toFixed(2)} €`}
                    />
                    <IconButton edge="end" aria-label="add" onClick={() => addItemToOrder(item)}>
                      <Add />
                    </IconButton>
                    <IconButton onClick={() => removeItemFromOrder(item.id)}>
                      <Remove />
                    </IconButton>
                    <IconButton onClick={() => deleteItemFromOrder(item.id)}>
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" align="right">
                Total: {calculateTotal(currentOrder)} €
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box component="form" sx={{ mt: 3 }}>
                <TextField
                  label="Nombre del Cliente"
                  variant="outlined"
                  fullWidth
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Teléfono"
                  variant="outlined"
                  fullWidth
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Observaciones"
                  variant="outlined"
                  fullWidth
                  value={orderNotation}
                  onChange={(e) => setOrderNotation(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  row
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel value="efectivo" control={<Radio />} label="Pago en caja" />
                  <FormControlLabel value="tarjeta" control={<Radio />} label="Pago online" />
                </RadioGroup>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={schedulePickup} onChange={(e) => setSchedulePickup(e.target.checked)} />}
                    label="Programar recogida"
                  />
                  {schedulePickup && (
                    <TextField
                      label="Fecha y hora"
                      variant="outlined"
                      type="datetime-local"
                      fullWidth
                      value={pickupDateTime}
                      onChange={(e) => {
                        const selectedDate = new Date(e.target.value);

                        // Verifica si el día es entre martes (2) y domingo (0)
                        const dayOfWeek = selectedDate.getDay();
                        if (dayOfWeek === 1) { // Lunes
                          alert("El horario de recogida es de martes a domingo.");
                          return;
                        }

                        // Verifica si la hora está dentro del rango de 11:00 am y 4:00 pm
                        const hours = selectedDate.getHours();
                        if (hours < 11 || hours >= 16) {
                          alert("El horario de recogida es solo entre 11:00 am y 4:00 pm.");
                          return;
                        }

                        // Establece la fecha y hora si cumple con las restricciones
                        setPickupDateTime(e.target.value);
                      }}
                      sx={{ ml: 2 }}
                      inputProps={{
                        min: new Date().toISOString().slice(0, 16) // Fecha y hora mínima
                      }}
                    />
                  )}


                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitOrder}
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Realizar Pedido'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
        <FooterRoot>
          <Container maxWidth="lg">
            <Stack spacing={3} alignItems="center">
              <FooterTitle variant="h4">
                CASA LOLY-COMIDAS PARA LLEVAR
              </FooterTitle>
              <Stack spacing={2} alignItems="center">
                <ContactLink
                  href="https://maps.google.com/?q=Carrer de Pere de València, 46022 València, Valencia, España"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconWrapper>
                    <LocationOnIcon />
                  </IconWrapper>
                  <Typography variant="body1">
                    Carrer de Pere de València, 46022 València, Valencia, España
                  </Typography>
                </ContactLink>
                <ContactLink href="tel:962023339">
                  <IconWrapper>
                    <PhoneIcon />
                  </IconWrapper>
                  <Typography variant="body1">
                    962023339
                  </Typography>
                </ContactLink>
              </Stack>
            </Stack>
          </Container>
        </FooterRoot>
      </Container>
    </ThemeProvider>
  );
}
