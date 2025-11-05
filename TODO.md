# TODO: Refine Settings Section in Admin Panel

## Tasks

- [x] Add editable Password field to the settings form in index.html
- [x] Replace the Website Theme select dropdown with a toggle switch (Light/Dark Mode)
- [x] Update admin.js to handle password field in form submission
- [x] Implement dynamic theme switching with the toggle switch
- [x] Ensure form submission updates Username, Email, and Password in the database
- [x] Test the changes for functionality

## Notes

- Backend (settings.php and server.js) already supports profile_password updates.
- Use CSS for toggle switch styling.
- On toggle change, apply theme immediately and update the hidden form field for site_theme.
