# Alchemy Pieces Management

Professional admin interface for managing alchemy art pieces with full CRUD operations.

## Features

### 🔍 Search & Filter

- **Search**: Real-time search by piece name
- **Filter**: Filter by availability status (All, Available, Sold)
- **Sort**: Click column headers to sort by:
  - Name (alphabetical)
  - Price (numerical)
  - Created date (chronological)

### ✨ CRUD Operations

#### Create New Piece

- Click "Create New" button
- Fill in the form:
  - **Name** (required): The display name of the piece
  - **Slug**: URL-friendly identifier (auto-generated from name if empty)
  - **Dimensions**: Physical dimensions (e.g., "24 x 36 inches")
  - **Price**: Price in USD
  - **Palette**: Comma-separated hex colors for glow effects (e.g., "#FF5733, #33FF57")
  - **Images**: Add image URLs (one per line, paste and click upload icon)
  - **Available**: Toggle availability status

#### Edit Existing Piece

- Click "Edit" button on any piece in the table
- Modify any fields
- Click "Update" to save changes

#### Delete Piece

- Click "Delete" button on any piece
- Review the confirmation dialog
- Confirm deletion (cannot be undone)

### 📊 Data Table

- Displays all pieces with key information
- Shows thumbnail preview
- Color-coded status badges (green = available, gray = sold)
- Responsive design for mobile and desktop

### 🔒 Security

- Admin-only access (protected by NextAuth)
- Automatic redirect if not authenticated as admin
- Validates admin email against `ADMIN_EMAIL` environment variable

## Usage

1. **Access**: Navigate to `/manage` while logged in as admin
2. **Browse**: View all pieces in the data table
3. **Search**: Use search bar to find specific pieces
4. **Filter**: Select status filter to narrow results
5. **Sort**: Click column headers to sort data
6. **Create**: Click "Create New" to add a piece
7. **Edit**: Click "Edit" to modify a piece
8. **Delete**: Click "Delete" to remove a piece

## Technical Details

### Files Structure

```
src/app/manage/
├── page.js              # Server component (auth check, data fetch)
├── ManageClient.js      # Main client component (table, search, filter)
├── CreateEditModal.js   # Create/Edit modal with form
├── DeleteConfirmModal.js # Delete confirmation modal
└── README.md           # This file
```

### Database Schema

Uses `alchemy_pieces` table with fields:

- `id`: UUID (primary key)
- `name`: Text (piece name)
- `slug`: Text (URL slug)
- `images`: JSON array (image URLs)
- `available`: Boolean (availability status)
- `dimensions`: Text (physical dimensions)
- `palette`: JSON array (hex colors)
- `price`: Numeric (price in USD)
- `created_at`: Timestamp

### Dependencies

- Next.js App Router
- Supabase (database & auth)
- NextAuth (authentication)
- Lucide React (icons)
- Tailwind CSS (styling)
- Framer Motion (animations)

## Tips

### Adding Images

- Use Cloudinary, Imgur, or any CDN for hosting images
- Paste URLs one per line in the image URL textarea
- First image in array is used as the main/thumbnail image
- Images support HTTP/HTTPS URLs

### Palette Colors

- Use hex color codes (e.g., `#FF5733`)
- Separate multiple colors with commas
- First colors have more prominent glow effects
- Up to 5 colors recommended for best visual effect

### Slug Generation

- Leave slug empty to auto-generate from name
- Manual slugs should be lowercase, hyphen-separated
- Slugs must be unique (used in URLs like `/alchemy/slug-name`)

## Future Enhancements

- Bulk operations (select multiple pieces)
- Image upload directly to storage
- Color picker for palette selection
- Duplicate piece functionality
- Export/Import CSV
- Analytics dashboard
