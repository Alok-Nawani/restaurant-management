# Menu Images Guide

## How Menu Images Work

The menu items automatically display category-specific images from Unsplash. Here's how the system works and how you can customize it.

## Current Implementation

### Location
The image logic is in: `frontend/src/pages/Menu.jsx`

### How It Works

1. **Category-Based Images**: Each menu item category has a set of curated Unsplash image IDs
2. **Random Selection**: When a menu item is displayed, a random image is selected from its category's image pool
3. **Fallback**: If an image fails to load, a category-specific emoji is shown instead

### Image Categories

The system uses these categories:
- **Pizza**: Pizza images
- **Beverage**: Drink/beverage images  
- **Dessert**: Dessert images
- **Appetizer**: Appetizer images
- **Curry**: Indian curry images
- **Rice**: Rice dish images
- **Vegetable**: Vegetable dish images
- **Bread**: Bread images
- **Snack**: Snack images
- **Side**: Side dish images
- **Dal**: Dal/lentil images

## How to Add/Change Images Manually

### Method 1: Using Unsplash Image IDs (Current Method)

1. **Find Images on Unsplash**:
   - Go to [Unsplash.com](https://unsplash.com)
   - Search for your food category (e.g., "pizza", "indian curry", "dessert")
   - Click on an image you like
   - Look at the URL: `https://unsplash.com/photos/PHOTO_ID`
   - Copy the `PHOTO_ID` (the part after `/photos/`)

2. **Add to Menu.jsx**:
   - Open `frontend/src/pages/Menu.jsx`
   - Find the `categoryImages` object (around line 11)
   - Add your image ID to the appropriate category array:

```javascript
'Pizza': [
  'photo-1513104890138-7c749659a591', // Existing
  'photo-1565299624946-b28f40a0ae38', // Existing
  'YOUR_NEW_PHOTO_ID_HERE'            // Add your new image ID
],
```

3. **Image Format**:
   - Unsplash image URLs follow this pattern: `https://images.unsplash.com/PHOTO_ID?w=400&h=300&fit=crop&q=80`
   - The code automatically formats it correctly

### Method 2: Using Direct Image URLs

If you want to use images from other sources or your own server:

1. **Modify the `getFoodImage` function** in `Menu.jsx`:

```javascript
const getFoodImage = (name, category) => {
  // Option 1: Use your own image URLs
  const customImages = {
    'Pizza': [
      'https://your-server.com/images/pizza1.jpg',
      'https://your-server.com/images/pizza2.jpg',
    ],
    'Beverage': [
      'https://your-server.com/images/drink1.jpg',
    ],
    // ... other categories
  };
  
  const categoryImageUrls = customImages[category] || customImages['Curry'];
  return categoryImageUrls[Math.floor(Math.random() * categoryImageUrls.length)];
};
```

2. **Or use item-specific images**:

```javascript
const getFoodImage = (name, category) => {
  // Map specific items to specific images
  const itemImageMap = {
    'Margherita Pizza': 'https://your-server.com/images/margherita.jpg',
    'Butter Chicken': 'https://your-server.com/images/butter-chicken.jpg',
    // ... more items
  };
  
  if (itemImageMap[name]) {
    return itemImageMap[name];
  }
  
  // Fallback to category images
  // ... existing category logic
};
```

### Method 3: Store Images in Database

1. **Add imageUrl field to MenuItem model**:
   - Edit `backend/models/menuItem.js`
   - Add: `imageUrl: { type: DataTypes.STRING }`

2. **Update the frontend**:
   - In `Menu.jsx`, check if item has `imageUrl`:
   
```javascript
const getFoodImage = (name, category, imageUrl) => {
  // Use database image if available
  if (imageUrl) {
    return imageUrl;
  }
  
  // Otherwise use category-based images
  // ... existing logic
};

// In the component:
<img
  src={getFoodImage(item.name, item.category, item.imageUrl)}
  // ...
/>
```

3. **Add images when creating menu items**:
   - When adding a menu item through the form, include the image URL
   - Or update existing items via the database/API

## Image Requirements

- **Recommended Size**: 400x300 pixels (or 4:3 aspect ratio)
- **Format**: JPG, PNG, or WebP
- **File Size**: Keep under 500KB for fast loading
- **Content**: High-quality food photography works best

## Tips for Best Results

1. **Consistent Style**: Use images with similar lighting and style for a cohesive look
2. **Category Matching**: Ensure images match the food category
3. **Multiple Options**: Add 3-5 images per category for variety
4. **Fallback**: Always have a fallback (emoji or placeholder) for failed loads

## Testing Images

After adding new images:
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Refresh the menu page
3. Check browser console for any image loading errors
4. Verify images display correctly on different screen sizes

## Current Image Sources

All images currently come from Unsplash, which provides free, high-quality stock photos. No attribution required, but you can credit Unsplash if desired.

