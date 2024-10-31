// OrganizationSettings.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { OrgAuthUrl, OrgUrl, SERVER } from '../services/ApiUrls';

const Settings = () => {
    const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    const orgId = localStorage.getItem('org')

    useEffect(() => {
        // Fetch the current google_auth_enabled status when the component loads
        const fetchGoogleAuthStatus = async () => {
            try {
                const response = await axios.get(`${SERVER}${OrgAuthUrl}/${orgId}/`, {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: localStorage.getItem('Token'),
                        org: localStorage.getItem('org')
                    }
                });
                setGoogleAuthEnabled(response.data.google_auth_enabled);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching Google Auth status:', error);
                setLoading(false);
            }
        };

        fetchGoogleAuthStatus();
    }, [orgId]);

    const toggleGoogleAuth = async () => {
        try {
            const response = await axios.patch(`${SERVER}${OrgAuthUrl}/${orgId}/`, {
                google_auth_enabled: !googleAuthEnabled
            }, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: localStorage.getItem('Token'),
                    org: localStorage.getItem('org')                    
                }
            });
            setGoogleAuthEnabled(response.data.google_auth_enabled);
        } catch (error) {
            console.error('Error updating Google Auth status:', error);
        }
    };

    if (loading) return <p>Loading settings...</p>;

    return (
        <div>
            <h1>Organization Settings</h1>
            <label>
                <input
                    type="checkbox"
                    checked={googleAuthEnabled}
                    onChange={toggleGoogleAuth}
                />
                Enable Google Login
            </label>
        </div>
    );
};

export default Settings;
