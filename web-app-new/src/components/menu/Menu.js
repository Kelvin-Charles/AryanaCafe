import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';

const DUMMY_MENU_ITEMS = [
  {
    id: 1,
    name: 'Cappuccino',
    category: 'beverages',
    price: 4.99,
    description: 'Rich espresso with steamed milk foam',
    image: '/menu/cappuccino.jpg',
    dietary: ['vegetarian'],
  },
  {
    id: 2,
    name: 'Chocolate Cake',
    category: 'desserts',
    price: 6.99,
    description: 'Decadent chocolate layer cake',
    image: '/menu/chocolate-cake.jpg',
    dietary: ['vegetarian'],
  },
  // Add more items as needed
];

const CATEGORIES = ['all', 'beverages', 'desserts', 'snacks'];
const DIETARY_OPTIONS = ['all', 'vegetarian', 'vegan', 'gluten-free'];

function Menu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDietary, setSelectedDietary] = useState('all');

  const filteredItems = DUMMY_MENU_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesDietary = selectedDietary === 'all' || item.dietary.includes(selectedDietary);
    
    return matchesSearch && matchesCategory && matchesDietary;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Our Menu
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(category => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Dietary</InputLabel>
              <Select
                value={selectedDietary}
                label="Dietary"
                onChange={(e) => setSelectedDietary(e.target.value)}
              >
                {DIETARY_OPTIONS.map(option => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {filteredItems.map(item => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={item.image}
                alt={item.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${item.price.toFixed(2)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {item.dietary.map(tag => (
                    <Typography
                      key={tag}
                      variant="caption"
                      sx={{
                        mr: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      }}
                    >
                      {tag}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Menu; 