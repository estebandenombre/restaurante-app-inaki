import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { keyframes } from "@emotion/react";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

const destacados = [
    {
        title: "Paella Valenciana",
        image: "/paella.jpg",
        description: "Un clásico preparado con ingredientes frescos y mucho sabor.",
    },
    {
        title: "Arroz Negro",
        image: "/arroz-negro.jpg",
        description: "Arroz con tinta de calamar, cremoso y delicioso.",
    },
    {
        title: "Fideuá",
        image: "/fideua.jpg",
        description: "Fideos con mariscos al estilo tradicional.",
    },
    {
        title: "Costillas BBQ",
        image: "/costillas.jpg",
        description: "Jugosas costillas con salsa barbacoa casera.",
    },
    {
        title: "Canelones de Espinacas",
        image: "/canelones.jpg",
        description: "Rellenos de espinacas y ricotta, cubiertos de bechamel.",
    },
    {
        title: "Tortilla de Patatas",
        image: "/tortilla.jpg",
        description: "Un clásico español hecho al estilo tradicional.",
    },
];

// Animación de la flecha
const slideAnimation = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(10px); }
  100% { transform: translateX(0); }
`;

export default function DestacadosSection() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detectar si es móvil

    return (
        <Box
            sx={{
                py: { xs: 6, md: 12 },
                backgroundColor: "white",
                textAlign: "center",
                overflowX: "hidden",
                width: "98vw",
                margin: 0,
            }}
            id="destacados"
        >
            {/* Título de la sección */}
            <Typography
                variant="h4"
                sx={{
                    fontFamily: "serif",
                    fontWeight: "bold",
                    mb: 3,
                    color: "black",
                    fontSize: { xs: "28px", md: "36px" },
                }}
            >
                Nuestros Destacados
            </Typography>

            {/* Indicador de desplazamiento para móviles */}
            {isMobile && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "gray.500",
                        mb: 2,
                        fontSize: "14px",
                        gap: 1,
                    }}
                >
                    <Typography variant="body2">Desliza para explorar</Typography>
                    <ArrowRightAltIcon
                        sx={{
                            animation: `${slideAnimation} 1.5s infinite`,
                            fontSize: "20px",
                        }}
                    />
                </Box>
            )}

            {/* Contenedor de platos */}
            <Box
                sx={{
                    display: "flex",
                    gap: { xs: 3, md: 2 },
                    overflowX: { xs: "auto", md: "hidden" },
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    justifyContent: { xs: "flex-start", md: "center" },
                    maxWidth: "100%",
                    px: { xs: 0, md: 4 },
                    flexWrap: { xs: "nowrap", md: "wrap" },
                }}
            >
                {destacados.map((plato, index) => (
                    <Box
                        key={index}
                        sx={{
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: 1,
                            position: "relative",
                            width: { xs: 120, md: 150 },
                            height: "auto",
                            cursor: "pointer", // Indicar que es interactivo
                            "&:hover .description": !isMobile
                                ? {
                                    maxHeight: "100px",
                                    opacity: 1,
                                }
                                : {},
                        }}
                    >
                        {/* Imagen circular */}
                        <Box
                            sx={{
                                width: { xs: 100, md: 120 },
                                height: { xs: 100, md: 120 },
                                borderRadius: "50%",
                                overflow: "hidden",
                                mb: 1,
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
                        {/* Título del plato */}
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: "bold",
                                color: "black",
                                fontSize: "16px",
                            }}
                        >
                            {plato.title}
                        </Typography>

                        {/* Descripción expandible */}
                        <Box
                            className="description"
                            sx={{
                                maxHeight: 0,
                                overflow: "hidden",
                                opacity: 0,
                                transition: "max-height 0.3s ease, opacity 0.3s ease",
                                fontSize: "14px",
                                color: "gray.700",
                                textAlign: "center",
                            }}
                        >
                            {plato.description}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
