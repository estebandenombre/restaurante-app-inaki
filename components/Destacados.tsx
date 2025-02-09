import React from 'react';
import { Box, Typography, Button, keyframes } from "@mui/material";

const destacados = [
    { title: "Tortilla", category: "Tradicional", image: "/tortilla.jpg", price: 20 },
    { title: "Paella Valenciana", category: "Traditional", image: "/paella.jpg", price: 25 },
    { title: "Arroz Negro", category: "Seafood", image: "/arroz-negro.jpg", price: 22 },
    { title: "Gazpacho", category: "Cold Soup", image: "/gazpacho.jpg", price: 18 },
    { title: "Pulpo a la Gallega", category: "Seafood", image: "/pulpo.jpg", price: 28 },
];

// Animación de "rebote" de la flecha
const arrowAnimation = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
`;

// Animación de "rebote" de la promoción
const bounceAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export default function DestacadosSection() {
    return (
        <Box
            sx={{
                py: 6,
            }}
        >
            {/* Título */}
            <Typography
                variant="h4"
                sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    mb: 4,
                    color: "#333",
                }}
            >
                Nuestros Destacados
            </Typography>

            {/* Tarjetas */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: { xs: "nowrap", md: "wrap" },
                    justifyContent: { xs: "flex-start", md: "center" },
                    overflowX: { xs: "auto", md: "visible" },
                    px: { xs: 2, md: 0 },
                    gap: 4,
                    '&::-webkit-scrollbar': {
                        display: "none",
                    },
                    scrollbarWidth: "none",
                }}
            >
                {destacados.map((plato, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: "180px",
                            position: "relative",
                            textAlign: "center",
                            flexShrink: 0,
                        }}
                    >
                        {/* Contenedor de imagen */}
                        <Box
                            sx={{
                                width: "140px",
                                height: "140px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                margin: "0 auto",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                backgroundColor: "#fff",
                            }}
                        >
                            <img
                                src={plato.image}
                                alt={plato.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </Box>

                        {/* Nombre del plato */}
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                                marginTop: "12px",
                                fontWeight: "bold",
                                fontSize: "16px",
                                color: "#333",
                            }}
                        >
                            {plato.title}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Mensaje de desplazamiento en móviles */}
            <Box
                sx={{
                    display: { xs: "flex", md: "none" },
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 2,
                }}
            >
                <Typography
                    sx={{
                        fontSize: "14px",
                        color: "#555",
                        mr: 1,
                    }}
                >
                    Desplaza para ver más
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        animation: `${arrowAnimation} 1.5s infinite`,
                    }}
                >
                    <Box
                        sx={{
                            width: "16px",
                            height: "16px",
                            border: "solid #FFC03A",
                            borderWidth: "2px 2px 0 0",
                            transform: "rotate(45deg)",
                        }}
                    />
                </Box>
            </Box>

            {/* Promoción con márgenes laterales */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 4px 8px rgba(255, 192, 58, 0.5)', // Sombra amarilla
                    overflow: 'hidden',
                    maxWidth: { xs: '90%', md: '600px' }, // Ancho adaptativo
                    margin: { xs: '16px auto', md: '32px auto' }, // Márgenes para móviles y escritorio
                    position: 'relative',
                    paddingRight: '120px',
                    animation: `${bounceAnimation} 3s ease-in-out infinite`, // Animación de rebote suave
                }}
            >
                {/* Imagen redonda */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        right: '16px',
                        transform: 'translateY(-50%)',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                    }}
                >
                    <img
                        src="/paella.jpg" // Cambia por la imagen relevante
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
                            color: '#FFC03A',
                        }}
                    >
                        ¡Promoción Especial!
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '16px',
                            mb: 2,
                            color: '#4A4A4A',
                        }}
                    >
                        Todos los jueves, todas las comidas están a solo{' '}
                        <span style={{ fontWeight: 'bold', color: '#FFC03A' }}>3€</span>.
                    </Typography>
                    <Button
                        sx={{
                            backgroundColor: '#FFC03A',
                            color: '#FFFFFF',
                            fontWeight: 'bold',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#E0A82E',
                            },
                        }}
                    >
                        Haz tu Pedido
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
