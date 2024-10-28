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
    createTheme,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

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

export default function RegistroPage() {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            nombre: data.get('nombre'),
            apellido: data.get('apellido'),
            email: data.get('email'),
            password: data.get('password'),
            confirmPassword: data.get('confirmPassword'),
            aceptaTerminos: data.get('aceptaTerminos'),
        });
        // Aquí iría la lógica de registro
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
                        Regístrate en Casa de Comidas El Sabor
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="nombre"
                                    required
                                    fullWidth
                                    id="nombre"
                                    label="Nombre"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="apellido"
                                    label="Apellido"
                                    name="apellido"
                                    autoComplete="family-name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Correo Electrónico"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Contraseña"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirmar Contraseña"
                                    type="password"
                                    id="confirmPassword"
                                    autoComplete="new-password"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Checkbox value="aceptaTerminos" color="primary" />}
                                    label="Acepto los términos y condiciones"
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Registrarse
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="../login" variant="body2">
                                    ¿Ya tienes una cuenta? Inicia sesión
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
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