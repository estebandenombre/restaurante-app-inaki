'use client'
import React from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Grid,
    CssBaseline,
    ThemeProvider,
    createTheme
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

// Creamos un tema personalizado con colores que se ajustan a una casa de comidas
const theme = createTheme({
    palette: {
        primary: {
            main: '#d32f2f', // Un rojo cálido para el color principal
        },
        secondary: {
            main: '#ffa726', // Un naranja para acentos
        },
    },
});

export default function LoginPage() {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
        // Aquí iría la lógica de autenticación
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <RestaurantIcon sx={{ m: 1, fontSize: 50, color: 'primary.main' }} />
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Casa de Comidas El Sabor
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Correo Electrónico"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Iniciar Sesión
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="../recuperar" variant="body2">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="../registro" variant="body2">
                                    {"¿No tienes cuenta? Regístrate"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8, mb: 4 }}>
                    {"Copyright © "}
                    <Link color="inherit" href="#">
                        Casa de Comidas El Sabor
                    </Link>{" "}
                    {new Date().getFullYear()}
                    {"."}
                </Typography>
            </Container>
        </ThemeProvider>
    );
}