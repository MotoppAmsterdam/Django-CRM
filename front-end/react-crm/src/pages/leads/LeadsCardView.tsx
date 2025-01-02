import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { ChevronLeft, ChevronRight, MoreVert, Money, Euro } from '@mui/icons-material';
import { fetchData } from '../../components/FetchData';
import { LeadCardViewUrl, LeadUrl } from '../../services/ApiUrls';
import { useNavigate } from 'react-router-dom';

interface Lead {
  id: string;
  title: string;
  country: string;
  opportunity_amount: number;
  probability: number;
  profile_pics: string[];
}

type LeadStatus = 'assigned' | 'in process' | 'converted' | 'recycled' | 'closed';

type LeadsState = {
  [K in LeadStatus]: Lead[];
};

const STATUS_COLORS = {
  assigned: '#ff5722',
  'in process': '#ff9800',
  converted: '#4caf50',
  recycled: '#2196f3',
  closed: '#9e9e9e',
};

const STATUS_LIST: LeadStatus[] = [
  'assigned',
  'in process',
  'converted',
  'recycled',
  'closed',
];

const initialLeads = STATUS_LIST.reduce((acc, status) => {
  acc[status] = [];
  return acc;
}, {} as Record<LeadStatus, Lead[]>);

const LeadsCardView = () => {
  const [leads, setLeads] = useState<Record<LeadStatus, Lead[]>>(initialLeads);
  const [paginationInfo, setPaginationInfo] = useState<
    Record<LeadStatus, { currentPage: number; totalCount: number }>
  >(
    () =>
      Object.fromEntries(
        STATUS_LIST.map((status) => [status, { currentPage: 0, totalCount: 0 }])
      ) as Record<LeadStatus, { currentPage: number; totalCount: number }>
  );
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [menuLead, setMenuLead] = useState<string | null>(null);
  const [deleteSnackbar, setDeleteSnackbar] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  // Fetch leads for a specific status
  const fetchLeads = async (status: LeadStatus, page = 1) => {
    try {
      const Header = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('Token'),
        org: localStorage.getItem('org'),
      };
      const response = await fetchData(
        `${LeadCardViewUrl}/?status=${status}&page=${page}`,
        'GET',
        null as any,
        Header
      );
      setLeads((prev) => ({
        ...prev,
        [status]: response.results,
      }));
      setPaginationInfo((prev) => ({
        ...prev,
        [status]: {
          currentPage: page,
          totalCount: response.count,
        },
      }));
    } catch (error) {
      console.error(`Failed to fetch leads for status: ${status}`, error);
    }
  };

  // Fetch all statuses on tab switch
  useEffect(() => {
    STATUS_LIST.forEach((status) => fetchLeads(status, 1));
  }, []);

  // Menu handlers
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuLead(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuLead(null);
  };

  // Pagination handlers
  const handlePrevPage = (status: LeadStatus) => {
    const currentPage = paginationInfo[status]?.currentPage || 1;
    if (currentPage > 1) {
      fetchLeads(status, currentPage - 1);
    }
  };

  const handleNextPage = (status: LeadStatus) => {
    const currentPage = paginationInfo[status]?.currentPage || 1;
    const totalCount = paginationInfo[status]?.totalCount || 0;
    if (currentPage * 3 < totalCount) {
      fetchLeads(status, currentPage + 1);
    }
  };

  const navigate = useNavigate();

  function LinearProgressWithLabel(props: { value: number }) {
    // Function to determine color based on value
    const getColorForValue = (value: number): string => {
      if (value < 25) return '#ff0000';      // red
      if (value < 50) return '#ff8c00';      // orange
      if (value < 75) return '#ffd700';      // yellow
      return '#4caf50';                      // green
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={props.value}
            sx={{
              height: 12,
              borderRadius: 7,
              '& .MuiLinearProgress-bar': {
                backgroundColor: getColorForValue(props.value),
                borderRadius: 7
              }
            }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography 
            variant="body2" 
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  }

  const handleDelete = async (id: string | null) => {
    if (!id) return; // Early return if id is null

    try {
      const Header = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('Token'),
        org: localStorage.getItem('org'),
      };

      const response = await fetchData(`${LeadUrl}/${id}/`, 'DELETE', undefined, Header);
      
      if (!response.error) {
        setLeads((prev: LeadsState) => {
          const newLeads = { ...prev };
          (Object.keys(newLeads) as LeadStatus[]).forEach((status) => {
            newLeads[status] = newLeads[status].filter(
              (lead: Lead) => lead.id !== id
            );
          });
          return newLeads;
        });
        setDeleteSnackbar(true);
      } else {
        setDeleteError(true);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      setDeleteError(true);
    } finally {
      handleMenuClose();
    }
  };

  return (
    <Box display="flex" gap={2} sx={{ overflowX: 'auto', padding: 2 }}>
      {STATUS_LIST.map((status) => (
        <Box key={status} flex="1" minWidth="200px">
          <Box
            sx={{
              backgroundColor: STATUS_COLORS[status],
              height: '5px',
              borderRadius: '4px',
              marginBottom: '5px',
            }}
          />
          <Typography variant="h6" align="center" gutterBottom>
            {status.toUpperCase()}
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <IconButton size="small" onClick={() => handlePrevPage(status)}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="body2">
              {paginationInfo[status]?.currentPage || 1}/
              {Math.ceil((paginationInfo[status]?.totalCount || 0) / 3)}
            </Typography>
            <IconButton size="small" onClick={() => handleNextPage(status)}>
              <ChevronRight />
            </IconButton>
          </Box>
          <Box>
            {(leads[status] || []).map((lead) => (
              <Box
                key={lead.id}
                onClick={() => navigate('/app/leads/lead-details', { state: { leadId: lead.id } })}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '8px',
                  marginBottom: '8px',
                  position: 'relative',
                  backgroundColor: '#FEF7FF',
                  width: 'calc(100% - 50px)',
                  margin: '0 auto 32px',
                  cursor: 'pointer', // Shows clickable cursor
                  transition: 'all 0.2s ease-in-out', // Smooth transition for hover effects
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Shadow on hover
                    borderColor: '#ccc', // Highlight border color
                  },
                }}
              >
                <Typography
                  sx={{
                    paddingRight: '50px', // Space for the menu button
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    color: '#000000',
                    fontSize: '13px',
                  }}
                >
                  {lead.title}
                </Typography>{' '}
                <Typography variant="body2" color="textSecondary">
                  {lead.country}
                </Typography>
                <Box
                  sx={{
                    margin: '12px 0', // Add vertical margin
                  }}
                >
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ marginBottom: '4px' }}
                  >
                    Assigned to:
                  </Typography>
                  <Box display="flex" gap={1} mb={1} sx={{ marginTop: '4px' }}>
                    {lead.profile_pics.map((pic, index) => (
                      <Avatar key={index} src={pic} alt="profile-pic" />
                    ))}
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <LinearProgressWithLabel value={lead.probability} />
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Euro sx={{ color: '#4CAF50' }} />
                  <Typography variant="body2">
                    {Number(lead.opportunity_amount).toLocaleString('nl-NL', { 
                      style: 'decimal',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: '8px', right: '8px' }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleMenuOpen(event, lead.id);
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => console.log('Edit', menuLead)}>Edit</MenuItem>
        <MenuItem onClick={() => handleDelete(menuLead)}>
          Delete
        </MenuItem>
      </Menu>
      <Snackbar
        open={deleteSnackbar}
        autoHideDuration={3000}
        onClose={() => setDeleteSnackbar(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Lead deleted successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={deleteError}
        autoHideDuration={3000}
        onClose={() => setDeleteError(false)}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          Failed to delete lead
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeadsCardView;
