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
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Link as MuiLink,
  Stack,
  Chip,
  Badge,
  Modal,
} from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { Add, Remove, Delete } from '@mui/icons-material';

import LocationOnIcon from '@mui/icons-material/LocationOn';


import DestacadosSection from '@/components/Destacados';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';



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
  image: string;
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
  const [cartAnimating, setCartAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    // Trigger animation
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 500); // Stop animation after 500ms

    setSnackbarMessage(`Se ha añadido ${item.name} al pedido.`);
    setSnackbarOpen(true);
    //handleScrollToSummary();
  };

  const handleScrollToSummary = () => {
    if (summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: 'smooth' });
      setSnackbarOpen(false);
    }
  };

  const handleScrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
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
          justifyContent: 'space-between',
          height: 80,
          px: { xs: 2, md: 4 },
          backgroundColor: 'white',
          color: 'black',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Title */}
        <Typography
          component={Link}
          href="#home"
          sx={{
            fontSize: { xs: '16px', sm: '20px', md: '28px' },
            fontWeight: 'bold',
            color: 'black',
            textDecoration: 'none',
          }}
        >
          CASA LOLY
        </Typography>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Contact Button */}
          <Box>
            {/* Contact Button */}
            <Button
              variant="outlined"
              color="primary"
              onClick={handleOpenModal}
              sx={{
                textTransform: 'none',
                borderColor: 'black',
                color: 'black',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: 'gray.700',
                  backgroundColor: 'gray.100',
                },
              }}
            >
              Contacto
            </Button>

            {/* Contact Information */}
            <Modal
              open={isModalOpen}
              onClose={handleCloseModal}
              aria-labelledby="contact-info-title"
              aria-describedby="contact-info-description"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { xs: '90%', sm: '400px' },
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 24,
                  p: 4,
                }}
              >
                {/* Close Button */}
                <IconButton
                  onClick={handleCloseModal}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <CloseIcon />
                </IconButton>

                {/* Contact Information */}
                <Typography
                  id="contact-info-title"
                  variant="h6"
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  Información de Contacto
                </Typography>

                <Stack spacing={2}>
                  {/* Phone */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PhoneIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="body1">
                      Teléfono:{' '}
                      <MuiLink href="tel:+34962023339" underline="hover" color="inherit">
                        +34 962 023 339
                      </MuiLink>
                    </Typography>
                  </Stack>

                  {/* WhatsApp */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <WhatsAppIcon sx={{ color: 'green' }} />
                    <Typography variant="body1">
                      WhatsApp:{' '}
                      <MuiLink
                        href="https://wa.me/34631897702"
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        color="inherit"
                      >
                        Chatear en WhatsApp
                      </MuiLink>
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Modal>
          </Box>

          {/* Shopping Cart */}
          <IconButton
            onClick={handleScrollToSummary}
            sx={{
              position: 'relative',
              '& .cart-icon': {
                animation: cartAnimating ? 'bounce 0.5s' : 'none',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.2)' },
                },
              },
            }}
          >
            <Badge
              badgeContent={currentOrder.length}
              color="primary"
              overlap="circular"
            >
              <ShoppingCartIcon
                className="cart-icon"
                sx={{ color: 'black', fontSize: '28px' }}
              />
            </Badge>
          </IconButton>
        </Box>
      </Box>




      <DestacadosSection />


      <Container maxWidth="lg" id="menu" sx={{ mt: 4, mb: 4 }}>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF', // Fondo blanco
            borderRadius: '16px', // Bordes redondeados
            padding: '16px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Sombra sutil
            overflow: 'hidden',
            maxWidth: '600px', // Limita el ancho de la card
            margin: '32px auto', // Separación superior e inferior, centrado horizontal
            position: 'relative',
            paddingRight: '120px', // Espacio para la imagen dentro del diseño
          }}
        >
          {/* Imagen de fondo recortada */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '16px', // Posiciona la imagen hacia la derecha dentro de la card
              transform: 'translateY(-50%)', // Centra verticalmente
              width: '100px', // Tamaño de la imagen
              height: '100px',
              borderRadius: '50%', // Imagen redonda
              overflow: 'hidden',
            }}
          >
            <img
              src="/paella.jpg" // Cambiar por la imagen relevante
              alt="Promoción jueves"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>

          {/* Contenido textual */}
          <Box sx={{ flex: 1, zIndex: 1, pr: 2 }}>
            <Typography
              sx={{
                fontSize: '22px',
                fontWeight: 'bold',
                mb: 1,
                lineHeight: 1.2,
                color: '#FFC03A', // Amarillo para destacar
              }}
            >
              ¡Promoción Especial!
            </Typography>
            <Typography
              sx={{
                fontSize: '16px',
                mb: 2,
                color: '#4A4A4A', // Gris oscuro para el texto
              }}
            >
              Todos los jueves, todas las comidas están a solo{' '}
              <span style={{ fontWeight: 'bold', color: '#FFC03A' }}>3€</span>.
            </Typography>
            <Button
              sx={{
                backgroundColor: '#FFC03A', // Botón amarillo vibrante
                color: '#FFFFFF', // Texto blanco
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#E0A82E', // Amarillo ligeramente más oscuro al hacer hover
                },
              }}
            >
              Haz tu Pedido
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Menú
              </Typography>
              <Grid container spacing={3}>
                {menuItems.map((item) => (
                  <Grid item xs={12} key={item.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 3,
                        backgroundColor: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        borderBottom: '1px solid #E0E0E0', // Borde inferior para separar los platos
                        '&:last-of-type': {
                          borderBottom: 'none', // Eliminar el borde inferior del último elemento
                        },
                      }}
                    >
                      {/* Imagen redonda */}
                      <Box
                        sx={{
                          width: 160, // Tamaño más grande
                          height: 160, // Tamaño más grande
                          borderRadius: '50%',
                          overflow: 'hidden',
                          mb: 2,
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>

                      {/* Nombre del plato */}
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          mb: 1,
                          color: '#333',
                        }}
                      >
                        {item.name}
                      </Typography>

                      {/* Descripción del plato */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', mb: 2 }}
                      >
                        {item.description || 'Delicioso plato preparado con ingredientes frescos.'}
                      </Typography>

                      {/* Precio y botón */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            component="span"
                            sx={{ fontWeight: 'bold', color: '#000' }}
                          >
                            {item.discount !== undefined && item.discount > 0
                              ? (item.price * (1 - item.discount / 100)).toFixed(2) + '€'
                              : item.price.toFixed(2) + '€'}
                          </Typography>
                          {item.discount !== undefined && item.discount > 0 && (
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{
                                textDecoration: 'line-through',
                                ml: 1,
                                color: 'text.secondary',
                              }}
                            >
                              {item.price.toFixed(2)}€
                            </Typography>
                          )}
                        </Box>

                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => addItemToOrder(item)}
                          sx={{
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            minWidth: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          disabled={item.isOutOfStock}
                        >
                          <Add fontSize="small" />
                        </Button>
                      </Box>

                      {/* Chip de descuento */}
                      {item.discount !== undefined && item.discount > 0 && (
                        <Chip
                          label={`- ${item.discount}%`}
                          color="secondary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                          }}
                        />
                      )}
                    </Box>
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
                    {/* Contenedor para separar los botones */}
                    <Box
                      sx={{
                        display: 'flex', // Alinear botones horizontalmente
                        gap: 1.5, // Espacio entre botones (puedes ajustar este valor)
                        alignItems: 'center',
                      }}
                    >
                      <IconButton edge="end" aria-label="add" onClick={() => addItemToOrder(item)}>
                        <Add />
                      </IconButton>
                      <IconButton onClick={() => removeItemFromOrder(item.id)}>
                        <Remove />
                      </IconButton>
                      <IconButton onClick={() => deleteItemFromOrder(item.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
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
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleScrollToMenu}
                    fullWidth
                  >
                    Seguir Pidiendo
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitOrder}
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : "Realizar Pedido"}
                  </Button>
                </Box>
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
          {/* Main Footer Section */}
          <Stack
            spacing={{ xs: 6, md: 12 }}
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 6 }}
          >
            {/* Logo and Introduction */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: '400px' }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontFamily: 'serif',
                  fontWeight: 'bold',
                  color: '#FFC03A', // Bright yellow for highlight
                  mb: 2,
                }}
              >
                Casa Loly - Comidas para Llevar
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'gray.400',
                  lineHeight: 1.6,
                }}
              >
                Disfruta de comida casera hecha con ingredientes frescos y saludables.
                Nuestra misión es llevar sabor y calidad a tu mesa.
              </Typography>
            </Box>

            {/* Contact Information */}
            <Box>
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontFamily: 'serif',
                  fontWeight: 'bold',
                  color: '#FFC03A',
                  mb: 3,
                }}
              >
                Contacto
              </Typography>
              <Stack spacing={2} sx={{ color: 'gray.400' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocationOnIcon sx={{ color: '#FFC03A' }} />
                  <Typography variant="body2">
                    Carrer de Pere de València, 3, 46022 València, Valencia, España
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PhoneIcon sx={{ color: '#FFC03A' }} />
                  <MuiLink
                    href="tel:962023339"
                    sx={{
                      color: 'gray.400',
                      textDecoration: 'none',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    962 023 339
                  </MuiLink>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2">
                    Horarios: Martes a Domingo, 11:00 a.m. - 4:00 p.m.
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Quick Action: Make an Order */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontFamily: 'serif',
                  fontWeight: 'bold',
                  color: '#FFC03A',
                  mb: 2,
                }}
              >
                ¿Listo para ordenar?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'gray.400',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Haz tu pedido ahora y disfruta de nuestros platos caseros en la
                comodidad de tu hogar.
              </Typography>
              <Button
                onClick={() => {
                  const menuSection = document.getElementById('menu');
                  if (menuSection) {
                    menuSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                sx={{
                  display: 'inline-block',
                  backgroundColor: '#FFC03A', // Original yellow color
                  color: 'white', // White text for contrast
                  fontWeight: 'bold',
                  py: 1.5,
                  px: 4,
                  borderRadius: 1,
                  textTransform: 'none', // Prevent uppercase transformation
                  '&:hover': { backgroundColor: '#E0A82E' }, // Slightly darker yellow on hover
                }}
              >
                Hacer Pedido
              </Button>
            </Box>
          </Stack>

          {/* Location Map */}
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h5"
              component="h3"
              sx={{
                fontFamily: 'serif',
                fontWeight: 'bold',
                color: '#FFC03A',
                textAlign: 'center',
                mb: 3,
              }}
            >
              Nuestra Ubicación
            </Typography>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3159.6498443257177!2d-0.35580248467611764!3d39.47411477948668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd604f4fdff1e1fd%3A0x8282e2b4afc95b7!2sCarrer%20de%20Pere%20de%20Val%C3%A8ncia%2C%2046022%20Val%C3%A8ncia%2C%20Espa%C3%B1a!5e0!3m2!1sen!2sus!4v1692903826541!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </Box>
          </Box>

          {/* Footer Bottom Bar */}
          <Box
            sx={{
              mt: 6,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'gray.700',
              textAlign: 'center',
              color: 'gray.500',
              fontSize: '0.875rem',
            }}
          >
            <Typography>
              © 2024 Casa Loly. Todos los derechos reservados.
            </Typography>
            <MuiLink
              href="#privacy-policy"
              sx={{
                color: '#FFC03A',
                textDecoration: 'none',
                '&:hover': { color: '#E0A82E' },
                display: 'block',
                mt: 1,
              }}
            >
              Política de Privacidad
            </MuiLink>
          </Box>
        </Container>
      </FooterRoot>



    </ThemeProvider>
  );
}
