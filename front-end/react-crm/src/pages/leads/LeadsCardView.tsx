import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import { ChevronLeft, ChevronRight, MoreVert } from "@mui/icons-material";
import { fetchData } from "../../components/FetchData";
import { LeadCardViewUrl } from "../../services/ApiUrls";

type LeadStatus = "assigned" | "in process" | "converted" | "recycled" | "closed";

const STATUS_COLORS = {
  assigned: "#ff5722",
  "in process": "#ff9800",
  converted: "#4caf50",
  recycled: "#2196f3",
  closed: "#9e9e9e",
};

const STATUS_LIST: LeadStatus[] = ["assigned", "in process", "converted", "recycled", "closed"];

const LeadsCardView = () => {
  const [leads, setLeads] = useState({});
  const [paginationInfo, setPaginationInfo] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuLead, setMenuLead] = useState(null);

  // Fetch leads for a specific status
  const fetchLeads = async (status: LeadStatus, page = 1) => {
    try {
      const Header = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('Token'),
        org: localStorage.getItem('org')
      }
      const response = await fetchData(
        `${LeadCardViewUrl}/?status=${status}&page=${page}`, 
        "GET", 
        null as any, 
        Header
      );
      setLeads((prev) => ({
        ...prev,
        [status]: response.data.results,
      }));
      setPaginationInfo((prev) => ({
        ...prev,
        [status]: {
          currentPage: page,
          totalCount: response.data.count,
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
  const handleMenuOpen = (event, lead) => {
    setAnchorEl(event.currentTarget);
    setMenuLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuLead(null);
  };

  // Pagination handlers
  const handlePrevPage = (status) => {
    const currentPage = paginationInfo[status]?.currentPage || 1;
    if (currentPage > 1) {
      fetchLeads(status, currentPage - 1);
    }
  };

  const handleNextPage = (status) => {
    const currentPage = paginationInfo[status]?.currentPage || 1;
    const totalCount = paginationInfo[status]?.totalCount || 0;
    if (currentPage * 3 < totalCount) {
      fetchLeads(status, currentPage + 1);
    }
  };

  return (
    <Box display="flex" gap={2} sx={{ overflowX: "auto", padding: 2 }}>
      {STATUS_LIST.map((status) => (
        <Box key={status} flex="1" minWidth="200px">
          <Box
            sx={{
              backgroundColor: STATUS_COLORS[status],
              height: "5px",
              borderRadius: "4px",
              marginBottom: "5px",
            }}
          />
          <Typography variant="h6" align="center" gutterBottom>
            {status.toUpperCase()}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <IconButton size="small" onClick={() => handlePrevPage(status)}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="body2">
              {paginationInfo[status]?.currentPage || 1}/{Math.ceil((paginationInfo[status]?.totalCount || 0) / 3)}
            </Typography>
            <IconButton size="small" onClick={() => handleNextPage(status)}>
              <ChevronRight />
            </IconButton>
          </Box>
          <Box>
            {(leads[status] || []).map((lead) => (
              <Box
                key={lead.id}
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "8px",
                  marginBottom: "8px",
                  position: "relative",
                }}
              >
                <Typography variant="subtitle1">{lead.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {lead.country}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Assigned to:
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  {lead.profile_pics.map((pic, index) => (
                    <Avatar key={index} src={pic} alt="profile-pic" />
                  ))}
                </Box>
                <Typography variant="body2">Probability: {lead.probability}%</Typography>
                <Typography variant="body2">Amount: ${lead.opportunity_amount}</Typography>
                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: "8px", right: "8px" }}
                  onClick={(event) => handleMenuOpen(event, lead)}
                >
                  <MoreVert />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => console.log("Edit", menuLead)}>Edit</MenuItem>
        <MenuItem onClick={() => console.log("Delete", menuLead)}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default LeadsCardView;
