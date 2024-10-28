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
    Paper
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LockResetIcon from '@mui/icons-material/LockReset';

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

export default function OlvidasteContrasenaPage() {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
        });
        // Aquí iría la lógica para enviar el correo de recuperación
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <RestaurantIcon sx={{ m: 1, fontSize: 50, color: 'primary.main' }} />
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Casa de Comidas El Sabor
                    </Typography>
                    <LockResetIcon sx={{ m: 1, fontSize: 40, color: 'secondary.main' }} />
                    <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
                        Recupera tu contraseña
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Enviar correo de recuperación
                        </Button>
                        <Grid container justifyContent="center">
                            <Grid item>
                                <Link href="../login" variant="body2">
                                    Volver a iniciar sesión
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
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