import {Box, Typography} from "@mui/material";
import {purple} from "@mui/material/colors";
function NotFound() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: purple[500],
            }}
        >
            <Typography variant="h1" style={{ color: 'white' }}>
                404
            </Typography>
        </Box>
    );
}
export default NotFound;