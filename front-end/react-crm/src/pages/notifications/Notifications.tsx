import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchData, Header1 } from '../../components/FetchData';

const Notifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]); // Notifications state
    const navigate = useNavigate();  // To navigate back to previous page or home

    // Function to fetch notifications
    const fetchNotifications = () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }

        fetchData('/api/notifications/', 'GET', null as any, Header)
            .then((res: any) => {
                if (res?.notifications) {
                    setNotifications(res.notifications);
                }
            })
            .catch((error) => {
                console.error('Error fetching notifications:', error);
            });
    };

    useEffect(() => {
        fetchNotifications();  // Fetch notifications on page load
    }, []);

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Notifications
            </Typography>
            <List>
                {notifications.length > 0 ? (
                    notifications.map((notification: any) => (
                        <ListItem key={notification.id} sx={{ padding: '10px 0' }}>
                            <ListItemText
                                primary={notification.message}
                                secondary={notification.created_at}
                            />
                        </ListItem>
                    ))
                ) : (
                    <Typography variant="body2" color="textSecondary">No notifications available.</Typography>
                )}
            </List>
        </Box>
    );
};

export default Notifications;
