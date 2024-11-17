'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Drawer,
} from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { Add, Remove, Delete } from '@mui/icons-material';

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
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 80,
          width: '100%',
          maxWidth: '1200px',
          justifyContent: { xs: 'center', lg: 'flex-start' }, // Centrado en móvil, alineado a la izquierda en escritorio
          px: { xs: 1, md: 2 }, // Ajuste de relleno horizontal
          mx: 'auto',
        }}
      >
        {/* Logo: centrado en móvil, a la izquierda en pantallas grandes */}
        <Typography
          component={Link}
          href="#home"
          sx={{
            fontSize: '24px', // Tamaño ajustado a 24px
            fontFamily: 'ui-serif, Georgia, Cambria, Times New Roman, Times, serif', // Mantener la fuente
            fontWeight: 'bold',
            color: 'inherit',
            textDecoration: 'none',
            position: { xs: 'absolute', lg: 'relative' }, // Centrado absoluto en móvil
            left: { xs: '50%', lg: '0' }, // Centrado horizontal en móvil
            transform: { xs: 'translateX(-50%)', lg: 'none' }, // Ajuste para centrar en móvil
          }}
        >
          CASA LOLY
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: 'primary.main',
              fontFamily: 'ui-serif, Georgia, Cambria, Times New Roman, Times, serif', // Aplicar la tipología
              fontWeight: 'bold', // Asegurar el grosor
            }}
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
                          {/* Solo mostrar el Chip de descuento si el descuento es mayor a 0 */}
                          {item.discount !== undefined && item.discount > 0 && (
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
                              {/* Mostrar el precio con descuento, si hay descuento aplicable */}
                              {item.discount !== undefined && item.discount > 0
                                ? (item.price * (1 - item.discount / 100)).toFixed(2) + "€"
                                : item.price.toFixed(2) + "€"} {/* Mostrar solo el precio normal si no hay descuento */}
                            </Typography>
                            {/* Mostrar el precio original si hay descuento */}
                            {item.discount !== undefined && item.discount > 0 && (
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
                  label="Nombre"
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

      </Container>
      <FooterRoot sx={{ backgroundColor: 'gray.900', color: 'white', py: 6, width: '100%' }}>
        <Container maxWidth="lg">
          {/* Encabezado principal */}
          <Stack spacing={8} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
            {/* Logo e Introducción */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontFamily: 'serif', fontWeight: 'bold', color: 'green.400', mb: 2 }}
              >
                Casa Loly - Comidas para Llevar
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'gray.400', maxWidth: '400px', mx: { xs: 'auto', md: 0 } }}
              >
                Disfruta de comida casera hecha con ingredientes frescos y saludables. Nuestra misión es
                llevar sabor y calidad a tu mesa.
              </Typography>
            </Box>

            {/* Información de Contacto */}
            <Box>
              <Typography
                variant="h5"
                component="h3"
                sx={{ fontFamily: 'serif', fontWeight: 'bold', color: 'green.400', mb: 3 }}
              >
                Contacto
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocationOnIcon style={{ color: 'rgb(34, 197, 94)' }} />
                  <Typography variant="body1" sx={{ color: 'gray.400' }}>
                    Carrer de Pere de València, 3, 46022 València, Valencia, España
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PhoneIcon style={{ color: 'rgb(34, 197, 94)' }} />
                  <MuiLink href="tel:962023339" sx={{ color: 'gray.400', '&:hover': { color: 'white' } }}>
                    962 023 339
                  </MuiLink>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">

                  <Typography variant="body1" sx={{ color: 'gray.400' }}>
                    Martes a Domingo, 11:00 a.m. - 4:00 p.m.
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Botón de Hacer Pedido */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h5"
                component="h3"
                sx={{ fontFamily: 'serif', fontWeight: 'bold', color: 'green.400', mb: 2 }}
              >
                ¿Listo para ordenar?
              </Typography>
              <Typography variant="body1" sx={{ color: 'gray.400', mb: 3 }}>
                Haz tu pedido ahora y disfruta de nuestros platos caseros en la comodidad de tu hogar.
              </Typography>
              <Button
                href="#order"
                sx={{
                  display: 'inline-block',
                  backgroundColor: 'green.500',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 1.5,
                  px: 4,
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'green.600' },
                }}
              >
                Hacer Pedido
              </Button>
            </Box>
          </Stack>

          {/* Mapa de Ubicación */}
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h5"
              component="h3"
              sx={{ fontFamily: 'serif', fontWeight: 'bold', color: 'green.400', textAlign: 'center', mb: 3 }}
            >
              Nuestra Ubicación
            </Typography>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3159.6498443257177!2d-0.35580248467611764!3d39.47411477948668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd604f4fdff1e1fd%3A0x8282e2b4afc95b7!2sCarrer%20de%20Pere%20de%20Val%C3%A8ncia%2C%2046022%20Val%C3%A8ncia%2C%20Espa%C3%B1a!5e0!3m2!1sen!2sus!4v1692903826541!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </Box>
          </Box>

          {/* Barra Inferior */}
          <Box
            sx={{
              mt: 6,
              borderTop: '1px solid',
              borderColor: 'gray.700',
              pt: 3,
              textAlign: 'center',
              color: 'gray.500',
              fontSize: '0.875rem',
            }}
          >
            © 2024 Casa Loly. Todos los derechos reservados.
          </Box>
        </Container>
      </FooterRoot>

    </ThemeProvider>
  );
}
