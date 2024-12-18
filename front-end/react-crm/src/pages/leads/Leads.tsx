import React, { SyntheticEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarGroup, Box, Button, Card, List, Stack, Tab, TablePagination, Tabs, Toolbar, Typography, Link, MenuItem, Select, Container, Table, TableBody, TableContainer, TableRow, TableCell, Paper, Chip, } from '@mui/material'
import styled from '@emotion/styled';
import { LeadUrl } from '../../services/ApiUrls';
import { DeleteModal } from '../../components/DeleteModal';
import { Label } from '../../components/Label';
import { fetchData } from '../../components/FetchData';
import { Spinner } from '../../components/Spinner';
import FormateTime from '../../components/FormateTime';
import { getComparator, stableSort } from '../../components/Sorting';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
import { FiChevronRight } from "@react-icons/all-files/fi/FiChevronRight";
import { CustomTab, CustomToolbar, FabLeft, FabRight } from '../../styles/CssStyled';
import '../../styles/style.css'
import { EnhancedTableHead } from '../../components/EnchancedTableHead';

const statusStyles: { [key: string]: { backgroundColor: string; borderColor: string; color: string } } = {
  assigned: { backgroundColor: '#3E79F761', borderColor: '#3E79F7', color: '#3E79F7' },
  'in process': { backgroundColor: '#F7C94861', borderColor: '#F7C948', color: '#FFBC00' },
  converted: { backgroundColor: '#2DCC7061', borderColor: '#2DCC70', color: '#00903D' },
  recycled: { backgroundColor: '#F7883E61', borderColor: '#F7883E', color: '#FF6905' },
  closed: { backgroundColor: '#A0A0A061', borderColor: '#A0A0A0', color: '#747474' },
};

// Fallback style
const defaultStyle = {
  backgroundColor: '#E0E0E01A',
  borderColor: '#E0E0E0',
  color: '#616161',
};

interface Company { id: string; name: string; }

interface HeadCell {
  disablePadding: boolean;
  id: any;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'title', numeric: false, disablePadding: false, label: 'Name' },
  { id: 'company', numeric: false, disablePadding: false, label: 'Company' },
  { id: 'mobile_number', numeric: true, disablePadding: false, label: 'Phone Number' },
  { id: 'primary_email', numeric: true, disablePadding: false, label: 'Email' },
  { id: 'country', numeric: false, disablePadding: false, label: 'Country' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },

  { id: '', numeric: true, disablePadding: false, label: 'Action' }
];

// import css from './css';
// import emotionStyled from '@emotion/styled';
// import { styled } from '@mui/system';
// import { css } from '@emotion/react';



// margin-bottom: -15px;
//   display: flex;
//   justify-content: space-between;
//   background-color: #1A3353;
export const CustomTablePagination = styled(TablePagination)`
.MuiToolbar-root {
  min-width: 100px;
}
.MuiTablePagination-toolbar {
  background-color: #f0f0f0;
  color: #333;
}
.MuiTablePagination-caption {
  color: #999;
}
'.MuiTablePagination-displayedRows': {
  display: none;
}
'.MuiTablePagination-actions': {
  display: none;
}
'.MuiTablePagination-selectLabel': {
  margin-top: 4px;
  margin-left: -15px;
}
'.MuiTablePagination-select': {
  color: black;
  margin-right: 0px;
  margin-left: -12px;
  margin-top: -6px;
}
'.MuiSelect-icon': {
  color: black;
  margin-top: -5px;
}
background-color: white;
border-radius: 1;
height: 10%;
overflow: hidden;
padding: 0;
margin: 0;
width: 39%;
padding-bottom: 5;
color: black;
margin-right: 1;
`;


export const Tabss = styled(Tab)({
  height: '34px',
  textDecoration: 'none',
  fontWeight: 'bold'
});

export const ToolbarNew = styled(Toolbar)({
  minHeight: '48px', height: '48px', maxHeight: '48px',
  width: '100%', display: 'flex', justifyContent: 'space-between', backgroundColor: '#1A3353',
  '& .MuiToolbar-root': { minHeight: '48px !important', height: '48px !important', maxHeight: '48px !important' },
  '@media (min-width:600px)': {
    '& .MuiToolbar-root': {
      minHeight: '48px !important', height: '48px !important', maxHeight: '48px !important'
    }
  }
});
// export const formatDate = (dateString: any) => {
//   const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
//   return new Date(dateString).toLocaleDateString(undefined, options)
// }
// interface LeadList {
//   drawer: number;
// }
export default function Leads(props: any) {
  // const {drawer}=props
  const navigate = useNavigate()
  const [tab, setTab] = useState('open');
  const [loading, setLoading] = useState(true);

  const [leads, setLeads] = useState([])
  const [valued, setValued] = useState(10)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(0)
  const [initial, setInitial] = useState(true)
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('first_name')
  //const [order] = useState('asc')
  //const [orderBy] = useState('calories')

  const [openLeads, setOpenLeads] = useState([])
  const [openLeadsCount, setOpenLeadsCount] = useState(0)
  const [closedLeads, setClosedLeads] = useState([])
  const [openClosedCount, setClosedLeadsCount] = useState(0)
  const [contacts, setContacts] = useState([])
  const [status, setStatus] = useState([])
  const [source, setSource] = useState([])
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tags, setTags] = useState([])
  const [users, setUsers] = useState([])
  const [countries, setCountries] = useState([])
  const [industries, setIndustries] = useState([])

  const [selectOpen, setSelectOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [openCurrentPage, setOpenCurrentPage] = useState<number>(1);
  const [openRecordsPerPage, setOpenRecordsPerPage] = useState<number>(10);
  const [openTotalPages, setOpenTotalPages] = useState<number>(0);
  const [openLoading, setOpenLoading] = useState(true);


  const [closedCurrentPage, setClosedCurrentPage] = useState<number>(1);
  const [closedRecordsPerPage, setClosedRecordsPerPage] = useState<number>(10);
  const [closedTotalPages, setClosedTotalPages] = useState<number>(0);
  const [closedLoading, setClosedLoading] = useState(true);

  const [deleteLeadModal, setDeleteLeadModal] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [selectedTab, setSelectedTab] = useState(0); // For tracking selected tab


  useEffect(() => {
    if (!!localStorage.getItem('org')) {
      getLeads()
    }
  }, [!!localStorage.getItem('org')]);

  useEffect(() => {
    getLeads()
  }, [openCurrentPage, openRecordsPerPage, closedCurrentPage, closedRecordsPerPage]);
  const getLeads = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org')
    }
    try {
      const openOffset = (openCurrentPage - 1) * openRecordsPerPage;
      const closeOffset = (closedCurrentPage - 1) * closedRecordsPerPage;
      await fetchData(`${LeadUrl}/?offset=${tab === "open" ? openOffset : closeOffset}&limit=${tab === "open" ? openRecordsPerPage : closedRecordsPerPage}`, 'GET', null as any, Header)
        .then((res) => {
          console.log(res, 'leads')
          if (!res.error) {
            // if (initial) {
            setOpenLeads(res?.open_leads?.open_leads)
            setOpenLeadsCount(res?.open_leads?.leads_count)
            setOpenTotalPages(Math.ceil(res?.open_leads?.leads_count / openRecordsPerPage));
            setClosedLeads(res?.close_leads?.close_leads)
            setClosedLeadsCount(res?.close_leads?.leads_count)
            setClosedTotalPages(Math.ceil(res?.close_leads?.leads_count / closedRecordsPerPage));
            setContacts(res?.contacts)
            setStatus(res?.status)
            setSource(res?.source)
            setCompanies(res?.companies)
            setTags(res?.tags)
            setUsers(res?.users)
            setCountries(res?.countries)
            setIndustries(res?.industries)
            setLoading(false)
            // setLeadsList();
            // setInitial(false)
          }
          // else {
          //     // setContactList(Object.assign([], contacts, [data.contact_obj_list]))
          //     setContactList(prevContactList => prevContactList.concat(data.contact_obj_list));
          //     // setContactList(...contactList,data.contact_obj_list)
          //     setLoading(false)
          // }
          // }
        })
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleChangeTab = (e: SyntheticEvent, val: any) => {
    setTab(val)
  }
  const handleRecordsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (tab == 'open') {
      setOpenLoading(true)
      setOpenRecordsPerPage(parseInt(event.target.value));
      setOpenCurrentPage(1);
      setRecordsPerPage(parseInt(event.target.value));
    } else {
      setClosedLoading(true)
      setClosedRecordsPerPage(parseInt(event.target.value));
      setClosedCurrentPage(1);
    }

  };




  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handlePreviousPage = () => {
    if (tab == 'open') {
      setOpenLoading(true)
      setOpenCurrentPage((prevPage) => Math.min(prevPage - 1, openTotalPages));
      setCurrentPage((prevPage) => Math.min(prevPage - 1, openTotalPages));
    } else {
      setClosedLoading(true)
      setClosedCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    }
  };

  const handleNextPage = () => {
    if (tab == 'open') {
      setOpenLoading(true)
      setOpenCurrentPage((prevPage) => Math.min(prevPage + 1, openTotalPages));
      setCurrentPage((prevPage) => Math.min(prevPage + 1, openTotalPages));
    } else {
      setClosedLoading(true)
      setClosedCurrentPage((prevPage) => Math.min(prevPage + 1, closedTotalPages));
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const getCompanyName = (companyId: string): string => {
    console.log(companyId)
    console.log(companies)
    const company = companies?.find((c: Company) => c.id === companyId); // Explicitly type `c`
    console.log(company)

    return company ? company.name : '---'; // Return a placeholder if the company is not found 
  };


  const onAddHandle = () => {
    if (!loading) {
      navigate('/app/leads/add-leads', {
        state: {
          detail: false,
          contacts: contacts || [], status: status || [], source: source || [], companies: companies || [], tags: tags || [], users: users || [], countries: countries || [], industries: industries || []
          // status: leads.status, source: leads.source, industry: leads.industries, users: leads.users, tags: leads.tags, contacts: leads.contacts 
        }
      })
    }
  }

  const selectLeadList = (leadId: any) => {
    navigate(`/app/leads/lead-details`, { state: { leadId, detail: true, contacts: contacts || [], status: status || [], source: source || [], companies: companies || [], tags: tags || [], users: users || [], countries: countries || [], industries: industries || [] } })
    // navigate('/app/leads/lead-details', { state: { leadId: leadItem.id, edit: storeData, value } })
  }
  const deleteLead = (deleteId: any) => {
    setDeleteLeadModal(true)
    setSelectedId(deleteId)
  }

  const deleteLeadModalClose = () => {
    setDeleteLeadModal(false)
    setSelectedId('')
  }
  const modalDialog = 'Are You Sure You want to delete selected Lead?'
  const modalTitle = 'Delete Lead'

  const deleteItem = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org')
    }
    fetchData(`${LeadUrl}/${selectedId}/`, 'DELETE', null as any, Header)
      .then((res: any) => {
        // console.log('delete:', res);
        if (!res.error) {
          deleteLeadModalClose()
          getLeads()
        }
      })
      .catch(() => {
      })
  }



  const formatDate = (inputDate: string): string => {
    const currentDate = new Date();
    const targetDate = new Date(inputDate);
    const timeDifference = currentDate.getTime() - targetDate.getTime();

    const secondsDifference = Math.floor(timeDifference / 1000);
    const minutesDifference = Math.floor(secondsDifference / 60);
    const hoursDifference = Math.floor(minutesDifference / 60);
    const daysDifference = Math.floor(hoursDifference / 24);
    const monthsDifference = Math.floor(daysDifference / 30);

    if (monthsDifference >= 12) {
      const yearsDifference = Math.floor(monthsDifference / 12);
      return `${yearsDifference} ${yearsDifference === 1 ? 'year' : 'years'} ago`;
    } else if (monthsDifference >= 1) {
      return `${monthsDifference} ${monthsDifference === 1 ? 'month' : 'months'} ago`;
    } else if (daysDifference >= 1) {
      return `${daysDifference} ${daysDifference === 1 ? 'day' : 'days'} ago`;
    } else if (hoursDifference >= 1) {
      return `${hoursDifference} ${hoursDifference === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutesDifference >= 1) {
      return `${minutesDifference} ${minutesDifference === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return `${secondsDifference} ${secondsDifference === 1 ? 'second' : 'seconds'} ago`;
    }
  };
  const recordsList = [[10, '10 Records per page'], [20, '20 Records per page'], [30, '30 Records per page'], [40, '40 Records per page'], [50, '50 Records per page']]
  const tag = ['account', 'leading', 'account', 'leading', 'account', 'leading', 'account', 'account', 'leading', 'account', 'leading', 'account', 'leading', 'leading', 'account', 'account', 'leading', 'account', 'leading', 'account', 'leading', 'account', 'leading', 'account', 'leading', 'account', 'leading']

  return (
    <Box sx={{ mt: '60px' }}>
      <CustomToolbar sx={{ flexDirection: 'row-reverse' }}>
        {/* <Tabs defaultValue={tab} onChange={handleChangeTab} sx={{ mt: '26px' }}>
          <CustomTab value="open" label="Open"
            sx={{
              backgroundColor: tab === 'open' ? '#F0F7FF' : '#284871',
              color: tab === 'open' ? '#3f51b5' : 'white',
            }} />
          <CustomTab value="closed" label="Closed"
            sx={{
              backgroundColor: tab === 'closed' ? '#F0F7FF' : '#284871',
              color: tab === 'closed' ? '#3f51b5' : 'white',
              ml: '5px',
            }}
          />
        </Tabs> */}

        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Select
            value={recordsPerPage}
            onChange={(e: any) => handleRecordsPerPage(e)}
            open={selectOpen}
            onOpen={() => setSelectOpen(true)}
            onClose={() => setSelectOpen(false)}
            className={`custom-select`}
            onClick={() => setSelectOpen(!selectOpen)}
            IconComponent={() => (
              <div onClick={() => setSelectOpen(!selectOpen)} className="custom-select-icon">
                {selectOpen ? <FiChevronUp style={{ marginTop: '12px' }} /> : <FiChevronDown style={{ marginTop: '12px' }} />}
              </div>
            )}
            sx={{
              '& .MuiSelect-select': { overflow: 'visible !important' }
            }}
          >
            {recordsList?.length && recordsList.map((item: any, i: any) => (
              <MenuItem key={i} value={item[0]}>
                {item[1]}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{ borderRadius: '7px', backgroundColor: 'white', height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', mr: 1, p: '0px' }}>
            <FabLeft onClick={handlePreviousPage} disabled={currentPage === 1}>
              <FiChevronLeft style={{ height: '15px' }} />
            </FabLeft>
            <Typography sx={{ mt: 0, textTransform: 'lowercase', fontSize: '15px', color: '#1A3353', textAlign: 'center' }}>
              {currentPage} to {openTotalPages}
              {/* {renderPageNumbers()} */}
            </Typography>
            <FabRight onClick={handleNextPage} disabled={currentPage === totalPages}>
              <FiChevronRight style={{ height: '15px' }} />
            </FabRight>
          </Box>
          <Button
            variant='contained'
            startIcon={<FiPlus className='plus-icon' />}
            onClick={onAddHandle}
            className={'add-button'}
          >
            Add Lead
          </Button>
        </Stack>
      </CustomToolbar>
      <Container sx={{ width: '100%', maxWidth: '100%', minWidth: '100%' }}>
        <Box sx={{ width: '100%', minWidth: '100%', m: '15px 0px 0px 0px' }}>

          <Paper sx={{ width: '100%', mb: 2, p: '15px' }}>
            <Box sx={{ marginBottom: 2, marginLeft: 2, marginTop: 2 }}>
              <Tabs value={selectedTab} onChange={handleTabChange} aria-label="view tabs">
                <Tab label="List View" />
                <Tab label="Card View" />
              </Tabs>
            </Box>

            {selectedTab === 0 ? (
              <>
                <TableContainer>
                  <Table>
                    <EnhancedTableHead
                      order={order}
                      orderBy={orderBy}
                      onRequestSort={handleRequestSort}
                      headCells={headCells}
                    />
                    <TableBody>
                      {openLeads?.length
                        ? stableSort(openLeads, getComparator(order, orderBy)).map((item: any, index: any) => (
                          <TableRow
                            key={index}
                            sx={{
                              border: 0,
                              '&:nth-of-type(even)': { backgroundColor: 'whitesmoke' },
                              textTransform: 'capitalize',
                            }}
                          >
                            <TableCell onClick={() => selectLeadList(item.id)}>
                              {item.title}
                            </TableCell>
                            <TableCell> {getCompanyName(item.company)}</TableCell>
                            <TableCell>{item.phone || '---'}</TableCell>
                            <TableCell>{item.email}</TableCell>
                            <TableCell> {item.country}</TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  border: `1px solid ${statusStyles[item.status]?.borderColor || defaultStyle.borderColor}`,
                                  backgroundColor: statusStyles[item.status]?.backgroundColor || defaultStyle.backgroundColor,
                                  color: statusStyles[item.status]?.color || defaultStyle.color,
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  textAlign: 'center',
                                  fontSize: '0.875rem',
                                  fontWeight: 'bold',
                                  display: 'inline-block',
                                  minWidth: '80px',
                                }}
                              >
                                {item.status}
                              </Box>
                            </TableCell>
                            <TableCell>

                              <FaEdit
                                onClick={() =>
                                  navigate('/app/leads/edit-lead', {
                                    state: {
                                      id: item.id,
                                      value: item,
                                      contacts: contacts,
                                      status: status,
                                      source: source,
                                      companies: companies,
                                      tags: tags,
                                      users: users,
                                      countries: countries,
                                      industries: industries,
                                    },
                                  })
                                }
                                style={{ fill: '#1A3353', cursor: 'pointer', width: '18px' }}
                              />



                              <FaTrashAlt style={{ cursor: 'pointer' }} onClick={() => deleteLead(item.id)} />
                            </TableCell>
                          </TableRow>
                        ))
                        : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              // Card View
              <Box sx={{ padding: 2 }}>
                <h2>Card Content</h2>
                {/* You can replace this with actual card components later */}
              </Box>
            )}
            {loading && <Spinner />}
          </Paper>
        </Box>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
          <Box>
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              startIcon={<FiChevronLeft />}
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              endIcon={<FiChevronRight />}
            >
              Next
            </Button>
          </Box>

        </Box>
      </Container>

      {/* Delete Modal */}
      <DeleteModal
        onClose={deleteLeadModalClose}
        open={deleteLeadModal}
        id={selectedId}
        modalDialog={modalDialog}
        modalTitle={modalTitle}
        DeleteItem={deleteItem}
      />
    </Box>
  );
}
