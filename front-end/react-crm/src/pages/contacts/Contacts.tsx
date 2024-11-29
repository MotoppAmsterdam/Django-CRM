import { Box, Button, Card, Stack, Tab, Table, TableBody, TableContainer, TableHead, TableRow, Tabs, Toolbar, Typography, Paper, Select, MenuItem, TableCell, TableSortLabel, Container, Skeleton, Chip } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
import { FiChevronRight } from "@react-icons/all-files/fi/FiChevronRight";
import { getComparator, stableSort } from '../../components/Sorting';
import { Spinner } from '../../components/Spinner';
import { fetchData } from '../../components/FetchData';
import { ContactCategoryUrl, ContactUrl, SERVER } from '../../services/ApiUrls';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import { DeleteModal } from '../../components/DeleteModal';
import { EnhancedTableHead } from '../../components/EnchancedTableHead';

interface HeadCell {
    disablePadding: boolean;
    id: any;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'first_name',
        numeric: false,
        disablePadding: false,
        label: 'Name'
    },
    {
        id: 'primary_email',
        numeric: true,
        disablePadding: false,
        label: 'Email Address'
    },
    {
        id: 'mobile_number',
        numeric: true,
        disablePadding: false,
        label: 'Phone Number'
    },
    {
        id: 'categories',
        numeric: true,
        disablePadding: false,
        label: 'Categories'
    },
    {
        id: '',
        numeric: true,
        disablePadding: false,
        label: 'Action'
    }
]

const categoryStyles: { [key: string]: { backgroundColor: string; borderColor: string } } = {
    Lead: { backgroundColor: '#FF73001A', borderColor: '#FF7300' },
    Opportunity: { backgroundColor: '#FFD7001A', borderColor: '#FFD700' },
    Customer: { backgroundColor: '#007BFF1A', borderColor: '#007BFF' },
    'Loyal Customer': { backgroundColor: '#0080801A', borderColor: '#008080' },
};

export default function Contacts() {
    const navigate = useNavigate();

    const [value, setValue] = useState('Open');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [contactList, setContactList] = useState<any[]>([]);
    const [countries, setCountries] = useState([]);
    const [deleteRowModal, setDeleteRowModal] = useState(false);
    const [selectedId, setSelectedId] = useState('');
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('first_name');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);

    useEffect(() => {
        getContacts();
    }, [currentPage, recordsPerPage]);

    const getContacts = async () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        };
        try {
            const offset = (currentPage - 1) * recordsPerPage;
            const data = await fetchData(`${ContactUrl}/?offset=${offset}&limit=${recordsPerPage}`, 'GET', null as any, Header);

            if (!data.error) {
                const contactListWithCategories = await Promise.all(
                    data.contact_obj_list.map(async (contact: any) => {
                        const categories = await getContactCategories(contact.id);
                        return { ...contact, categories };
                    })
                );
                console.log(contactListWithCategories);
                setContactList(contactListWithCategories as any[]);
                setCountries(data.countries);
                setTotalPages(Math.ceil(data.contacts_count / recordsPerPage));
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const getContactCategories = async (contactId: string) => {
        try {
            const response = await fetch(`${SERVER}${ContactCategoryUrl}/${contactId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const categoryData = await response.json();
            console.log("Category Data: ", categoryData);
            return categoryData.categories || [];
        } catch (error) {
            console.error(`Error fetching categories for contact ${contactId}:`, error);
            return [''];
        }
    };

    const handleChipClick = (category: string) => {
        console.log(`Clicked on category: ${category}`);
        // Handle category click logic here
    };

    const handleRequestSort = (event: any, property: any) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handlePreviousPage = () => {
        setLoading(true);
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setLoading(true);
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const handleRecordsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLoading(true);
        setRecordsPerPage(parseInt(event.target.value));
        setCurrentPage(1);
    };

    const onAddContact = () => {
        if (!loading) {
            navigate('/app/contacts/add-contacts', { state: { countries } });
        }
    };

    const contactHandle = (contactId: any) => {
        navigate(`/app/contacts/contact-details`, { state: { contactId, detail: true, countries } });
    };

    const deleteRow = (deleteId: any) => {
        setDeleteRowModal(true);
        setSelectedId(deleteId);
    };

    const deleteRowModalClose = () => {
        setDeleteRowModal(false);
        setSelectedId('');
    };

    const DeleteItem = async () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        };
        try {
            const res = await fetchData(`${ContactUrl}/${selectedId}/`, 'DELETE', null as any, Header);
            if (!res.error) {
                deleteRowModalClose();
                getContacts();
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    return (
        <Box sx={{ mt: '60px' }}>
            <Container sx={{ width: '100%' }}>
                <Box sx={{ width: '100%', minWidth: '100%', m: '15px 0px 0px 0px' }}>
                    <Paper sx={{ width: '100%', mb: 2, p: '15px' }}>
                        <TableContainer>
                            <Table>
                                <EnhancedTableHead
                                    order={order}
                                    orderBy={orderBy}
                                    onRequestSort={handleRequestSort}
                                    headCells={headCells}
                                />
                                <TableBody>
                                    {contactList?.length
                                        ? stableSort(contactList, getComparator(order, orderBy)).map((item: any, index: any) => (
                                            <TableRow
                                                key={index}
                                                sx={{ border: 0, '&:nth-of-type(even)': { backgroundColor: 'whitesmoke' }, textTransform: 'capitalize' }}>
                                                <TableCell onClick={() => contactHandle(item.id)}>
                                                    {item.first_name + ' ' + item.last_name}
                                                </TableCell>
                                                <TableCell>{item.primary_email}</TableCell>
                                                <TableCell>{item.mobile_number || '---'}</TableCell>
                                                <TableCell>
                                                    {item.categories?.map((category: string) => (
                                                        <Chip
                                                            key={category}
                                                            label={category}
                                                            clickable
                                                            onClick={() => handleChipClick(category)}
                                                            sx={{
                                                                backgroundColor: categoryStyles[category]?.backgroundColor,
                                                                border: `1px solid ${categoryStyles[category]?.borderColor}`,
                                                                color: categoryStyles[category]?.borderColor,
                                                                margin: '0 4px',
                                                            }}
                                                        />
                                                    ))}
                                                </TableCell>
                                                <TableCell>
                                                    <FaTrashAlt style={{ cursor: 'pointer' }} onClick={() => deleteRow(item.id)} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        : null}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {loading && <Spinner />}
                    </Paper>
                </Box>
            </Container>
            <DeleteModal
                onClose={deleteRowModalClose}
                open={deleteRowModal}
                id={selectedId}
                modalDialog="Are you sure you want to delete this contact?"
                modalTitle="Delete Contact"
                DeleteItem={DeleteItem}
            />
        </Box>
    );
}
