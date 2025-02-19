const config = {
    API_BASE_URL: (() => {
        try {
            const hostname = window.location.hostname;
            return `https://backend-g2dw.onrender.com/api`;
        } catch (error) {
            console.error('Error getting API URL:', error);
            return 'http://localhost:5000/api';
        }
    })(),
    TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3
};

export default config;